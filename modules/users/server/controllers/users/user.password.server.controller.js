'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  nodemailer = require('nodemailer'),
  async = require('async'),
  crypto = require('crypto'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user;

var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function (req, res, next) {
  async.waterfall([
    // Generate random token
    function (done) {
      crypto.randomBytes(20, function (err, buffer) {
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    // Lookup user by email
    function (token, done) {
      if (req.body.email) {

        User.find({
          where: {
            email: req.body.email.toLowerCase()
          }
        }).then(function (user) {
          if (!user) {
            return res.status(400).send({
              message: 'No account with that email has been found'
            });
          } else if (user.provider !== 'local') {
            return res.status(400).send({
              message: 'It seems like you signed up using your ' + user.provider + ' account, please sign in using that provider.'
            });
          } else {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            user.save().then(function (saved) {
              var err = (!saved) ? true : false;
              done(err, token, saved);
            });
          }
        }).catch(function (err) {
          return res.status(400).send({
            message: 'Username/email field must not be blank'
          });
        });
      } else {
        return res.status(400).send({
          message: 'Username/email field must not be blank'
        });
      }
    },
    function (token, user, done) {
      res.render(path.resolve('modules/users/server/templates/reset-password-email'), {
        name: user.displayName,
        appName: config.app.title,
        url: 'http://' + req.headers.host + '/api/auth/reset/' + token
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {
      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: 'Password Reset',
        html: emailHTML
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        if (!err) {
          res.send({
            message: 'An email has been sent to the provided email with further instructions.'
          });
        } else {
          return res.status(400).send({
            message: 'Failure sending email'
          });
        }

        done(err);
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function (req, res) {
  User.find({
    where: {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    }
  }).then(function (user) {
    if (!user) {
      return res.redirect('/password/reset/invalid');
    }
    res.redirect('/password/reset/' + req.params.token);
  });
};
/**
 * Reset password POST from email token
 */
exports.reset = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;
  var message = null;

  async.waterfall([

      function (done) {
        User.find({
          where: {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
              $gt: Date.now()
            }
          }
        }).then(function (user) {
          if (user) {
            if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
              user.password = passwordDetails.newPassword;
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;

              user.save().then(function (saved) {
                if (!saved) {
                  return res.status(400).send({
                    message: 'Unable to save the reset the password'
                  });
                } else {
                  req.login(user, function (err) {
                    if (err) {
                      res.status(400).send(err);
                    } else {
                      // Remove sensitive data before return authenticated user
                      user.password = undefined;
                      user.salt = undefined;

                      res.json(user);

                      done(err, user);
                    }
                  });
                }

              });

            } else {
              return res.status(400).send({
                message: 'Passwords do not match'
              });
            }
          } else {
            return res.status(400).send({
              message: 'Password reset token is invalid or has expired.'
            });
          }
        });
      },
      function (user, done) {
        res.render(path.resolve('modules/users/server/templates/reset-password-confirm-email'), {
          name: user.displayName,
          appName: config.app.title
        }, function (err, emailHTML) {
          done(err, emailHTML, user);
        });
      },
      // If valid email, send reset email using service
      function (emailHTML, user, done) {
        var mailOptions = {
          to: user.email,
          from: config.mailer.from,
          subject: 'Your password has been changed',
          html: emailHTML
        };

        smtpTransport.sendMail(mailOptions, function (err) {
          done(err, 'done');
        });
      }
    ],
    function (err) {
      if (err) {
        return next(err);
      }
    });
};

/**
 * Change Password
 */
exports.changePassword = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;
  var message = null;
  if (req.user) {
    if (passwordDetails.newPassword) {
      User.findOne({
        where: {
          id: req.user.id
        }
      }).then(function (user) {
        if (user) {
          if (user.authenticate(passwordDetails.currentPassword)) {
            if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
              user.salt = user.makeSalt();
              user.hashedPassword = user.encryptPassword(passwordDetails.newPassword, user.salt);
              user.save().then(function () {
                req.login(user, function (err) {
                  if (err) {
                    res.status(400).send(err);
                  } else {
                    res.send({
                      message: 'Password changed successfully'
                    });
                  }
                });
              }).catch(function (err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              });
            } else {
              res.status(400).send({
                message: 'Passwords do not match'
              });
            }
          } else {
            res.status(400).send({
              message: 'Current password is incorrect'
            });
          }
        } else {
          res.status(400).send({
            message: 'User is not found'
          });
        }
      }).catch(function (err) {
        res.status(400).send({
          message: 'Error finding the user'
        });
      });
    } else {
      res.status(400).send({
        message: 'Please provide a new password'
      });
    }
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};
