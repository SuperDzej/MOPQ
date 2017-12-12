'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  questionnairesPolicy = require('../policies/questionnaires.server.policy'),
  questionnaires = require(path.resolve('./modules/questionnaires/server/controllers/questionnaires.server.controller'));


module.exports = function(app) {

  // Articles collection routes
  app.route('/api/questionnaires').all(questionnairesPolicy.isAllowed)
    .get(questionnaires.list)
    .post(questionnaires.create);

  app.route('/api/questionnaires/finish/:questionnaireId').all(questionnairesPolicy.isAllowed)
    .post(questionnaires.finishPlay);

  // Single questionnaire routes
  app.route('/api/questionnaires/:questionnaireId').all(questionnairesPolicy.isAllowed)
    .get(questionnaires.read)
    .put(questionnaires.update)
    .delete(questionnaires.delete);

  // Finish by binding the questionnaire middleware
  app.param('questionnaireId', questionnaires.questionnaireByID);
};