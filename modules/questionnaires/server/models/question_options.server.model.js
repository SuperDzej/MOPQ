'use strict';
module.exports = function (sequelize, DataTypes) {

  var QuestionOption = sequelize.define('questionOption', {
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
          msg: "Question option name must be between 1 and 200 characters in length"
        },
      }
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    associate: function (models) {
      QuestionOption.belongsTo(models.question, { onDelete: 'cascade' });
    }
  });

  return QuestionOption;
};
