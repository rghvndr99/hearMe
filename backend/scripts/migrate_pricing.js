import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Plan from '../src/models/Plan.js';
import WalletPack from '../src/models/WalletPack.js';
import Addon from '../src/models/Addon.js';
import Setting from '../src/models/Setting.js';
import UiText from '../src/models/UiText.js';

// Load .env (from repo root)
const rootEnvPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(rootEnvPath)) dotenv.config({ path: rootEnvPath });

async function run() {
  try {
    const pricingFile = process.env.PRICING_FILE || path.resolve(process.cwd(), 'voicelap_pricing_v2.json');
    if (!fs.existsSync(pricingFile)) {
      throw new Error(`Pricing file not found at ${pricingFile}. Set PRICING_FILE or place voicelap_pricing_v2.json at repo root.`);
    }
    const raw = fs.readFileSync(pricingFile, 'utf8');
    const cfg = JSON.parse(raw);

    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/voicelap';
    const dbName = process.env.MONGO_DB || undefined; // if provided, Mongoose will use it from URI
    console.log(`[migrate_pricing] Connecting to MongoDB...`);
    await mongoose.connect(uri, dbName ? { dbName } : {});

    console.log('[migrate_pricing] Upserting plans...');
    if (Array.isArray(cfg.plans)) {
      for (const p of cfg.plans) {
        await Plan.updateOne({ plan_id: p.plan_id }, { $set: p }, { upsert: true });
      }
    }

    console.log('[migrate_pricing] Upserting wallet packs...');
    if (Array.isArray(cfg.wallet_packs)) {
      for (const w of cfg.wallet_packs) {
        await WalletPack.updateOne({ pack_id: w.pack_id }, { $set: w }, { upsert: true });
      }
    }

    console.log('[migrate_pricing] Upserting addons...');
    if (Array.isArray(cfg.addons)) {
      for (const a of cfg.addons) {
        await Addon.updateOne({ addon_id: a.addon_id }, { $set: a }, { upsert: true });
      }
    }

    console.log('[migrate_pricing] Saving settings and UI texts...');
    if (cfg.settings) {
      await Setting.updateOne({ key: 'app' }, { $set: { value: cfg.settings } }, { upsert: true });
    }
    if (cfg.ui_texts) {
      await UiText.updateOne({ key: 'pricing' }, { $set: { value: cfg.ui_texts } }, { upsert: true });
    }

    console.log('[migrate_pricing] Done.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('[migrate_pricing] Error:', err);
    process.exitCode = 1;
  }
}

run();

