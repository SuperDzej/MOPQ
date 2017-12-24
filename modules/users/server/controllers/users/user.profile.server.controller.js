'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  async = require('async'),
  path = require('path'),
  multer = require('multer'),
  multerS3 = require('multer-s3'),
  aws = require('aws-sdk'),
  amazonS3URI = require('amazon-s3-uri'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  config = require(path.resolve('./config/config')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user,
  validator = require('validator');

var useS3Storage = config.uploads.storage === 's3' && config.aws.s3;
var s3;

if (useS3Storage) {
  aws.config.update({
    accessKeyId: config.aws.s3.accessKeyId,
    secretAccessKey: config.aws.s3.secretAccessKey
  });

  s3 = new aws.S3();
}

exports.update = function (req, res, next) {
  var userInfo = req.body;
  // If user is signed in but didn't pass email in the body to be changed use his old email to update fields he sent
  if (!userInfo.email) {
    userInfo.email = req.user.email;
  }

  req.body.roles = undefined;
  if (userInfo && userInfo.email) {

    async.waterfall([
      function (done) {

        if (userInfo.email.toLowerCase() !== req.user.email.toLowerCase()) {
          User.findOne({
            where: {
              email: {
                like: userInfo.email
              },
              id: {
                '$ne': req.user.id
              }
            }
          }).then(function (user) {
            if (user && user.email.toLowerCase() === userInfo.email.toLowerCase()) {
              return res.status(400).send({
                message: 'Email already exists'
              });
            }
            done(null);
          }).catch(function (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          });
        } else {
          done(null);
        }
      },
      function (done) {
        if (userInfo.email.toLowerCase() !== req.user.email.toLowerCase()) {
          User.findOne({
            where: {
              email: {
                like: userInfo.email
              },
              id: {
                '$ne': req.user.id
              }
            }
          }).then(function (user) {
            if (user && user.email.toLowerCase() === userInfo.email.toLowerCase()) {
              return res.status(400).send({
                message: 'Email already exists'
              });
            }
            done(null);
          }).catch(function (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          });
          done(null);
        } else {
          done(null);
        }
      },
      function (done) {
        User.findOne({
          where: {
            id: req.user.id
          }
        }).then(function (user) {

          user.firstName = userInfo.firstName;
          user.lastName = userInfo.lastName;
          user.displayName = userInfo.firstName + ' ' + userInfo.lastName;
          user.email = userInfo.email;
          user.updatedAt = Date.now();

          user.save()
            .then(function (user) {
              if (!user) {
                return res.status(400).send({
                  message: 'Unable to update'
                });
              } else {
                // For security reasons delete this fields
                user.hashedPassword = undefined;
                user.salt = undefined;

                res.json(user);
              }
            }).catch(function (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            });

        }).catch(function (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        });
        done(null);
      }
    ]);
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var existingImageUrl;
  var multerConfig;

  if (useS3Storage) {
    multerConfig = {
      storage: multerS3({
        s3: s3,
        bucket: config.aws.s3.bucket,
        acl: 'public-read'
      })
    };
  } else {
    multerConfig = config.uploads.profile.image;
  }

  // Filtering to upload only images
  multerConfig.fileFilter = require(path.resolve('./config/lib/multer')).imageFileFilter;

  var upload = multer(multerConfig).single('newProfilePicture');

  if (user) {
    existingImageUrl = user.profileImageURL;
    uploadImage()
      .then(updateUser)
      .then(deleteOldImage)
      .then(login)
      .then(function () {
        res.json(user);
      })
      .catch(function (err) {
        res.status(422).send(err);
      });
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }

  function uploadImage() {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }

  function updateUser() {
    return new Promise(function (resolve, reject) {
        User.findOne({
          where: {
            id: user.id
          }
        }).then(function (dbUser) {
          var profileImageURL = config.uploads.storage === 's3' && config.aws.s3 ?
          req.file.location :
          '/' + req.file.path;
          // For local saving remove public/ from file path because on client with public can't show picture
          /* if(!(config.uploads.storage === 's3' && config.aws.s3)) {
            let removePublicPartOfPaht = (profileImageURL.indexOf('\\')) ? (profileImageURL.indexOf('\\')) : (profileImageURL.indexOf('/'));
            profileImageURL = profileImageURL.substring(removePublicPartOfPaht, profileImageURL.length);
          }*/

          dbUser.profileImageURL = profileImageURL;
          dbUser.save().then(function (theuser) {
            // Need to set this to update image in current session view
            req.user.profileImageURL = dbUser.profileImageURL;
            resolve();
          }).catch(function(err) {
            reject(err);
          });
        }).catch(function(err) {
          reject(err);
        });

    });
  }

  function deleteOldImage() {
    return new Promise(function (resolve, reject) {
      // console.log(User.schema);
      if (existingImageUrl !== '/uploads/users/default.png') {
        if (useS3Storage) {
          try {
            var {
              region,
              bucket,
              key
            } = amazonS3URI(existingImageUrl);
            var params = {
              Bucket: config.aws.s3.bucket,
              Key: key
            };

            s3.deleteObject(params, function (err) {
              if (err) {
                console.log('Error occurred while deleting old profile picture.');
                console.log('Check if you have sufficient permissions : ' + err);
              }

              resolve();
            });
          } catch (err) {
            console.warn(`${existingImageUrl} is not a valid S3 uri`);

            return resolve();
          }
        } else {
          fs.unlink(path.resolve('.' + existingImageUrl), function (unlinkError) {
            if (unlinkError) {

              // If file didn't exist, no need to reject promise
              if (unlinkError.code === 'ENOENT') {
                console.log('Removing profile image failed because file did not exist.');
                return resolve();
              }

              console.error(unlinkError);

              reject({
                message: 'Error occurred while deleting old profile picture'
              });
            } else {
              resolve();
            }
          });
        }
      } else {
        resolve();
      }
    });
  }

  function login() {
    return new Promise(function (resolve, reject) {
      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          resolve();
        }
      });
    });
  }
};

exports.getProfile = function (req, res) {
  User.findOne({
    attributes: ['id', 'firstName', 'lastName', 'email'],
    where: {
      id: req.user.id
    }
  }).then(function (user) {
    res.json(user);
  }).catch(function (err) {
    res.status(400).send(err);
  });
};


/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
