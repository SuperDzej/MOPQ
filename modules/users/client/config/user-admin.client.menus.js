'use strict';

// Configuring the Questionnaires module
angular.module('user.admin').run(['Menus',
  function(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);