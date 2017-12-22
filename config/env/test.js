'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  port: process.env.PORT || 3001,
  db: {
    name: process.env.DB_NAME || "mop_test",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "98526@bo.Marza13",
    dialect: process.env.DB_DIALECT || "postgres", //mysql, postgres, sqlite3,...
    enableSequelizeLog: process.env.DB_LOG || false,
    ssl: process.env.DB_SSL || false,
    sync: process.env.DB_SYNC || true //Synchronizing any model changes with database
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    database: process.env.REDIS_DATABASE || 0,
    password: process.env.REDIS_PASSWORD || "",
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Test Environment'
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || '2020739244859709',
    clientSecret: process.env.FACEBOOK_SECRET || '2d6175200779107281650d15df954c9c',
    callbackURL: '/api/auth/facebook/callback'
  },
  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  }
};