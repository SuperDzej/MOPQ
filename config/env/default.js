'use strict';

module.exports = {
  app: {
    title: 'MOPQ',
    description: 'Simple Questionnaire App',
    keywords: 'sequelizejs, expressjs, angularjs, nodejs, postgresql, mysql, sqlite3, passport, redis, socket.io',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || '',
    reCaptchaSecret: process.env.RECAPTCHA_SECRET || 'fdsfds'
  },
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
  // Session Cookie settings
  sessionCookie: {
    // session expiration is set by default to 24 hours
    maxAge: 24 * (60 * 60 * 1000),
    // httpOnly flag makes sure the cookie is only accessed
    // through the HTTP protocol and not JS/browser
    httpOnly: true,
    // secure cookie should be turned to true to provide additional
    // layer of security so that the cookie is set only when working
    // in HTTPS mode.
    secure: Boolean(process.env.ssl) || true
  },
  // sessionSecret should be changed for security measures and concerns
  sessionSecret: 'MopQuestionnaire123@#456!',
  // sessionKey is set to the generic sessionId key used by PHP applications
  // for obsecurity reasons
  sessionKey: 'MopQSes324@42.@23',
  sessionCollection: 'sessions',
  logo: 'modules/core/client/img/brand/logo.png',
  favicon: 'modules/core/client/img/brand/favicon.ico',
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