'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Questionnaire = db.questionnaire,
  User = db.user;

/**
 * Globals
 */
var user, questionnaire;

/**
 * Unit tests
 */
describe('Questionnaire Model Unit Tests:', function() {

  before(function(done) {
    user = User.build();

    user.firstName = 'Full';
    user.lastName = 'Name';
    user.displayName = 'Full Name';
    user.email = 'test@test.com';
    user.salt = user.makeSalt();
    user.hashedPassword = user.encryptPassword('S3@n.jsI$Aw3$0m3', user.salt);

    user.save().then(function(user) {
      questionnaire = Questionnaire.build({
        name: 'Questionnaire name',
        description: 'Questionnaire description',
        duration: 23,
        userId: user.id
      });
      done();
    }).catch(function(err) {});

  });

  // beforeEach(function(done) {
  //   done();
  // });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(10000);
      questionnaire.save().then(function(err) {
        should.not.exist((err) ? null : err);
        done();
      }).catch(function(err) {
        console.log(err);
        done();
      });

    });

    it('should be able to show an error when try to save without name', function(done) {
      questionnaire.name = '';

      questionnaire.save().then(function(err) {
        should.exist(null);
        done();
      }).catch(function(err) {
        should.exist(errorHandler.getErrorMessage(err));
        done();
      });

    });
  });

  // afterEach(function(done) {
  //   done();
  // });

  // TODO CHECK
  after(function(done) {
    User.destroy({
        where: {
          email: 'test@test.com'
        }
      })
      .then(function(success) {
        done();
      }).catch(function(err) {});
  });

});
