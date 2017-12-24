'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Questionnaire = db.questionnaire,
  Question = db.question,
  QuestionOption = db.questionOption,
  QuestionnairePlay = db.questionnairePlay,
  QuestionAnswer = db.questionAnswer,
  User = db.user;

/**
 * Globals
 */
var user, questionnaire, question, questionOption, questionnairePlay, questionAnswer;

/**
 * Unit tests
 */
describe('Questionnaire Model Unit Tests:', function() {
  before(function(done) {
    user = User.build();

    user.firstName = 'Full';
    user.lastName = 'Name';
    user.displayName = 'Full Name';
    user.email = 'test@gmail.com';
    user.salt = user.makeSalt();
    user.hashedPassword = user.encryptPassword('S3@n.jsI$Aw3$0m12', user.salt);

    user.save().then(function(user) {
      questionnaire = Questionnaire.build({
        name: 'Questionnaire name',
        description: 'Questionnaire description',
        duration: 23,
        userId: user.id
      });

      question = Question.build({
        name: 'What is question',
        type: 'text'
      });

      questionOption = QuestionOption.build({
        name: 'What is option',
        isCorrect: false
      });

      questionAnswer = QuestionOption.build({
        name: 'What is option'
      });

      questionnairePlay = QuestionnairePlay.build({
        started: new Date()
      });

      done();
    }).catch(function(err) { done(err); });

  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(5000);
      questionnaire.save().then(function(questionnaire) {
        should.not.exist((questionnaire) ? null : questionnaire);
        done();
      }).catch(function(err) {
        done(err);
      });

    });

    it('should be able to show an error when try to save without name', function(done) {
      questionnaire.name = '';

      questionnaire.save().then(function() {
        should.exist(null);
        done();
      }).catch(function(err) {
        should.exist(errorHandler.getErrorMessage(err));
        done();
      });
    });

    it('should be able to save question without problems', function(done) {
      question.save().then(function(question) {
        should.not.exist((question) ? null : question);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able to save question option without problems', function(done) {
      questionOption.save().then(function(questionOption) {
        should.not.exist((questionOption) ? null : questionOption);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able to save question answer without problems', function(done) {
      questionAnswer.save().then(function(questionAnswer) {
        should.not.exist((questionAnswer) ? null : questionAnswer);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able to save questionnaire play without problems', function(done) {
      questionnairePlay.save().then(function(questionnairePlay) {
        should.not.exist((questionnairePlay) ? null : questionnairePlay);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

  });

  after(function(done) {
    User.destroy({
        where: {
          email: 'test@gmail.com'
        }
      })
      .then(function(success) {
        done();
      }).catch(function(err) {});
  });

});
