// Environment Configuration
// Manages different configurations for dev, staging, and production

const environments = {
  development: {
    name: 'development',
    port: 5001,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/voicelap',
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
    jwtExpiresIn: '7d',
    jwtAnonExpiresIn: '12h',
    anonTtlHours: 24,
    
    // Rate limiting
    rateLimit: {
      windowMs: 60000, // 1 minute
      max: 100, // More lenient for development
    },
    
    // Feature flags
    features: {
      voiceCleanup: true,
      emailNotifications: false, // Disabled in dev
      analytics: false,
    },
    
    // Logging
    logging: {
      level: 'debug',
      prettyPrint: true,
    },
    
    // External APIs
    apis: {
      openai: {
        key: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        maxTokens: 500,
      },
      elevenlabs: {
        key: process.env.ELEVENLABS_API_KEY,
        voiceId: process.env.ELEVENLABS_VOICE_ID || '5q4xxe8vzXfk4ucsAjt9',
      },
      deepgram: {
        key: process.env.DEEPGRAM_API_KEY,
      },
      resend: {
        key: process.env.RESEND_API_KEY,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/google/callback',
        calendarEmail: process.env.GOOGLE_CALENDAR_EMAIL,
        adminAccessToken: process.env.GOOGLE_ADMIN_ACCESS_TOKEN,
        adminRefreshToken: process.env.GOOGLE_ADMIN_REFRESH_TOKEN,
      },
    },
  },

  staging: {
    name: 'staging',
    port: process.env.PORT || 5001,
    mongoUri: process.env.MONGO_URI, // Must be set in .env.staging
    frontendOrigin: process.env.FRONTEND_ORIGIN, // Must be set
    jwtSecret: process.env.JWT_SECRET, // Must be set
    jwtExpiresIn: '7d',
    jwtAnonExpiresIn: '12h',
    anonTtlHours: 24,
    
    // Rate limiting - moderate
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      max: parseInt(process.env.RATE_LIMIT_MAX || '80'),
    },
    
    // Feature flags
    features: {
      voiceCleanup: true,
      emailNotifications: true,
      analytics: true,
    },
    
    // Logging
    logging: {
      level: 'info',
      prettyPrint: false,
    },
    
    // External APIs
    apis: {
      openai: {
        key: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        maxTokens: 500,
      },
      elevenlabs: {
        key: process.env.ELEVENLABS_API_KEY,
        voiceId: process.env.ELEVENLABS_VOICE_ID,
      },
      deepgram: {
        key: process.env.DEEPGRAM_API_KEY,
      },
      resend: {
        key: process.env.RESEND_API_KEY,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        calendarEmail: process.env.GOOGLE_CALENDAR_EMAIL,
        adminAccessToken: process.env.GOOGLE_ADMIN_ACCESS_TOKEN,
        adminRefreshToken: process.env.GOOGLE_ADMIN_REFRESH_TOKEN,
      },
    },
  },

  production: {
    name: 'production',
    port: process.env.PORT || 5001,
    mongoUri: process.env.MONGO_URI, // Must be MongoDB Atlas URI
    frontendOrigin: process.env.FRONTEND_ORIGIN, // Must be production domain
    jwtSecret: process.env.JWT_SECRET, // Must be strong secret
    jwtExpiresIn: '7d',
    jwtAnonExpiresIn: '12h',
    anonTtlHours: 24,
    
    // Rate limiting - strict
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      max: parseInt(process.env.RATE_LIMIT_MAX || '60'),
    },
    
    // Feature flags
    features: {
      voiceCleanup: true,
      emailNotifications: true,
      analytics: true,
    },
    
    // Logging
    logging: {
      level: 'warn',
      prettyPrint: false,
    },
    
    // External APIs
    apis: {
      openai: {
        key: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        maxTokens: 500,
      },
      elevenlabs: {
        key: process.env.ELEVENLABS_API_KEY,
        voiceId: process.env.ELEVENLABS_VOICE_ID,
      },
      deepgram: {
        key: process.env.DEEPGRAM_API_KEY,
      },
      resend: {
        key: process.env.RESEND_API_KEY,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        calendarEmail: process.env.GOOGLE_CALENDAR_EMAIL,
        adminAccessToken: process.env.GOOGLE_ADMIN_ACCESS_TOKEN,
        adminRefreshToken: process.env.GOOGLE_ADMIN_REFRESH_TOKEN,
      },
    },
  },
};

/**
 * Get configuration for current environment
 * @returns {Object} Environment configuration
 */
export function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  const config = environments[env];

  if (!config) {
    throw new Error(`Invalid NODE_ENV: ${env}. Must be one of: development, staging, production`);
  }

  // Validate required fields in production/staging
  if (env === 'production' || env === 'staging') {
    const required = ['mongoUri', 'frontendOrigin', 'jwtSecret'];
    const missing = required.filter(field => !config[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables for ${env}: ${missing.join(', ')}`);
    }
  }

  return config;
}

/**
 * Check if current environment is production
 * @returns {boolean}
 */
export function isProduction() {
  return (process.env.NODE_ENV || 'development') === 'production';
}

/**
 * Check if current environment is development
 * @returns {boolean}
 */
export function isDevelopment() {
  return (process.env.NODE_ENV || 'development') === 'development';
}

/**
 * Check if current environment is staging
 * @returns {boolean}
 */
export function isStaging() {
  return (process.env.NODE_ENV || 'development') === 'staging';
}

export default getConfig();
