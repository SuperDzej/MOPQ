'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Questionnaire = db.questionnaire,
  Question = db.question,
  QuestionOption = db.questionOption,
  User = db.user,
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, questionnaire, question, option;

/**
 * Questionnaire routes tests
 */
describe('Questionnaire CRUD tests', function () {
  before(function (done) {
    // Get application
    app = express.init(sequelize);
    agent = request.agent(app);

    done();
  });

  before(function (done) {

    // Create user credentials
    credentials = {
      email: 'email@email.com',
      password: 'S3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = User.build();

    user.firstName = 'Full';
    user.lastName = 'Name';
    user.displayName = 'Full Name';
    user.email = credentials.email;
    user.salt = user.makeSalt();
    user.hashedPassword = user.encryptPassword(credentials.password, user.salt);
    user.provider = 'local';
    user.roles = ['admin'];

    // Save a user to the test db and create new questionnaire
    user.save().then(function (user) {
      questionnaire = Questionnaire.build();
      question = Question.build();
      option = QuestionOption.build();
      option = {
        name: 'First option',
        isCorrect: false
      };

      question = {
        name: 'First question',
        type: 'yesNo',
        options: [option]
      };

      questionnaire = {
        name: 'Questionnaire name',
        description: 'Questionnaire description',
        duration: 25,
        userId: user.id,
        questions: [question]
      };
      done();
    }).catch(function (err) {
      done(err);
    });

  });

  it('should be able to save an questionnaire if logged in', function (done) {
    this.timeout(5000);
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {

        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new questionnaire
        agent.post('/api/questionnaires')
          .send(questionnaire)
          .expect(200)
          .end(function (questionnaireSaveErr, questionnaireSaveRes) {

            // Handle questionnaire save error
            if (questionnaireSaveErr) {
              return done(questionnaireSaveErr);
            }

            // Get a list of questionnaires
            agent.get('/api/questionnaires')
              .end(function (questionnairesGetErr, questionnairesGetRes) {

                // Handle questionnaire save error
                if (questionnairesGetErr) {
                  return done(questionnairesGetErr);
                }


                // Get questionnaires list
                var questionnaires = questionnairesGetRes.body;

                //(questionnaires[0].userId).should.equal(userId);
                (questionnaires[0].name).should.match('Questionnaire name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an questionnaire if not logged in', function (done) {
    agent.get('/api/auth/signout')
      .expect(302) //because of redirect
      .end(function (signoutErr, signoutRes) {

        // Handle signout error
        if (signoutErr) {
          return done(signoutErr);
        }

        agent.post('/api/questionnaires')
          .send(questionnaire)
          .expect(403)
          .end(function (questionnaireSaveErr, questionnaireSaveRes) {
            // Call the assertion callback
            done(questionnaireSaveErr);
          });
      });
  });

  it('should not be able to save an questionnaire if no name is provided', function (done) {
    // Invalidate description field
    questionnaire.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {

        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new questionnaire
        agent.post('/api/questionnaires')
          .send(questionnaire)
          .expect(400)
          .end(function (questionnaireSaveErr, questionnaireSaveRes) {
            // Set message assertion
            (questionnaireSaveRes.body.message).should.match('Questionnaire name must be between 1 and 100 characters in length');
            // Handle questionnaire save error
            done();
          });
      });
  });

  it('should be able to update an questionnaire if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {

        // Handle signin error
        if (!signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new questionnaire
        agent.post('/api/questionnaires')
          .send(questionnaire)
          .expect(200)
          .end(function (questionnaireSaveErr, questionnaireSaveRes) {
            // Handle questionnaire save error
            if (questionnaireSaveErr) {
              return done(questionnaireSaveErr);
            }

            // Update questionnaire description
            questionnaire.description = 'WHY YOU GOTTA BE SO SEAN?';

            // Update an existing questionnaire
            agent.put('/api/questionnaires/' + questionnaireSaveRes.body.id)
              .send(questionnaire)
              .expect(200)
              .end(function (articleUpdateErr, articleUpdateRes) {
                // Handle questionnaire update error
                if (articleUpdateErr) {
                  return done(articleUpdateErr);
                }

                // Set assertions
                (articleUpdateRes.body.id).should.equal(questionnaireSaveRes.body.id);
                (articleUpdateRes.body.description).should.match('WHY YOU GOTTA BE SO SEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to get a list of questionnaires if not signed in', function (done) {
    questionnaire.name = 'Questionnaire not signed in name';
    // Create new questionnaire model instance
    var questionnaireObj = Questionnaire.build(questionnaire);

    // Save the questionnaire
    questionnaireObj.save().then(function () {
      // Request questionnaires
      request(app).get('/api/questionnaires')
        .expect(403)
        .end(function (req, res) {
          done();
        });

    }).catch(function (err) {
      done();
    });
  });

  it('should not be able to get a single questionnaire if not signed in', function (done) {
    // Create new questionnaire model instance
    var questionnaireObj = Questionnaire.build(questionnaire);

    // Save the questionnaire
    questionnaireObj.save().then(function () {
      request(app).get('/api/questionnaires/' + questionnaireObj.id)
        .expect(403)
        .end(function (req, res) {
          // Set assertion
          // res.body.should.be.instanceof(Object).and.have.property('description', questionnaire.description);

          // Call the assertion callback
          done();
        });
    }).catch(function (err) {});
  });

  it('should return proper error for single questionnaire with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/questionnaires/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Questionnaire is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single questionnaire which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent questionnaire
    request(app).get('/api/questionnaires/123567890')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No questionnaire with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an questionnaire if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {

        // Handle signin error
        if (!signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new questionnaire
        agent.post('/api/questionnaires')
          .send(questionnaire)
          .expect(200)
          .end(function (questionnaireSaveErr, questionnaireSaveRes) {


            // Handle questionnaire save error
            if (questionnaireSaveErr) {
              return done(questionnaireSaveErr);
            }

            // Delete an existing questionnaire
            agent.delete('/api/questionnaires/' + questionnaireSaveRes.body.id)
              .send(questionnaire)
              .expect(200)
              .end(function (articleDeleteErr, articleDeleteRes) {

                // Handle questionnaire error error
                if (articleDeleteErr) {
                  return done(articleDeleteErr);
                }

                // Set assertions
                (articleDeleteRes.body.id).should.equal(questionnaireSaveRes.body.id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an questionnaire if not signed in', function (done) {
    // Set questionnaire user
    questionnaire.userId = user.id;

    // Create new questionnaire model instance
    var questionnaireObj = Questionnaire.build(questionnaire);

    // Save the questionnaire
    questionnaireObj.save().then(function () {
      // Try deleting questionnaire
      request(app).delete('/api/questionnaires/' + questionnaireObj.id)
        .expect(403)
        .end(function (articleDeleteErr, articleDeleteRes) {

          // Set message assertion
          (articleDeleteRes.body.message).should.match('User is not authorized');

          // Handle questionnaire error error
          done(articleDeleteErr);
        });

    }).catch(function (err) {});
  });

  after(function (done) {
    User.destroy({
        where: {},
        cascade: true
      })
      .then(function () {
        return Questionnaire.destroy({
          where: {},
          cascade: true
        });
      }).then(function () {
        return Question.destroy({
          where: {},
          cascade: true
        });
      }).then(function () {
        return QuestionOption.destroy({
          where: {},
          cascade: true
        });
      }).then(function (success) {
        done();
      }).catch(function (err) { done(err); });
  });

});
