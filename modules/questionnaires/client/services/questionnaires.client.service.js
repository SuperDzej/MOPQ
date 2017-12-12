'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('questionnaires').service('QuestionnaireService', ['$http',
  function ($http) {
    var docxDocument = {};

    docxDocument.create = function (data) {
      return $http.post('api/questionnaires', data)
        .then(function (response) {
          return response;
        });
    };

    docxDocument.getByID = function(id) {
      return $http.get('api/questionnaires/' + id)
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

    var getMyCompany = function() {
      return $http.get('api/questionnaires/loggeduser')
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
      return $http.put('api/questionnaires/' + questionnaire.id, { questionnaire : questionnaire })
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
      return $http.post('api/questionnaires/finish/' + id, data)
        .then(function (response) {
          return response;
        });
    };
    
    docxDocument.getCount = getCount;
    docxDocument.edit = edit;
    docxDocument.delete = deleteF;
    docxDocument.getMyCompany = getMyCompany;
    docxDocument.finishPlay = finishPlay;
    docxDocument.getListOfNames = getListOfNames;
    
    return docxDocument;
  }
]);
