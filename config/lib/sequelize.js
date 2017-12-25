"use strict";

var
  path = require('path'),
  config = require(path.resolve('./config/config')),
  Sequelize = require('sequelize'),
  winston = require('./winston'),
  db = {},
  pg = require('pg');

db.Sequelize = Sequelize;
db.models = {};
db.discover = [];

// Expose the connection function
db.connect = function (database, username, password, options) {

  if (typeof db.logger === 'function')
    winston.info("Connecting to: " + database + " as: " + username);

  // Instantiate a new sequelize instance
  var sequelize = new db.Sequelize(database, username, password, options);


  db.discover.forEach(function (location) {
    var model = sequelize["import"](location);
    if (model)
      db.models[model.name] = model;
  });

  // Execute the associate methods for each Model
  Object.keys(db.models).forEach(function (modelName) {
    if (db.models[modelName].options.hasOwnProperty('associate')) {
      db.models[modelName].options.associate(db.models);
      winston.info("Associating Model: " + modelName);
    }
  });

  if (config.db.sync) {
    // Synchronizing any model changes with database.
    sequelize.sync()
      .then(function () {
        winston.info("Database synchronized");
      }).catch(function (err) {
        winston.error("An error occured: %j", err);
      });
  }

  db.sequelize = sequelize;

  winston.info("Finished Connecting to Database");

  return true;
};

db.connectURI = function (uri) {
  var client = new pg.Client(uri);
  client.connect(function (err) {
    if (err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT NOW() AS "theTime"', function (err, result) {
      if (err) {
        return console.error('error running query', err);
      }
      console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });
};

module.exports = db;
