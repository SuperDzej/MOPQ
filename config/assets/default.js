'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/sweetalert/dist/sweetalert.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.css',
        'public/lib/jquery-ui/themes/base/jquery-ui.css',
        'public/lib/angularjs-datepicker/dist/angular-datepicker.css'
      ],
      js: [
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/jquery-ui/jquery-ui.js',
        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-file-upload/angular-file-upload.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'https://www.google.com/recaptcha/api.js',

        'public/lib/bootstrap/dist/js/bootstrap.min.js',

        'public/lib/gasparesganga-jquery-loading-overlay/src/loadingoverlay.js',
        'public/lib/sweetalert/dist/sweetalert.min.js',
        'public/lib/ngSweetAlert/SweetAlert.min.js',
        'public/lib/angularjs-datepicker/dist/angular-datepicker.min.js',
        'public/lib/d3/d3.min.js'
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    views: ['modules/*/client/views/**/*.html'],
    polyfill: 'node_modules/babel-polyfill/dist/polyfill.js',
    templates: ['build/templates.js']
  },
  server: {
    gruntConfig: 'gruntfile.js',
    gulpConfig: 'gulpfile.js',
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: 'modules/*/server/config/*.js',
    policies: 'modules/*/server/policies/*.js',
    views: 'modules/*/server/views/*.html'
  }
};
