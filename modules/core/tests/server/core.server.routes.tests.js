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

  it('should return not found if invalid url is triggered', function (done) {
    agent.post('/api/auth/signin/invalid')
      .expect(404)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
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

  it('should be able to return unique error message', function (done) {
    let message = errorHandler.getErrorMessage(new Error('Some random message!'));
    should.equal(message, '');
    done(message);
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
  });

  it('should be able to get a single user details if admin', function (done) {
    adminCredentials.email = dbUser.email;
    agent.post('/api/auth/signin')
      .send(adminCredentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get single user information from the database
        agent.get('/api/admin/users/' + dbUser.id)
          .expect(200)
          .end(function (userInfoErr, userInfoRes) {
            if (userInfoErr) {
              return done(userInfoErr);
            }

            userInfoRes.body.should.be.instanceof(Object);
            userInfoRes.body.id.should.be.equal(dbUser.id);

            // Call the assertion callback
            return done();
          });
      });
  });

  it('should be able to update a single user details if admin', function (done) {
    adminCredentials.email = dbUser.email;
    agent.post('/api/auth/signin')
      .send(adminCredentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get single user information from the database
        var userUpdate = {
          firstName: 'admin_update_first',
          lastName: 'admin_update_last',
          roles: ['admin']
        };

        agent.put('/api/admin/users/' + dbUser.id)
          .send(userUpdate)
          .expect(200)
          .end(function (userInfoErr, userInfoRes) {
            if (userInfoErr) {
              return done(userInfoErr);
            }

            userInfoRes.body.should.be.instanceof(Object);
            userInfoRes.body.firstName.should.be.equal('admin_update_first');
            userInfoRes.body.lastName.should.be.equal('admin_update_last');
            userInfoRes.body.roles.should.be.instanceof(Array).and.have.lengthOf(1);
            userInfoRes.body.id.should.be.equal(dbUser.id);

            // Call the assertion callback
            return done();
          });
      });
  });*/
});
