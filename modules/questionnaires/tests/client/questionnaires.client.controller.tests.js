'use strict';

(function() {
  // Questionnaires Controller Spec
  describe('Questionnaires Controller Tests', function() {
    // Initialize global variables
    var ArticlesController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Questionnaires,
      mockQuestionnaire;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function() {
      jasmine.addMatchers({
        toEqualData: function(util, customEqualityTesters) {
          return {
            compare: function(actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Articles_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Questionnaires = _Articles_;

      // create mock questionnaire
      mockQuestionnaire = new Questionnaires({
        id: '525a8422f6d0f87f0e407a33',
        title: 'An Questionnaire about SEANJS',
        content: 'SEANJS rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Questionnaires controller.
      ArticlesController = $controller('ArticlesController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one questionnaire object fetched from XHR', inject(function(Questionnaires) {
      // Create a sample articles array that includes the new questionnaire
      var sampleArticles = [mockQuestionnaire];

      // Set GET response
      $httpBackend.expectGET('api/articles').respond(sampleArticles);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.articles).toEqualData(sampleArticles);
    }));

    it('$scope.findOne() should create an array with one questionnaire object fetched from XHR using a articleId URL parameter', inject(function(Questionnaires) {
      // Set the URL parameter
      $stateParams.articleId = mockQuestionnaire.id;

      // Set GET response
      $httpBackend.expectGET(/api\/articles\/([0-9a-fA-F]{24})$/).respond(mockQuestionnaire);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.questionnaire).toEqualData(mockQuestionnaire);
    }));

    describe('$scope.create()', function() {
      var sampleArticlePostData;

      beforeEach(function() {
        // Create a sample questionnaire object
        sampleArticlePostData = new Questionnaires({
          title: 'An Questionnaire about SEANJS',
          content: 'SEANJS rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Questionnaire about SEANJS';
        scope.content = 'SEANJS rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function(Questionnaires) {
        // Set POST response
        $httpBackend.expectPOST('api/articles', sampleArticlePostData).respond(mockQuestionnaire);

        // Run controller functionality
        scope.create(true);
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the questionnaire was created
        expect($location.path.calls.mostRecent().args[0]).toBe('articles/' + mockQuestionnaire.id);
      }));

      it('should set scope.error if save error', function() {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/articles', sampleArticlePostData).respond(400, {
          message: errorMessage
        });

        scope.create(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function() {
      beforeEach(function() {
        // Mock questionnaire in scope
        scope.questionnaire = mockQuestionnaire;
      });

      it('should update a valid questionnaire', inject(function(Questionnaires) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/articles\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/articles/' + mockQuestionnaire.id);
      }));

      it('should set scope.error to error response message', inject(function(Questionnaires) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/articles\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(questionnaire)', function() {
      beforeEach(function() {
        // Create new articles array and include the questionnaire
        scope.articles = [mockQuestionnaire, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/articles\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockQuestionnaire);
      });

      it('should send a DELETE request with a valid articleId and remove the questionnaire from the scope', inject(function(Questionnaires) {
        expect(scope.articles.length).toBe(2); //Because of the empty object - must be 1
      }));
    });

    describe('scope.remove()', function() {
      beforeEach(function() {
        spyOn($location, 'path');
        scope.questionnaire = mockQuestionnaire;

        $httpBackend.expectDELETE(/api\/articles\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to articles', function() {
        expect($location.path).toHaveBeenCalledWith('articles');
      });
    });
  });
}());