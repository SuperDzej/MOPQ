'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  questionnairesPolicy = require('../policies/questionnaires.server.policy'),
  questionnaires = require('../controllers/questionnaires.server.controller');


module.exports = function(app) {

  // Questionnaires collection routes
  app.route('/api/questionnaires').all(questionnairesPolicy.isAllowed)
    .get(questionnaires.list)
    .post(questionnaires.create);

  app.route('/api/questionnaires/play/:questionnaireIdForPlay').all(questionnairesPolicy.isAllowed)
    .get(questionnaires.readForPlay)
    .post(questionnaires.finishPlay);

  app.route('/api/questionnaires/play/score/:questionnaireIdForPlay').all(questionnairesPolicy.isAllowed)
    .post(questionnaires.calculateNumberOfCorrectAnswers);

  app.route('/api/questionnaires/questiontypes').all(questionnairesPolicy.isAllowed)
    .get(questionnaires.questionTypes);

  // Single questionnaire routes
  app.route('/api/questionnaires/:questionnaireId').all(questionnairesPolicy.isAllowed)
    .get(questionnaires.read)
    .put(questionnaires.update)
    .delete(questionnaires.delete);

  // Finish by binding the questionnaire middleware
  app.param('questionnaireId', questionnaires.questionnaireByID);
  app.param('questionnaireIdForPlay', questionnaires.questionnaireByIDForPlay);
};