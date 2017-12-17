'use strict';

var
  path = require('path'),
  config = require(path.resolve('./config/config')),
  acl = require('acl');

/**
 * Module dependencies.
 */

// Using the redis backend
/*
var redisInstance = require('redis').createClient(config.redis.port, config.redis.host, {
  no_ready_check: true
});

//Use redis database 1
redisInstance.select(1);

if (config.redis.password) {
  redisInstance.auth(config.redis.password);
}

acl = new acl(new acl.redisBackend(redisInstance, 'acl'));
*/

// Using the memory backend
acl = new acl(new acl.memoryBackend());


/**
 * Invoke Questionnaires Permissions
 */
exports.invokeRolesPolicies = function() {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/questionnaires',
      permissions: '*'
    }, {
      resources: '/api/questionnaires/questiontypes',
      permissions: '*'
    }, {
      resources: '/api/questionnaires/:questionnaireId',
      permissions: '*'
    }, {
      resources: '/api/questionnaires/play/:questionnaireIdForPlay',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/questionnaires',
      permissions: ['get']
    }, {
      resources: '/api/questionnaires/:questionnaireId',
      permissions: []
    }, {
      resources: '/api/questionnaires/play/:questionnaireIdForPlay',
      permissions: ['get', 'post']
    }, {
      resources: '/api/questionnaires/questiontypes',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/questionnaires',
      permissions: []
    }, {
      resources: '/api/questionnaires/:questionnaireId',
      permissions: []
    }]
  }]);
};

/**
 * Check If Questionnaires Policy Allows
 */
exports.isAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];
  // If an questionnaire is being processed and the current user created it then allow any manipulation
  if (req.questionnaire && req.user && req.questionnaire.userId === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
    if (err) {
      // An authorization error occurred.
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        console.log(isAllowed);
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
