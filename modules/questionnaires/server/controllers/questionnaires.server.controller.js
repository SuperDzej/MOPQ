'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  questionnaireService = require('../services/questionnaire.server.service.js'),
  Questionnaire = db.questionnaire,
  QuestionnaireOption = db.questionOption,
  QuestionAnswer = db.questionAnswer,
  QuestionnairePlay = db.questionnairePlay,
  Question = db.question;

/**
 * Create a questionnaire
 */
exports.create = function (req, res) {
  req.body.userId = req.user.id;
  var questionsArr = req.body.questions;
  var questionnaire = req.body;

  /**
   * I first save all questions, then go trough all questions and save for every question options and at the end I save questionnaire object and assign questions to it because sequlize can not 
   * in first insert add mapping between objects you need to set that mapping after insert of object
   */

  questionnaireService.createQuestions(questionsArr, function (err, questions) {
    if (err) {
      return res.status(422).send(err);
    }

    questionnaireService.createQuestionOptions(questionsArr, questions, function (err, questionOptions) {
      if (err) {
        return res.status(422).send(err);
      }

      questionnaireService.createQuestionnaire(questionnaire, questions, function (err, questionnaire) {
        if (err) {
          return res.status(422).send(err);
        }

        return res.jsonp(questionnaire);
      });
    });
  });
};

/**
 * Saving information about how user played the quiz and what answers he gave
 */
exports.finishPlay = function (req, res) {
  req.body.userId = req.user.id;

  req.body.questionnaireId = req.questionnaire.id;
  let rQuizPlay = req.body;
  let rAnswers = req.body.answers;

  QuestionnairePlay.create(rQuizPlay)
    .then(function (quizPlay) {

      return QuestionAnswer
        .bulkCreate(rAnswers)
        .then(answers => {
          console.log(answers);
          return quizPlay.setAnswers(answers)
            .then(function (response) {
              console.log(response);
              res.json(quizPlay);
            });
        }).catch(function (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        });
    }).catch(function (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};


/**
 * Show the current questionnaire for user to play
 */
exports.readForPlay = function (req, res) {
  // removing all info about correctnes of options
  for (let i = 0; i < req.questionnaire.questions.length; i++) {
    let question = req.questionnaire.questions[i];
    for (let j = 0; j < question.options.length; j++) {
      question.options[j].isCorrect = undefined;
    }
  }
  res.json(req.questionnaire);
};


/**
 * Show the current questionnaire
 */
exports.read = function (req, res) {
  res.json(req.questionnaire);
};

/**
 * Show the question types
 */
exports.questionTypes = function (req, res) {
  let questionTypes = questionnaireService.getQuestionTypes();
  res.json(questionTypes);
};

/**
 * Update a questionnaire
 */
exports.update = function (req, res) {
  var questionnaire = req.questionnaire;

  questionnaire.updateAttributes({
    name: req.body.name,
    description: req.body.description,
    duration: req.body.duration
  }).then(function (questionnaire) {
    res.json(questionnaire);
  }).catch(function (err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Delete an questionnaire
 */
exports.delete = function (req, res) {
  var questionnaire = req.questionnaire;

  // Find the questionnaire
  Questionnaire.findById(questionnaire.id)
    .then(function (questionnaire) {
      if (questionnaire) {

        // Delete the questionnaire
        questionnaire.destroy().then(function () {
          return res.json(questionnaire);
        }).catch(function (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        });

      } else {
        return res.status(400).send({
          message: 'Unable to find the questionnaire'
        });
      }
    }).catch(function (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * List of Questionnaires
 */
exports.list = function (req, res) {
  Questionnaire.findAll()
    .then(function (questionnaires) { //{ include: [{ model: db.user, attributes: ['']} }
      if (!questionnaires) {
        return res.status(404).send({
          message: 'No questionnaires found'
        });
      } else {
        res.json(questionnaires);
      }
    }).catch(function (err) {
      res.jsonp(err);
    });
};

/**
 * Quiz middleware
 */
exports.questionnaireByIDForPlay = function (req, res, next, id) {
  questionnaireService.questionnaireById(id, function (err, questionnaire) {
    if (err) {
      return res.status(400).send(err);
    }

    QuestionnairePlay.find({
      where: {
        questionnaireId: id,
        userId: req.user.id
      }
    }).then(function (quizPlay) {
      // User already played this quiz and no need to play it again
      if (quizPlay) {
        return res.status(400).send({
          message: 'You have already finished this questionnaire, please choose other'
        });
      }

      req.questionnaire = questionnaire;
      next();
    }).catch(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
    });
  });
};

/**
 * Questionnaire middleware
 */
exports.questionnaireByID = function (req, res, next, id) {
  questionnaireService.questionnaireById(id, function (err, questionnaire) {
    if (err) {
      return res.status(400).send(err);
    }

    req.questionnaire = questionnaire;
    next();
  });
};
