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
  let rQuestionnairePlay = req.body;
  let rAnswers = req.body.answers;

  QuestionnairePlay.create(rQuestionnairePlay)
    .then(function (questionnairePlay) {
      // Set questionnaire play id to answers to have reference
      for(let i = 0;i < rAnswers.length;i++) {
        rAnswers[i].questionnairePlayId = questionnairePlay.id;
      }

      QuestionAnswer
        .bulkCreate(rAnswers)
        .then(answers => {
          res.json(questionnairePlay);
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
 * Saving information about how user played the quiz and what answers he gave
 */
exports.calculateNumberOfCorrectAnswers = function (req, res) {
  req.body.userId = req.user.id;
  questionnaireService.questionnaireById(req.questionnaire.id, function (err, questionnaire) {
    if (err) {
      return res.status(400).send(err);
    }

    let answers = req.body.answers;
    let correctAnswers = answers.filter(function(answer) { 
      // Filtering out options and comparing them to what user entered to find if option that user selected is same as option that is saved as correct in database
      let question = questionnaire.questions.filter(question => question.options.filter(option => option.name === answer.name && 
        option.id === answer.questionOptionId && option.isCorrect).length !== 0);
      return question.length !== 0;
   });
    res.json({
      message: 'You have answered correctly ' + correctAnswers.length + ' questions'
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
  if(!questionTypes) {
    return res.status(500).send({
      message: 'Could not load configuration for question types'
    });
  }
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
        // Delete the questionnaire, other related models will delete on cascade
        questionnaire.destroy()
          .then(function () {
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
      return res.jsonp(err);
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
    }).then(function (questionnairePlay) {
      // User already played this quiz and no need to play it again
      if (questionnairePlay) {
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
