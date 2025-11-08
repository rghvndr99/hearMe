import express from 'express';
import Plan from '../models/Plan.js';
import WalletPack from '../models/WalletPack.js';
import Addon from '../models/Addon.js';
import Setting from '../models/Setting.js';
import UiText from '../models/UiText.js';

const router = express.Router();

// Simple in-memory cache
let cache = { data: null, at: 0 };
const CACHE_TTL_MS = parseInt(process.env.PRICING_CACHE_TTL_MS || '60000', 10);

function pluckFeatureBullets(p) {
  const f = p?.features || {};
  const bullets = [];
  const v = f.voice || {};
  const hc = f.human_care || {};

  // Text chat
  if (f.ai_chat_text === 'unlimited') bullets.push('Unlimited text chat');
  else if (typeof f.ai_chat_text === 'number') bullets.push(`${f.ai_chat_text} text messages/month`);

  // Voice minutes with default voices (legacy key)
  if (f.ai_chat_voice_with_default_voices === 'unlimited') bullets.push('Unlimited voice minutes');
  else if (typeof f.ai_chat_voice_with_default_voices === 'number') bullets.push(`${f.ai_chat_voice_with_default_voices} voice minutes/month`);

  // Default voices count (new nested or legacy top-level)
  if (typeof v.default_voices_in_library === 'number') bullets.push(`${v.default_voices_in_library} default voices in library`);
  else if (typeof f.default_voices_in_library === 'number') bullets.push(`${f.default_voices_in_library} default voices in library`);

  // Voice cloning (new nested)
  if (v.create_voice_clone === true) bullets.push('Voice cloning allowed');
  if (typeof v.group_voice_clone === 'number' && v.group_voice_clone > 0) bullets.push(`Group voice clones: ${v.group_voice_clone}`);
  const steadyGroup = v['group_voice_clone_steady'] ?? v['group_voice_clone_steady:'];
  if (steadyGroup === true) bullets.push('Group cloning: steady quality');
  if (typeof v.voice_clone_from_audio === 'number' && v.voice_clone_from_audio > 0) bullets.push(`Clone from audio: ${v.voice_clone_from_audio}`);
  if (v.voice_clone_steady === true) bullets.push('Steady/high-quality cloning');
  if (v.voice_clone_from_group_allowed === true) bullets.push('Group-based cloning allowed');

  // Voice cloning (legacy top-level)
  if (f.voice_cloning_allowed === true) {
    if (typeof f.voice_clones_included === 'number') bullets.push(`${f.voice_clones_included} voice clones included`);
    else bullets.push('Voice cloning allowed');
  } else if (f.voice_cloning_allowed === false) {
    bullets.push('Custom voice cloning not included');
  }

  // Custom voice usage minutes (nested or legacy)
  if (typeof v.custom_voice_use_minutes_per_month === 'number') bullets.push(`${v.custom_voice_use_minutes_per_month} custom voice minutes/month`);
  if (v.custom_voice_use_minutes_per_month === 'unlimited') bullets.push('Unlimited custom voice usage');
  if (typeof f.custom_voice_use_minutes_per_month === 'number') bullets.push(`${f.custom_voice_use_minutes_per_month} custom voice minutes/month`);
  if (f.custom_voice_use_minutes_per_month === 'unlimited') bullets.push('Unlimited custom voice usage');

  // Human care
  if (hc.available === true) {
    if (typeof hc.sessions_per_month === 'number' && hc.sessions_per_month > 0) bullets.push(`Human care: ${hc.sessions_per_month}/month`);
    if (typeof hc.sessions_shared_per_month === 'number' && hc.sessions_shared_per_month > 0) bullets.push(`Human care (shared): ${hc.sessions_shared_per_month}/month`);
    if (typeof hc.trial_sessions_total === 'number' && hc.trial_sessions_total > 0) bullets.push(`Trial human care sessions: ${hc.trial_sessions_total}`);
    if (Array.isArray(hc.session_mode) && hc.session_mode.length) bullets.push(`Human care modes: ${hc.session_mode.map(m => String(m).replaceAll('_',' ')).join(', ')}`);
    const pr = hc.scheduling_priority ?? hc.priority;
    if (pr) bullets.push(`Human care priority: ${String(pr).replaceAll('_',' ')}`);
    if (typeof hc.session_duration_minutes_default === 'number') bullets.push(`Default session duration: ${hc.session_duration_minutes_default} min`);
    if (hc.preferred_listener_option === true) bullets.push('Preferred listener option');
    if (hc.requires_temp_contact === true) bullets.push('Requires temporary contact for sessions');
    if (hc.notes) bullets.push(String(hc.notes));
  } else if (f.human_care && hc.available === false) {
    bullets.push('Human care not included');
  }

  // Emotion insights
  if (typeof f.emotion_insights === 'string' && f.emotion_insights) bullets.push(`Emotion insights: ${f.emotion_insights.replaceAll('_', ' ')}`);

  // Chat memory
  if (f.chat_memory?.enabled) {
    const scope = f.chat_memory.scope;
    const scopeText = typeof scope === 'number' ? `${scope} days` : String(scope || '').replaceAll('_',' ');
    bullets.push(`Chat memory: ${scopeText || 'enabled'}`);
  } else if (f.chat_memory && f.chat_memory.enabled === false) {
    bullets.push('Chat memory not included');
  }

  // Themes available (legacy; keep if present)
  if (Array.isArray(f.themes?.available)) bullets.push(`${f.themes.available.length} theme options`);
  if (f.themes?.customization) bullets.push(`Themes customization: ${String(f.themes.customization).replaceAll('_',' ')}`);

  // Storage & retention
  if (typeof f.storage?.voice_storage_days === 'number') bullets.push(`Voice storage: ${f.storage.voice_storage_days} days`);
  if (typeof f.storage?.chat_storage_days === 'number') bullets.push(`Chat storage: ${f.storage.chat_storage_days} days`);
  if (f.storage?.emotional_journal === true) bullets.push('Emotional journal');

  // Support level
  if (typeof f.support_level === 'string' && f.support_level) bullets.push(`Support level: ${f.support_level.replaceAll('_',' ')}`);

  return bullets;
}

