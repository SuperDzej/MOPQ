'use strict';

describe('Questionnaires E2E Tests:', function() {
  describe('Test questionnaires page', function() {
    it('Should report missing credentials', function() {
      browser.get('http://localhost:3000/questionnaires');
      expect(element.all(by.repeater('questionnaire in questionnaires')).count()).toEqual(0);
    });
  });
});