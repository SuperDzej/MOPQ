'use strict';

// CertificateFactory controller
angular.module('questionnaires').controller('QuestionnairePlayController', ['$scope', '$rootScope', '$stateParams', '$location', '$localstorage', '$window', 'Authentication', 'QuizFactory', 'QuestionnaireService', 'SweetAlert', 'FileUploader',
  function ($scope, $rootScope, $stateParams, $location, $localstorage, $window, Authentication, QuizFactory, QuestionnaireService, SweetAlert, FileUploader) {
    $scope.authentication = Authentication;
    $rootScope.mainTitle = 'Questionnaires';
    $scope.quizFinished = false;
    var answerStorageKey = 'answers', finishedStorageKey = 'finished', greenBackgroundClass = 'greenBackground', mainBackgroundClass = 'mainBackground';
    var vm = this;
    $scope.questionnaire = {};
    $scope.currentQuestion = 0;

    $scope.getByID = function () {
      var id = $stateParams.questionnaireId;
      answerStorageKey += id;
      finishedStorageKey += id;

      var finishedObject = $localstorage.getObject(finishedStorageKey);
      if (finishedObject && finishedObject.questionnaire === id) {
        $scope.currentQuestion = finishedObject.answers.length;
      }
      angular.element('.' + mainBackgroundClass).addClass(greenBackgroundClass);

      QuestionnaireService.getByIDForPlay(id)
        .then(function (response) {
          if(response.status === 200) {
            $scope.questionnaire = response.data;
            /* var answers = $localstorage.getObject(answerStorageKey);
            if (answers.length !== undefined) {
              $scope.currentQuestion = answers.length;
            } */

            // When user tries to navigate from the page
            addLocationChangeListener();
            $scope.startTime = new Date();
          }
          else {
            alert(response.data);
          }
        }, function (error) {
          var sweetAlert = SweetAlert.swal("Error!", error.data.message);
          setTimeout(function() {
            $window.location.href = '/';
          }, 2000);
        });
    };

    var addLocationChangeListener = function() {
      $scope.$on('$locationChangeStart', function (event, next, current) {
        if (current) {
          var answer = confirm('Are you sure you want to exit questionnaire?');
          if (!answer) {
            event.preventDefault();
          }
        }
      });
    };

    var match_operator_up = {
      '+': function (x, y) {
        return x + y;
      },
      '-': function (x, y) {
        return x - y;
      },
      '++': function (x) {
        return ++x;
      },
      '--': function (x) {
        return --x;
      }
    };

    var registerAnswer = function () {
      var question = $scope.questionnaire.questions[$scope.currentQuestion];
      for(let i = 0;i < question.options.length;i++) {
        
        var option = question.options[i];
        if(option.answer !== undefined && option.answer !== 'No') {
          $scope.answers.push({
            questionOptionId: option.id,
            questionId: question.id,
            name: option.answer.multiple ? option.answer.multiple : option.answer
          });
        }
      }

      $localstorage.setObject(answerStorageKey, $scope.answers);
    };

    $scope.switchQuestion = function (operator) {
      if ($scope.quizFinished) {
        return;
      }

      registerAnswer();
      var value = match_operator_up[operator]($scope.currentQuestion);
      $scope.currentQuestion = value;

      if (value >= $scope.questionnaire.questions.length) {
        if($scope.answers.length < $scope.questionnaire.questions.length) {
          $scope.currentQuestion--;
          alert('Please answer all questions');
          return false;
        }
        
        $scope.finishQuiz();
        return;
      }
    };

    $scope.finishQuiz = function () {
      $scope.quizFinished = true;
      $scope.currentQuestion = $scope.questionnaire.questions.length;

      var data = {
        answers: $scope.answers,
        started: $scope.startTime,
        questionnaire: $scope.questionnaire.id
      };

      QuestionnaireService.finishPlay(data, $scope.questionnaire.id)
        .then(function (response) {
          console.log(response.data);
        });
    };

    $scope.answers = [];
    $scope.registerAnswer = function (index) {
      registerAnswer(index);
    };

    $scope.$on("$destroy", function () {
      angular.element('.' + mainBackgroundClass).removeClass(greenBackgroundClass);
    });

    QuestionnaireService.getQuestionTypes()
      .then(function(response) {
        $scope.questionTypes = response.data;
      });
  }
]);
