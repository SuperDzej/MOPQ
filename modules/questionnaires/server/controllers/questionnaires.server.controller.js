'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Questionnaire = db.questionnaire,
  QuestionnaireOption = db.questionOption,
  QuestionnairePlay = db.questionnairePlay,
  Question = db.question;

/**
 * Create a questionnaire
 */
exports.create = function (req, res) {
  req.body.userId = req.user.id;
  var questionsArr = req.body.questions;

  var questionnaire = req.body;
  var insertOpts = {
    validate: true,
    individualHooks: true,
    fields: ['name', 'createdAt', 'updatedAt']
  };

  /**
   * I first save all questions, then go trough all questions and save for every question options and at the end I save questionnaire object and assign questions to it because sequlize can not 
   * in first insert add mapping between objects you need to set that mapping after insert of object
   */
  var promises = [];
  Question
    .bulkCreate(questionsArr, insertOpts)
    .then(questions => {
      if (!questions) {
        return res.send('users/signup', {
          errors: 'Could not create the questionnaire'
        });
      }
      
      insertOpts.fields = ['name', 'isCorrect', 'createdAt', 'updatedAt'];
      questionsArr.forEach(function (question, index) {
        let questionOptions = question.options;
        let questionOptionPromise = (function (question, questionOptions, index) {
          return QuestionnaireOption
            .bulkCreate(questionOptions, insertOpts)
            .then(function (options) {
              return questions[index].setOptions(options);
            });
        })(question, questionOptions, index);

        promises.push(questionOptionPromise);
      });

      Promise.all(promises).then(function (questionOptions) {
        Questionnaire
          .create(req.body)
          .then(function (questionnaire) {
            if (!questionnaire) {
              return res.send('users/signup', {
                errors: 'Could not create the questionnaire'
              });
            }

            questionnaire.setQuestions(questions)
              .then(function (result) {
                return res.jsonp(questionnaire);
              });
          }).catch(function (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          });
      }).catch(function(err) {
        return res.status(400).send({
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
exports.finishPlay = function(req, res) {
  req.body.userId = req.user.id;

  req.body.questionnaireId = req.questionnaire.id;
  let quizPlay = req.body;
  console.log(quizPlay);
  QuestionnairePlay.create(quizPlay)
  .then(function(quizPlayR) {
    res.json(quizPlayR);
  }).catch(function(err){
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Show the current questionnaire
 */
exports.read = function (req, res) {
  res.json(req.questionnaire);
};

/**
 * Update a questionnaire
 */
exports.update = function (req, res) {
  var questionnaire = req.questionnaire;

  questionnaire.updateAttributes({
    title: req.body.title,
    content: req.body.content
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
  Questionnaire.findById(questionnaire.id).then(function (questionnaire) {
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
  Questionnaire.findAll().then(function (questionnaires) {//{ include: [{ model: db.user, attributes: ['']} }
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
 *
exports.questionnaireByIDForPlay = function (req, res, next, id) {
  if ((id % 1 === 0) === false) { //check if it's integer
    return res.status(404).send({
      message: 'Questionnaire id is invalid'
    });
  }

  Quiz.findById(id)
    .populate({
      path: 'questions',
      populate: {
        path: 'options',
        model: 'QuestionOption'
      }
    })
    .exec(function (error, quiz) {
      if(error) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(error)
        });
      }

      QuizPlay.find({ quiz: id }, function(error, quizPlay) {
        if(error) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(error)
          });
        }
        //User already played this quiz and no need to play it again
        if(quizPlay) {
          return res.status(400).send({
            message: 'You have already played this quiz'
          });
        }

        req.quiz = quiz;
        next();
      });
    });
};*/

/**
 * Questionnaire middleware
 */
exports.questionnaireByID = function (req, res, next, id) {

  if ((id % 1 === 0) === false) { //check if it's integer
    return res.status(404).send({
      message: 'Questionnaire id is invalid'
    });
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
      return res.status(404).send({
        message: 'No questionnaire with that identifier has been found'
      });
    } else {
      console.log('Got by id');
      req.questionnaire = questionnaire;
      next();
    }
  }).catch(function (err) {
    return next(err);
  });

};
