'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  secure: {
    ssl: Boolean(process.env.ssl) || false,
    privateKey: './config/sslcerts/key.pem',
    certificate: './config/sslcerts/cert.pem'
  },
  db: {
    name: process.env.DB_NAME || "mopquestionnaire_dev",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
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
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      //stream: 'access.log'
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development'
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
  },
  livereload: true,
  questionTypes: [{
    type: 'text',
    description: 'Text',
    numOptions: 1,
    numCorrect: 1
  }, {
    type: 'yesNo',
    description: 'Yes - No',
    numOptions: 2,
    numCorrect: 1
  }, {
    type: 'multiChoice',
    description: 'Multiple Choice'
  }, {
    type: 'singleChoice',
    description: 'Single Choice',
    numCorrect: 1
  }]
};
