'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  config = require(path.resolve('./config/config')),
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

  it('forgot password should return 400 for non-existent email', function (done) {
    agent.post('/api/auth/forgot')
      .send({
        email: 'amen@mail.com'
      })
      .expect(400)
      .end(function (err, res) {
        // Handle error
        if (err) {
          return done(err);
        }

        res.body.message.should.equal('No account with that email has been found');
        return done();
      });
  });

  it('forgot password should return 400 for empty email/email', function (done) {
    agent.post('/api/auth/forgot')
      .send({
        email: ''
      })
      .expect(400)
      .end(function (err, res) {
        // Handle error
        if (err) {
          return done(err);
        }

        res.body.message.should.equal('Username/email field must not be blank');
        return done();
      });
  });

  it('forgot password should return 400 for no email or email provided', function (done) {
    agent.post('/api/auth/forgot')
      .send({})
      .expect(400)
      .end(function (err, res) {
        // Handle error
        if (err) {
          return done(err);
        }

        res.body.message.should.equal('Username/email field must not be blank');
        return done();
      });
  });

  it('forgot password should return 400 for non-local provider set for the user object', function (done) {
    let localUser = User.build(reqUser);
    localUser.roles = ['user'];
    localUser.email = 'facebook-email@email.com';
    localUser.provider = 'facebook';
    localUser.displayName = dbUser.firstName + ' ' + dbUser.lastName;
    localUser.id = 7;
    localUser.save()
      .then(function (user) {
        agent.post('/api/auth/forgot')
          .send({
            email: user.email
          })
          .expect(400)
          .end(function (err, res) {
            // Handle error
            if (err) {
              return done(err);
            }

            res.body.message.should.equal('It seems like you signed up using your ' + user.provider + ' account, please sign in using that provider.');
            return done();
          });
      }).catch(function (err) {
        done(err);
      });
  });

  // We are expecting 400 because we did reset password but there was problem with mail sending because we didn't provide mailer options in configuration and no need to send mail on every test.
  it('forgot password should be able to reset password for user password reset request using email', function (done) {
    this.timeout(5000);
    agent.post('/api/auth/forgot')
      .send({
        email: dbUser.email
      })
      .expect(400)
      .end(function (err, res) {
        // Handle error
        if (err) {
          return done(err);
        }

        User.findOne({
          where: {
            email: dbUser.email
          }
        }).then(function (userRes) {

          userRes.resetPasswordToken.should.not.be.empty();
          should.exist(userRes.resetPasswordExpires);
          res.body.message.should.be.equal('Failure sending email');
          return done();
        }).catch(function (err) {
          done(err);
        });
      });
  });

  it('forgot password should be able to reset the password using reset token', function (done) {
    agent.post('/api/auth/forgot')
      .send({
        email: credentials.email
      })
      .expect(400)
      .end(function (err, res) {
        // Handle error
        if (err) {
          return done(err);
        }

        User.findOne({
          where: {
            email: credentials.email
          }
        }).then(function (userRes) {
          userRes.resetPasswordToken.should.not.be.empty();
          should.exist(userRes.resetPasswordExpires);

          agent.get('/api/auth/reset/' + userRes.resetPasswordToken)
            .expect(302)
            .end(function (err, res) {
              // Handle error
              if (err) {
                return done(err);
              }

              res.headers.location.should.be.equal('/password/reset/' + userRes.resetPasswordToken);

              return done();
            });
        }).catch(function (err) {
          done(err);
        });
      });
  });

  it('forgot password should return error when using invalid reset token', function (done) {
    agent.post('/api/auth/forgot')
      .send({
        email: dbUser.email
      })
      .expect(400)
      .end(function (err, res) {
        // Handle error
        if (err) {
          return done(err);
        }

        var invalidToken = 'someTOKEN1234567890';
        agent.get('/api/auth/reset/' + invalidToken)
          .expect(302)
          .end(function (err, res) {
            // Handle error
            if (err) {
              return done(err);
            }

            res.headers.location.should.be.equal('/password/reset/invalid');

            return done();
          });
      });
  });

  it('should be able to change user own password successfully', function (done) {
    this.timeout(5000);
    credentials.email = dbUser.email;
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Change password
        agent.post('/api/user/password')
          .send({
            newPassword: '1234567890Aa$',
            verifyPassword: '1234567890Aa$',
            currentPassword: credentials.password
          })
          .expect(200)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.body.message.should.equal('Password changed successfully');
            return done();
          });
      });
  });

  it('should not be able to change user own password if wrong verifyPassword is given', function (done) {
    credentials.email = dbUser.email;
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Change password
        agent.post('/api/user/password')
          .send({
            newPassword: '1234567890Aa$',
            verifyPassword: '1234567890-ABC-123-Aa$',
            currentPassword: credentials.password
          })
          .expect(400)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.body.message.should.equal('Passwords do not match');
            return done();
          });
      });
  });

  it('should not be able to change user own password if wrong currentPassword is given', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Change password
        agent.post('/api/user/password')
          .send({
            newPassword: '1234567890Aa$',
            verifyPassword: '1234567890Aa$',
            currentPassword: 'some_wrong_passwordAa$'
          })
          .expect(400)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.body.message.should.equal('Current password is incorrect');
            return done();
          });
      });
  });

  it('should not be able to change user own password if no new password is at all given', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Change password
        agent.post('/api/user/password')
          .send({
            newPassword: '',
            verifyPassword: '',
            currentPassword: credentials.password
          })
          .expect(400)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.body.message.should.equal('Please provide a new password');
            return done();
          });
      });
  });

  it('should not be able to change user own password if not signed in', function (done) {
    // Ensure user is logged out
    agent.get('/api/auth/signout')
      .expect(302)
      .end(function (signoutErr, signoutRes) {
        // Change password
        agent.post('/api/user/password')
          .send({
            newPassword: '1234567890Aa$',
            verifyPassword: '1234567890Aa$',
            currentPassword: credentials.password
          })
          .expect(401)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.body.message.should.equal('User is not signed in');
            return done();
          });
      });

  });

  it('should be able to get own user details successfully', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get own user details
        agent.get('/api/user/me')
          .expect(200)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            res.body.should.be.instanceof(Object);
            res.body.email.should.equal(credentials.email);
            should.not.exist(res.body.salt);
            should.not.exist(res.body.password);
            return done();
          });
      });
  });

  it('should not be able to get any user details if not logged in', function (done) {
    // Ensure user is logged out
    agent.get('/api/auth/signout')
      .expect(302)
      .end(function (signoutErr, signoutRes) {
        // Get own user details
        agent.get('/api/user/me')
          .expect(401)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            should.equal(res.body.message, 'User is not signed in');
            return done();
          });
      });
  });

  it('should be able to update own user details', function (done) {
    // credentials.email = dbUser.email;
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        var userUpdate = {
          firstName: 'user_update_first',
          lastName: 'user_update_last'
        };

        agent.put('/api/user')
          .send(userUpdate)
          .expect(200)
          .end(function (userInfoErr, userInfoRes) {
            if (userInfoErr) {
              return done(userInfoErr);
            }

            userInfoRes.body.should.be.instanceof(Object);
            userInfoRes.body.firstName.should.be.equal('user_update_first');
            userInfoRes.body.lastName.should.be.equal('user_update_last');
            userInfoRes.body.roles.should.be.instanceof(Array).and.have.lengthOf(1);
            userInfoRes.body.roles.indexOf('user').should.equal(0);

            // Call the assertion callback
            return done();
          });
      });
  });

  it('should be able to update own user details but not add roles if not admin', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        var userUpdate = {
          firstName: 'user_update_first',
          lastName: 'user_update_last',
          roles: ['user', 'admin']
        };

        agent.put('/api/user')
          .send(userUpdate)
          .expect(200)
          .end(function (userInfoErr, userInfoRes) {
            if (userInfoErr) {
              return done(userInfoErr);
            }

            userInfoRes.body.should.be.instanceof(Object);
            userInfoRes.body.firstName.should.be.equal('user_update_first');
            userInfoRes.body.lastName.should.be.equal('user_update_last');
            userInfoRes.body.roles.should.be.instanceof(Array).and.have.lengthOf(1);
            userInfoRes.body.roles.indexOf('user').should.equal(0);
            // userInfoRes.body.id.should.be.equal(user.id);

            // Call the assertion callback
            return done();
          });
      });
  });

  it('should not be able to update own user details with existing email', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        var userUpdate = {
          firstName: 'user_update_first',
          lastName: 'user_update_last',
          email: dbUser.email
        };

        agent.put('/api/user')
          .send(userUpdate)
          .expect(400)
          .end(function (userInfoErr, userInfoRes) {
            if (userInfoErr) {
              return done(userInfoErr);
            }

            // Call the assertion callback
            userInfoRes.body.message.should.equal('Email already exists');

            return done();
          });
      });
  });

  it('should not be able to update secure fields', function (done) {
    let localUser = User.build(reqUser);
    localUser.roles = ['user'];
    localUser.email = 'local-email@email.com';
    localUser.provider = 'local';
    localUser.salt = localUser.makeSalt();
    localUser.hashedPassword = localUser.encryptPassword(credentials.password, localUser.salt);
    localUser.displayName = dbUser.firstName + ' ' + dbUser.lastName;
    localUser.id = 8;
    var resetPasswordToken = 'password-reset-token';
    localUser.resetPasswordToken = resetPasswordToken;
    localUser.save()
      .then(function (user) {
        agent.post('/api/auth/signin')
          .send(credentials)
          .expect(200)
          .end(function (signinErr, signinRes) {
            // Handle signin error
            if (signinErr) {
              return done(signinErr);
            }
            var userUpdate = {
              password: 'Aw3$0m3P@ssWord',
              salt: 'newsaltphrase',
              created: new Date(2000, 9, 9),
              resetPasswordToken: 'tweeked-reset-token'
            };

            // Get own user details
            agent.put('/api/user')
              .send(userUpdate)
              .expect(200)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }

                User.findOne({
                    where: {
                      id: localUser.id
                    }
                  })
                  .then(function (updatedUser) {
                    if (!updatedUser) {
                      return done();
                    }

                    updatedUser.hashedPassword.should.be.equal(localUser.hashedPassword);
                    updatedUser.salt.should.be.equal(localUser.salt);
                    updatedUser.createdAt.getTime().should.be.equal(localUser.createdAt.getTime());
                    updatedUser.resetPasswordToken.should.be.equal(resetPasswordToken);
                    done();
                  }).catch(function (err) {
                    done(err);
                  });
              });
          });
      }).catch(function (err) {
        console.log(err);
        done();
      });
  });

  it('should not be able to update own user details if not logged-in', function (done) {
    var userUpdate = {
      firstName: 'user_update_first',
      lastName: 'user_update_last'
    };

    agent.put('/api/user')
      .send(userUpdate)
      .expect(401)
      .end(function (userInfoErr, userInfoRes) {
        if (userInfoErr) {
          return done(userInfoErr);
        }

        userInfoRes.body.message.should.equal('User is not signed in');

        // Call the assertion callback
        return done();
      });
  });

  it('should not be able to update own user profile picture without being logged-in', function (done) {

    agent.post('/api/user/picture')
      .send({})
      .expect(401)
      .end(function (userInfoErr, userInfoRes) {
        if (userInfoErr) {
          return done(userInfoErr);
        }

        userInfoRes.body.message.should.equal('User is not signed in');

        // Call the assertion callback
        return done();
      });
  });

  it('should be able to change profile picture if signed in', function (done) {
    credentials.email = dbUser.email;
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/user/picture')
          .attach('newProfilePicture', './public/uploads/users/default.png')
          .expect(200)
          .end(function (userInfoErr, userInfoRes) {
            // Handle change profile picture error
            if (userInfoErr) {
              return done(userInfoErr);
            }

            userInfoRes.body.should.be.instanceof(Object);
            userInfoRes.body.profileImageURL.should.be.a.String();
            userInfoRes.body.id.should.be.equal(dbUser.id);

            return done();
          });
      });
  });

  it('should not be able to change profile picture if attach a picture with a different field name', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/user/picture')
          .attach('fieldThatDoesntWork', './public/uploads/users/default.png')
          .expect(422)
          .end(function (userInfoErr, userInfoRes) {
            done(userInfoErr);
          });
      });
  });

  it('should not be able to upload a non-image file as a profile picture', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/user/picture')
          .attach('newProfilePicture', './modules/users/tests/server/img/text-file.txt')
          .expect(422)
          .end(function (userInfoErr, userInfoRes) {
            done(userInfoErr);
          });
      });
  });

  it('should not be able to change profile picture to too big of a file', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/user/picture')
          .attach('newProfilePicture', './modules/users/tests/server/img/too-big-file.png')
          .expect(422)
          .end(function (userInfoErr, userInfoRes) {
            done(userInfoErr);
          });
      });
  });

  it('should be able to change profile picture and not fail if existing picture file does not exist', function (done) {
    let localUser = User.build(reqUser);
    localUser.roles = ['user'];
    localUser.email = 'local-picture-email@email.com';
    localUser.provider = 'local';
    localUser.salt = localUser.makeSalt();
    localUser.profileImageURL = config.uploads.profile.image.dest + 'non-existing.png';
    localUser.hashedPassword = localUser.encryptPassword(credentials.password, localUser.salt);
    localUser.displayName = dbUser.firstName + ' ' + dbUser.lastName;
    localUser.id = 9;
    localUser.save()
      .then(function (user) {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          agent.post('/api/user/picture')
            .attach('newProfilePicture', './public/uploads/users/default.png')
            .expect(200)
            .end(function (userInfoErr) {

              should.not.exist(userInfoErr);

              return done();
            });
        });
    }).catch(function (err) {
      done(err);
    });
  });

  afterEach(function (done) {
    dbUser.destroy().then(function () {
      // Ensure user is logged out
      agent.get('/api/auth/signout')
        .expect(302)
        .end(function (signoutErr, signoutRes) {
          done();
        });

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
