'use strict';
module.exports = function (sequelize, DataTypes) {

  var QuestionAnswer = sequelize.define('questionAnswer', {
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
          msg: "Question answer name must be between 1 and 200 characters in length"
        },
      }
    }
  }, {
    associate: function (models) {
        QuestionAnswer.belongsTo(models.question, { onDelete: 'cascade' });
        QuestionAnswer.belongsTo(models.questionOption);
        QuestionAnswer.belongsTo(models.questionnairePlay, {
          foreignKeyConstraint: true, 
          onDelete: 'cascade'
        });
    }
  });

  return QuestionAnswer;
};
