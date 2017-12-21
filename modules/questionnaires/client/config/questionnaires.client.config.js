'use strict';

// Configuring the Questionnaires module
angular.module('questionnaires').run(['Menus',
  function (Menus) {
    // Add the questionnaires dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Questionnaires',
      state: 'questionnaires',
      type: 'dropdown',
      roles: ['admin']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'questionnaires', {
      title: 'List questionnaires',
      state: 'questionnaires.list',
      roles: ['admin']
    });

    Menus.addSubMenuItem('topbar', 'questionnaires', {
      title: 'Create Quiz',
      state: 'questionnaires.create',
      roles: ['admin']
    });
  }
]);
