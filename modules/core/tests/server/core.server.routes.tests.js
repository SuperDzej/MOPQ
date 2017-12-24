'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, adminCredentials, admin;

/**
 * User routes tests
 */
describe('Core URI tests', function () {
  before(function (done) {
    // Get application
    app = express.init(sequelize);
    agent = request.agent(app);

    done();
  });

  it('should render server error page when triggered', function (done) {
    agent.get('/server-error')
      .expect(500)
      .end(function (signupErr, signupRes) {
        // Handle signpu error
        if (signupErr) {
          return done(signupErr);
        }

        return done();
      });
  });

  it('should return error html if invalid POST url is triggered', function (done) {
    agent.post('/api/auth/user/load')
      .expect(404)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        should.equal(signinRes.res.text, '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Error</title>\n</head>\n<body>\n<pre>Cannot POST /api/auth/user/load</pre>\n</body>\n</html>\n');

        done();
      });
  });

  it('should return not found page if invalid GET url is triggered', function (done) {
    agent.get('/api/auth/user/load')
      .expect(404)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        signinRes.res.text.should.containEql('/api/auth/user/load is not a valid path');
        done();
      });
  });

  it('should render index page when triggered', function (done) {
    agent.get('/')
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
        done();
      });
  });
});

describe('Core error service tests', function () {

  it('should be able to return error message when passed correct error object', function (done) {
    let message = errorHandler.getErrorMessage({
      errors: [{
        message: 'This is some message of error'
      }]
    });
    should.equal(message, 'This is some message of error');
    done();
  });


  it('should be able to return unique error message when passed correct error object', function (done) {
    let message = errorHandler.getErrorMessage({
      code: 11000,
      errmsg: 'This is some message of error'
    });
    should.equal(message, 'T already exists');
    done();
  });

  it('should be able to return custom message when error code is invalid', function (done) {
    let message = errorHandler.getErrorMessage({
      code: 16252,
      errmsg: 'This is some message of error'
    });
    should.equal(message, 'Something went wrong');
    done();
  });

  it('should be able to return error message if unique field already exists in error', function (done) {
    let message = errorHandler.getErrorMessage({
      code: 11000,
      errmsg: undefined
    });
    should.equal(message, 'Unique field already exists');
    done();
  });
  /*
    it('should be able to retrieve a list of users if admin', function (done) {
      adminCredentials.email = dbUser.email;
      agent.post('/api/auth/signin')
        .send(adminCredentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Request list of users
          agent.get('/api/admin/users')
            .expect(200)
            .end(function (usersGetErr, usersGetRes) {
              if (usersGetErr) {
                return done(usersGetErr);
              }
              // We have db User and req User that was created via signup form
              usersGetRes.body.should.be.instanceof(Array).and.have.lengthOf(2);

              // Call the assertion callback
              return done();
            });
        });
    });*/
});
