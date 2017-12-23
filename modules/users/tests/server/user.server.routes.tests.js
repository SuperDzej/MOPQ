'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user,
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, reqUser, dbUser, adminCredentials, admin;

/**
 * User routes tests
 */
describe('User CRUD tests', function () {
  before(function (done) {
    // Get application
    app = express.init(sequelize);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      email: 'test@test.com',
      password: 'S3@n.jsI$Aw3$0m3'
    };

    adminCredentials = JSON.parse(JSON.stringify(credentials));

    reqUser = {};
    // Need to add new user because PostgreSQL can not increment id on same user data
    reqUser.firstName = 'First';
    reqUser.lastName = 'Name';
    reqUser.roles = ["admin", "user"];
    reqUser.email = 'test@gmail.com';
    reqUser.password = credentials.password;

    // Create a new user
    dbUser = User.build(reqUser);
    dbUser.provider = 'local';
    dbUser.salt = dbUser.makeSalt();
    dbUser.hashedPassword = dbUser.encryptPassword(credentials.password, dbUser.salt);
    dbUser.displayName = dbUser.firstName + ' ' + dbUser.lastName;

    // Save a user to the test db and create new questionnaire
    dbUser.save().then(function (err) {
      should.not.exist((err) ? null : 'false');
      done();
    }).catch(function (err) {
      done(err);
    });
  });

  it('should be able to register a new user', function (done) {
    reqUser.email = credentials.email;
    agent.post('/api/auth/signup')
      .send(reqUser)
      .expect(200)
      .end(function (signupErr, signupRes) {
        // Handle signpu error
        if (signupErr) {
          return done(signupErr);
        }

        signupRes.body.email.should.equal(reqUser.email);
        // Assert a proper profile image has been set, even if by default
        signupRes.body.profileImageURL.should.not.be.empty();
        // Assert we have just the default 'user' role
        signupRes.body.roles.should.be.instanceof(Array).and.have.lengthOf(1);
        signupRes.body.roles.indexOf('user').should.equal(0);
        return done();
      });
  });

  it('should be able to login successfully and logout successfully', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Logout
        agent.get('/api/auth/signout')
          .expect(302)
          .end(function (signoutErr, signoutRes) {
            if (signoutErr) {
              return done(signoutErr);
            }

            signoutRes.redirect.should.equal(true);
            signoutRes.text.should.equal('Found. Redirecting to /');
            return done();
          });
      });
  });

  it('should be able to retrieve self user info when logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Request list of users
        agent.get('/api/user/me')
          .expect(200)
          .end(function (usersGetErr, usersGetRes) {
            if (usersGetErr) {
              return done(usersGetErr);
            }

            return done();
          });
      });
  });

  it('should be able to retrieve a list of users if not admin', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Request list of users
        agent.get('/api/admin/users')
          .expect(403)
          .end(function (usersGetErr, usersGetRes) {
            if (usersGetErr) {
              return done(usersGetErr);
            }

            return done();
          });
      });
  });

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
  });

  it('should be able to delete a single user if admin', function (done) {
    // Creating new user which will be admin and used to delete old db User
    let localUser = User.build(reqUser);
    localUser.roles = ['user', 'admin'];
    localUser.email = 'email@email.com';
    localUser.provider = 'local';
    localUser.salt = localUser.makeSalt();
    localUser.hashedPassword = localUser.encryptPassword(credentials.password, localUser.salt);
    localUser.displayName = dbUser.firstName + ' ' + dbUser.lastName;
    localUser.id = 6;
    credentials.email = localUser.email;

    localUser.save().then(function (user) {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          agent.delete('/api/admin/users/' + dbUser.id)
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
    }).catch(function (err) {
      should.exist(err);
      done(err);
    });
  });

  afterEach(function (done) {
    dbUser.destroy().then(function () {
      done();
    }).catch(function (err) {
      done();
    });
  });

  // At the end delete all users from db to avoid leaving users that are registered via post request in database
  after(function (done) {
    User.destroy({
      where: {},
      truncate: true
    }).then(function (success) {
      done();
    }).catch(function (err) {
      console.log(err);
      done();
    });
  });
});
