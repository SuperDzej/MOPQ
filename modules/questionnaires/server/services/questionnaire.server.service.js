'use strict';

var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    config = require(path.resolve('./config/config')),
    Questionnaire = db.questionnaire,
    QuestionnaireOption = db.questionOption,
    QuestionnairePlay = db.questionnairePlay,
    Question = db.question;


exports.createQuestionnaire = function(bQuestionnaire, questions, callback) {
  Questionnaire
    .create(bQuestionnaire)
    .then(function (questionnaire) {
      if (!questionnaire) {
        return callback({
          errors: 'Could not create the questionnaire'
        }, null);
      }

      questionnaire.setQuestions(questions)
        .then(function (result) {
          return callback(null, questionnaire);
        });
    }).catch(function (err) {
      return callback({
        message: errorHandler.getErrorMessage(err)
      }, null);
    });
};

exports.createQuestions = function(questionsArr, callback) {
  if(questionsArr === undefined) {
    return callback({
      message: 'Please provide questions'
    }, null);
  }
  var insertOpts = {
    validate: true,
    individualHooks: true,
    fields: ['name', 'type', 'createdAt', 'updatedAt']
  };

  Question
    .bulkCreate(questionsArr, insertOpts)
    .then(questions => {
      if (!questions) {
        return callback ({
          errors: 'Could not create the questionnaire'
        }, null);
      }

      return callback(null, questions);
    }).catch(function (err) {
      return callback({
        message: errorHandler.getErrorMessage(err)
      }, null);
    });
};

exports.createQuestionOptions = function(questionsArr, questions, callback) {
  var promises = [];
  var insertOpts = {
    validate: true,
    individualHooks: true,
    fields: ['name', 'isCorrect', 'createdAt', 'updatedAt']
  };

  questionsArr.forEach(function (question, index) {
    let questionOptions = question.options;
    let questionOptionPromise = (function (question, questionOptions, index) {
      return QuestionnaireOption
        .bulkCreate(questionOptions, insertOpts)
        .then(function (options) {
          return questions[index].setOptions(options);
        }).then(function (setOptions) {
          return setOptions;
        });
    })(question, questionOptions, index);

    promises.push(questionOptionPromise);
  });

  Promise.all(promises)
    .then(function (questionOptions) {
      return callback(null, questionOptions);
  }).catch(function(err) {
    return callback({
      message: errorHandler.getErrorMessage(err)
    }, null);
  });
};

exports.getQuestionTypes = function () {
    let questionTypes = config.questionTypes;

    return questionTypes;
};

exports.questionnaireById = function (id, callback) {
    if ((id % 1 === 0) === false) { // check if it's integer
      return callback({
        message: 'Questionnaire is invalid'
      }, null);
    }
  
    Questionnaire.find({
      where: {
        id: id
      },
      include: [{
        model: db.question,
        as: 'questions',
        include: [{
          model: db.questionOption,
          as: 'options'
        }]
      }]
    }).then(function (questionnaire) {
      if (!questionnaire) {
        return callback({
          message: 'No questionnaire with that identifier has been found'
        }, null);
      } else {
        return callback(null, questionnaire);
      }
    }).catch(function (err) {
      return callback(err, null);
    });
  };
