'use strict';

//Questionnaires service used for communicating with the questionnaire REST endpoints
angular.module('questionnaires').service('QuestionnaireService', ['$http',
  function ($http) {
    var docxDocument = {};

    var create = function (data) {
      return $http.post('api/questionnaires', data)
        .then(function (response) {
          return response;
        });
    };

    var get = function(id) {
      return $http.get('api/questionnaires')
        .then(function (response) {
          return response;
        });
    };

    var getByID = function(id) {
      return $http.get('api/questionnaires/' + id)
        .then(function (response) {
          return response;
        });
    };

    var getByIDForPlay = function(id) {
      return $http.get('api/questionnaires/play/' + id)
        .then(function (response) {
          return response;
        });
    };

    var getListOfNames = function() {
      return $http.get('api/questionnaires/names')
        .then(function (response) {
          return response;
        });
    };

    var deleteF = function(id, questionnaire) {
      return $http.delete('api/questionnaires/' + id, { questionnaire : questionnaire })
        .then(function (response) {
          return response;
        }); 
    };
    
    var edit = function(questionnaire) {
      return $http.put('api/questionnaires/' + questionnaire.id, questionnaire)
        .then(function (response) {
          return response;
        }); 
    };

    var getCount = function() {
      return $http.get('/api/questionnaires/count')
        .then(function(response) {
          return response;
        });
    };

    var finishPlay = function(data, id) {
      return $http.post('api/questionnaires/play/' + id, data)
        .then(function (response) {
          return response;
        });
    };

    var calculatePlayScore = function(data, id) {
      return $http.post('api/questionnaires/play/score/' + id, data)
        .then(function (response) {
          return response;
        });
    };

    var getQuestionTypes = function() {
      return $http.get('api/questionnaires/questiontypes')
        .then(function (response) {
          return response;
        });
    };
    
    docxDocument.get = get;
    docxDocument.getCount = getCount;
    docxDocument.create = create;
    docxDocument.edit = edit;
    docxDocument.delete = deleteF;
    docxDocument.getByID = getByID;
    docxDocument.getByIDForPlay = getByIDForPlay;
    docxDocument.finishPlay = finishPlay;
    docxDocument.calculatePlayScore = calculatePlayScore;
    docxDocument.getListOfNames = getListOfNames;

    docxDocument.getQuestionTypes = getQuestionTypes;
    
    return docxDocument;
  }
]);
