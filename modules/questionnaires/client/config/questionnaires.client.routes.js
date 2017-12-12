'use strict';

// Setting up route
angular.module('questionnaires').config(['$stateProvider',
  function ($stateProvider) {
    // Documents state routing
    $stateProvider
      .state('questionnaires', {
        abstract: true,
        url: '/questionnaires',
        template: '<ui-view/>'
      })
      .state('questionnaires.list', {
        title: 'List of questionnaires',
        url: '',
        templateUrl: 'modules/questionnaires/client/views/list-questionnaires.client.view.html',
        data: {
          roles: ['admin', 'user']
        }
      })
      .state('questionnaires.create', {
        title: 'Create questionnaire',
        url: '/create',
        templateUrl: 'modules/questionnaires/client/views/create-questionnaire.client.view.html',
        data: {
          roles: ['admin']
        }
      })
      .state('questionnaires.edit', {
        title: 'Edit questionnaire',
        url: '/edit/:questionnaireId',
        templateUrl: 'modules/questionnaires/client/views/edit-questionnaire.client.view.html',
        data: {
          roles: ['admin']
        }
      })
      .state('questionnaires.view', {
        title: 'View questionnaire',
        url: '/:questionnaireId',
        templateUrl: 'modules/questionnaires/client/views/view-questionnaire.client.view.html'
      })
      .state('questionnaires.play', {
        title: 'Play questionnaire',
        url: '/play/:questionnaireId',
        templateUrl: 'modules/questionnaires/client/views/questionnaire-play.client.view.html'
      });
  }
]);