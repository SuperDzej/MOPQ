'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	sequelize = require(path.resolve('./config/lib/sequelize-connect')),
	db = require(path.resolve('./config/lib/sequelize')).models,
	Questionnaire = db.questionnaire,
	Question = db.question,
	QuestionOption = db.questionOption,
	QuestionnairePlay = db.questionnairePlay,
	QuestionAnswer = db.questionAnswer,
	User = db.user,
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, questionnaire, question, option, questionAnswer, questionnairePlay;

/**
 * Questionnaire routes tests
 */
describe('Questionnaire Play CRUD tests', function () {
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
		user.save()
			.then(function (user) {
				questionnaire = Questionnaire.build({
					name: 'Questionnaire name',
					description: 'Questionnaire description',
					duration: 25,
					userId: user.id
				});

				questionnaire.save().then(function (questionnaire) {
					question = Question.build({
						name: 'First question',
						type: 'yesNo',
						questionnaireId: questionnaire.id
					});

					return question.save();
				}).then(function (question) {
					option = QuestionOption.build({
						name: 'First option',
						isCorrect: false,
						questionId: question.id
					});
					return option.save();
				}).then(function (option) {
					questionAnswer = {
						name: 'This is answer'
					};

					questionnairePlay = {
						started: new Date(),
						answers: [questionAnswer]
					};
					done();
				}).catch(function (err) {
					done(err);
				});
			}).catch(function (err) {
				done(err);
			});

	});

	it('should be able to save an questionnaire play if logged in', function (done) {
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

				// Save a new questionnaire play
				agent.post('/api/questionnaires/play/' + questionnaire.id)
					.send(questionnairePlay)
					.expect(200)
					.end(function (questionnaireSaveErr, questionnaireSaveRes) {
						console.log(questionnaireSaveRes.body);
						// Handle questionnaire save error
						if (questionnaireSaveErr) {
							return done(questionnaireSaveErr);
						}

						done();
					});
			});
	});

	it('should not be able to save an questionnaire play if not logged in', function (done) {

		// Invalidate description field
		let localPlay = {
			started: null,
			answers: []
		};
		let localQuestionnaire = Questionnaire.build({
			name: 'Questionnaire name1s',
			description: 'Questionnaire description1s',
			duration: 22,
			userId: user.id
		});

		// Get by id is called before role auth is called so I need to make new questionnaire to avoid error with questionnaire already played
		localQuestionnaire.save().then(function (localQuestionnaire) {
			agent.get('/api/auth/signout')
				.expect(302) //because of redirect
				.end(function (signoutErr, signoutRes) {

					// Handle signout error
					if (signoutErr) {
						return done(signoutErr);
					}

					agent.post('/api/questionnaires/play/' + localQuestionnaire.id)
						.send(questionnairePlay)
						.expect(403)
						.end(function (questionnaireSaveErr, questionnaireSaveRes) {
							// Call the assertion callback
							done(questionnaireSaveErr);
						});
				});
		}).catch(function (err) {
			done(err);
		});
	});

	it('should not be able to save an questionnaire play if no started time is provided', function (done) {
		// Invalidate description field
		let localPlay = {
			started: null,
			answers: []
		};
		let localQuestionnaire = Questionnaire.build({
			name: 'Questionnaire name1',
			description: 'Questionnaire description1',
			duration: 30,
			userId: user.id
		});

		localQuestionnaire.save().then(function (localQuestionnaire) {
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
					agent.post('/api/questionnaires/play/' + localQuestionnaire.id)
						.send(localPlay)
						.expect(400)
						.end(function (questionnaireSaveErr, questionnaireSaveRes) {
							// Set message assertion
							(questionnaireSaveRes.body.message).should.match('questionnairePlay.started cannot be null');
							// Handle questionnaire save error
							done();
						});
				});
		}).catch(function (err) {
			done(err);
		});
	});

	it('should not be able to get a score calculation of questionnaires play if not signed in', function (done) {
		agent.get('/api/auth/signout')
			.expect(302) //because of redirect
			.end(function (signoutErr, signoutRes) {

				// Handle signout error
				if (signoutErr) {
					return done(signoutErr);
				}

				// Request questionnaires
				agent.get('/api/questionnaires/play/score/' + questionnaire.id)
					.expect(403)
					.end(function (req, res) {
						done();
					});
			});
	});
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
		}).then(function () {
			return QuestionnairePlay.destroy({
				where: {},
				cascade: true
			});
		}).then(function () {
			return QuestionAnswer.destroy({
				where: {},
				cascade: true
			});
		}).then(function (success) {
			done();
		}).catch(function (err) {
			done(err);
		});
});
