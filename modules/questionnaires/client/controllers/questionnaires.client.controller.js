'use strict';

// CertificateFactory controller
angular.module('questionnaires')
.controller('QuestionnaireController', ['$scope', '$rootScope', '$stateParams', '$location', '$timeout', '$window', 'Authentication', 'QuizFactory', 'QuestionnaireService', 'SweetAlert', 'FileUploader',
  function ($scope, $rootScope, $stateParams, $location, $timeout, $window, Authentication, QuizFactory, QuestionnaireService, SweetAlert, FileUploader) {
    $scope.authentication = Authentication;
    var baseUrl = 'questionnaires';
    $rootScope.mainTitle = 'Questionnaires';

    var showPopover = function () {
      angular.element('.qAnswer0').popover({
        title: "Option info",
        content: "Please check atleast one checkbox near option if it is correct answer",
        html: true,
        placement: 'right',
        trigger: 'focus'
      });

      angular.element('.qAnswer0').popover('show');
    };

    $scope.edit = function (questionnaire) {
      QuestionnaireService.edit(questionnaire)
        .then(function (response) {
          $scope.editedSuccessfully = true;
        });
    };

    // Find a list of CertificateFactory
    $scope.find = function () {
      $scope.questionnaires = QuizFactory.query();
      console.log($scope.questionnaires);
    };

    $scope.questions = [{
      id: 'question1',
      options: []
    }];

    $scope.addNewQuestion = function ($event) {
      $event.preventDefault();
      var newItemNo = $scope.questions.length + 1;
      $scope.questions.push({
        'id': 'question' + newItemNo,
        type: 'input',
        options: []
      });
    };

    $scope.addNewAnswer = function ($event) {
      $event.preventDefault();
      var options = $scope.questions[$scope.questions.length - 1].options;
      var newItemNo = options.length + 1;
      $scope.questions[$scope.questions.length - 1].options.push({
        'id': 'option' + newItemNo
      });
      //Just show popover first time
      if ($scope.questions.length === 1 && 
        $scope.questions[0].options.length === 1) {
        $scope.$$postDigest(function () {
          showPopover();
        });
      }
    };

    $scope.removeQuestion = function () {
      var lastItem = $scope.questions.length - 1;
      $scope.questions.splice(lastItem);
    };

    $scope.create = function (isValid) {
      $scope.questionnaire.questions = $scope.questions;

      QuestionnaireService.create($scope.questionnaire)
        .then(function (response) {
          $scope.createdSuccessfully = true;
          window.location.href = baseUrl;
        }, function (error) {
          console.log(error);
        });
    };

    $scope.questionnaire = {};
    $scope.getByID = function () {
      var id = $stateParams.questionnaireId;
      QuestionnaireService.getByID(id)
        .then(function (response) {
          $scope.questionnaire = response.data;
          $scope.editQuiz = response.data;
        }, function (error) {
          console.log(error);
        });
    };

    $scope.delete = function (questionnaire) {
      var id = questionnaire.id;
      var sweetAlert = SweetAlert.swal({
          title: 'Are you sure?',
          text: 'Your will not be able to recover this questionnaire!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: 'Yes, delete it!',
          closeOnConfirm: false
        },
        function (confirmation) {
          if (confirmation) {
            QuestionnaireService.delete(id, questionnaire)
              .then(function (response) {
                SweetAlert.close();
                window.href = baseUrl;
              }, function (error) {
                SweetAlert.close();
                console.log(error);
              });
          }
        });
    };

    $scope.questionTypes = [];
    $scope.questionTypes.push({ id: 0, type: 'input' });
    
  }
]);
