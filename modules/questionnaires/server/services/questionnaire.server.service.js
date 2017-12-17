'use strict';

var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    Questionnaire = db.questionnaire,
    QuestionnaireOption = db.questionOption,
    QuestionnairePlay = db.questionnairePlay,
    Question = db.question;


exports.getQuestionTypes = function () {
    let questionTypes = [{
        type: 'text',
        description: 'Text',
        numOptions: 1,
        view: '<div class="col-md-2">' +
            '<input class="form-control" type="radio" ng-model="answer.name" ng-value="option.name" />' +
            '</div>' +
            '<div class="col-md-10">' +
            '<label ng-bind="option.name"></label>' +
            '</div>'
    }, {
        type: 'yesNo',
        description: 'Yes - No',
        numOptions: 2
    }, {
        type: 'multiChoice',
        description: 'Multiple Choice'
    }, {
        type: 'singleChoice',
        description: 'Single Choice'
    }];

    return questionTypes;
};

exports.questionnaireById = function (id, callback) {
    if ((id % 1 === 0) === false) { //check if it's integer
      callback({
        message: 'Questionnaire id is invalid'
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
        callback({
          message: 'No questionnaire with that identifier has been found'
        }, null);
      } else {
        callback(null, questionnaire);
      }
    }).catch(function (err) {
      callback(err, null);
    });
  };