async function loadPricing() {
  const now = Date.now();
  if (cache.data && now - cache.at < CACHE_TTL_MS) return cache.data;

  const [plans, packs, addons, settingDoc, uiDoc] = await Promise.all([
    Plan.find({}).sort({ price: 1 }).lean(),
    WalletPack.find({}).sort({ price: 1 }).lean(),
    Addon.find({}).sort({ price: 1 }).lean(),
    Setting.findOne({ key: 'app' }).lean(),
    UiText.findOne({ key: 'pricing' }).lean(),
  ]);

  const shapedPlans = plans.map((p) => ({
    plan_id: p.plan_id,
    display_name: p.display_name,
    short_name: p.short_name || p.display_name,
    price: p.price,
    currency: p.currency || 'INR',
    billing_cycle_days: p.billing_cycle_days || 30,
    anonymous_allowed: Boolean(p.anonymous_allowed),
    description: p.description || '',
    ui: p.ui || {},
    features: p.features || {},
    feature_bullets: pluckFeatureBullets(p),
  }));

  const data = {
    plans: shapedPlans,
    wallet_packs: packs || [],
    addons: addons || [],
    ui_texts: uiDoc?.value || {},
    settings: settingDoc?.value || {},
  };

  cache = { data, at: now };
  return data;
}

// GET /api/pricing
router.get('/pricing', async (req, res) => {
  try {
    const data = await loadPricing();
    res.json(data);
  } catch (err) {
    console.error('GET /api/pricing error', err);
    res.status(500).json({ error: 'Failed to load pricing' });
  }
});

// GET /api/plans/:plan_id
router.get('/plans/:plan_id', async (req, res) => {
  try {
    const plan = await Plan.findOne({ plan_id: req.params.plan_id }).lean();
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ ...plan, feature_bullets: pluckFeatureBullets(plan) });
  } catch (err) {
    console.error('GET /api/plans/:plan_id error', err);
    res.status(500).json({ error: 'Failed to load plan' });
  }
});

// GET /api/ui-texts
router.get('/ui-texts', async (req, res) => {
  try {
    const uiDoc = await UiText.findOne({ key: 'pricing' }).lean();
    res.json(uiDoc?.value || {});
  } catch (err) {
    console.error('GET /api/ui-texts error', err);
    res.status(500).json({ error: 'Failed to load UI texts' });
  }
});

export default router;

