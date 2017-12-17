'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'QuestionnaireService',
  function($scope, Authentication, QuestionnaireService) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    $scope.getShortDescription = function(description) {
      var shortDescription = '';
      var wordCount = 0, maxWords = 30;
      for(var j = 0;j < description.length;j++) {
        if(description[j] === ' ') {
          wordCount++;
        }

        if(wordCount === maxWords) {
          break;
        }
        shortDescription =  shortDescription.concat(description[j]);
      }

      return shortDescription;
    };

    $scope.getQuestionnaires = function() {
      $scope.questionnaires = [];
      if($scope.authentication.user !== '') {
        QuestionnaireService.get()
        .then(function (response) {
          $scope.questionnaires = response.data;
        });
      }
    };
  }
]);