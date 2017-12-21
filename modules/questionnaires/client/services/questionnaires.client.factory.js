'use strict';

//Questionnaires service used for communicating with the questionnaire REST endpoints
angular.module('questionnaires').factory('Questionnaires', ['$resource',
  function ($resource) {
    return $resource('api/questionnaires/:quizId', {
      questionnaireId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
