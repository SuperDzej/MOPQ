"use strict";

module.exports = function (sequelize, DataTypes) {

  var Questionnaire = sequelize.define('questionnaire', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 100],
          msg: "Questionnaire name must be between 1 and 100 characters in length"
        },
      }
    },
    description: DataTypes.TEXT,
    duration: DataTypes.INTEGER
  }, {
    associate: function (models) {
      Questionnaire.belongsTo(models.user);
      Questionnaire.hasMany(models.question, {
        as: 'questions',
        onDelete: 'cascade',
        hooks: true
      });
    }
  });

  return Questionnaire;
};
