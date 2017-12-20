'use strict';

//Questionnaires service used for communicating with the articles REST endpoints
angular.module('questionnaires').factory('QuizFactory', ['$resource',
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
