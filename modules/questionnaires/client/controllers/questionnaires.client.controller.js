'use strict';

// CertificateFactory controller
angular.module('questionnaires')
.controller('QuestionnaireController', ['$scope', '$rootScope', '$stateParams', '$location', '$timeout', '$window', 'Authentication', 'Questionnaires', 'QuestionnaireService', 'SweetAlert', 'FileUploader',
  function ($scope, $rootScope, $stateParams, $location, $timeout, $window, Authentication, Questionnaires, QuestionnaireService, SweetAlert, FileUploader) {
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
        }).catch(function(error) {
          $scope.error = error;
        });
    };

    // Find a list of CertificateFactory
    $scope.find = function () {
      $scope.questionnaires = Questionnaires.query();
    };

    $scope.questions = [{
      id: 'question1',
      options: []
    }];

    // START Add or remove question or option 
    $scope.addNewQuestion = function ($event) {
      $event.preventDefault();
      var newItemNo = $scope.questions.length + 1;
      $scope.questions.push({
        'id': 'question' + newItemNo,
        type: '',
        options: []
      });
    };

    $scope.addNewOption = function ($event) {
      $event.preventDefault();
      var options = $scope.questions[$scope.questions.length - 1].options;
      var newItemNo = options.length + 1;
      $scope.questions[$scope.questions.length - 1].options.push({
        'id': 'option' + newItemNo
      });

      var oneElement = 1;
      //Just show popover first time
      if ($scope.questions.length === oneElement && 
        $scope.questions[0].options.length === oneElement) {
        $scope.$$postDigest(function () {
          showPopover();
        });
      }
    };

    $scope.removeQuestion = function () {
      var lastItem = $scope.questions.length - 1;
      if(lastItem === 0)
      {
        return;
      }

      $scope.questions.splice(lastItem);
    };

    $scope.removeQuestionOption = function (questionIndex) {
      var lastItem = $scope.questions[questionIndex].options.length - 1;
      if(lastItem === 0)
      {
        return;
      }

      $scope.questions[questionIndex].options.splice(lastItem);
    };
    // END Add or remove question or option 

    $scope.create = function (isValid) {
      $scope.questionnaire.questions = $scope.questions;
      QuestionnaireService.create($scope.questionnaire)
        .then(function (response) {
          $scope.createdSuccessfully = true;
          $scope.questionnaire = {};
          $location.path(baseUrl+ '/' + response.data.id);
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

    $scope.delete = function (questionnaire, index) {
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
                $scope.questionnaires.splice(index, 1);
                SweetAlert.swal("Successfully deleted questionnaire!");
              }, function (error) {
                SweetAlert.close();
                console.log(error);
              });
          }
        });
    };

    $scope.getQuestionTypes = function() {
      QuestionnaireService.getQuestionTypes()
      .then(function(response) {
        $scope.questionTypes = response.data;
        console.log($scope.questionTypes);
      });
    };
  }
]);
