'use strict';
module.exports = function (sequelize, DataTypes) {

  var QuestionnairePlay = sequelize.define('questionnairePlay', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    started: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    associate: function (models) {
      QuestionnairePlay.belongsTo(models.user);
      QuestionnairePlay.belongsTo(models.questionnaire, { onDelete: 'cascade' });
      QuestionnairePlay.hasMany(models.questionAnswer, {
        as: 'answers'
      });
    }
  });

  return QuestionnairePlay;
};
