'use strict';

module.exports = {
  secure: {
    ssl: Boolean(process.env.ssl) || false,
    privateKey: './config/sslcerts/key.pem',
    certificate: './config/sslcerts/cert.pem'
  },
  port: process.env.PORT || 8443,
  db: {
    name: process.env.DB_NAME || "",
    host: process.env.DB_HOST || "",
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    dialect: process.env.DB_DIALECT || "postgres", //mysql, postgres, sqlite3,...
    enableSequelizeLog: process.env.DB_LOG || false,
    ssl: process.env.DB_SSL || false,
    sync: process.env.DB_SYNC || false //Synchronizing any model changes with database
  },
  redis: {
    host: process.env.REDIS_HOST || "",
    url: process.env.REDIS_URL || "",
    port: process.env.REDIS_PORT || 16096,
    database: parseInt(process.env.REDIS_DATABASE) || 0,
    password: process.env.REDIS_PASSWORD || "",
  },
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'combined',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      stream: 'access.log'
    }
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || '2020739244859709',
    clientSecret: process.env.FACEBOOK_SECRET || '2d6175200779107281650d15df954c9c',
    callbackURL: '/api/auth/facebook/callback'
  },
  mailer: {
    from: process.env.MAILER_FROM || 'MOP Questionnaire',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'Yandex',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'mopquestionnaire',
        pass: process.env.MAILER_PASSWORD || '8563tr5ba1!j1t@'
      }
    }
  }
};