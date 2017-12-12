'use strict';

module.exports = function (sequelize, DataTypes) {

  var Question = sequelize.define('question', {
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
          args: [1, 200],
          msg: "Questionnaire name must be between 1 and 200 characters in length"
        },
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'input'
    }
  }, {
    associate: function (models) {
      Question.belongsTo(models.questionnaire, { onDelete: 'cascade' });
      Question.hasMany(models.questionOption, {
        as: 'options'
      });
    }
  });

  return Question;
};
