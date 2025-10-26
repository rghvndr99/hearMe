// Central membership plan configuration
// Limits here are soft caps used for UI and checks; business logic can enforce as needed

export const MEMBERSHIP_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    features: {
      voiceTwins: { label: 'Custom voices', limit: 0 },
      chatMinutes: { label: 'Chat minutes', limit: 30, period: 'week' },
      micEnabled: { label: 'Microphone access', enabled: false },
    },
  },
  care: {
    id: 'care',
    name: 'Care',
    features: {
      voiceTwins: { label: 'Custom voices', limit: 2 },
      chatMinutes: { label: 'Chat minutes', limit: 300, period: 'month' },
      micEnabled: { label: 'Microphone access', enabled: true },
    },
  },
  companion: {
    id: 'companion',
    name: 'Companion',
    features: {
      voiceTwins: { label: 'Custom voices', limit: 5 },
      chatMinutes: { label: 'Chat minutes', limit: -1, period: 'unlimited' }, // -1 indicates unlimited
      micEnabled: { label: 'Microphone access', enabled: true },
    },
  },
};

export function getPlanConfig(planId) {
  return MEMBERSHIP_PLANS[planId] || MEMBERSHIP_PLANS.free;
}

// Feature flags: allow toggling enforcement without code changes
// Env overrides (true/false/1/0/yes/no/on/off)
const envBool = (name, def) => {
  const v = String(process.env[name] || '').toLowerCase();
  if (['true','1','yes','on'].includes(v)) return true;
  if (['false','0','no','off'].includes(v)) return false;
  return def;
};

export const FEATURE_FLAGS = {
  enforce: {
    chatLimits: envBool('HM_ENFORCE_CHAT_LIMITS', false),
    micGating: envBool('HM_ENFORCE_MIC_GATING', false),
    voiceTwinLimits: envBool('HM_ENFORCE_VOICETWIN_LIMITS', true),
  },
  promoLabels: envBool('HM_PROMO_LABELS', true),
};


