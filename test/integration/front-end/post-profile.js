/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const authenticateWithUser = require('../helper/authenticate-with-user');
const bcrypt = require('bcrypt');
const jsdom = require('jsdom').jsdom;
const loadSeedData = require('../helper/load-seed-data');

describe('POST /profile', () => {
	let request;
	let testEdits;

	beforeEach(() => {
		testEdits = {
			email: 'new@example.com',
			password: 'new-password'
		};
		return loadSeedData(dashboard, 'base');
	});

	describe('authenticated', () => {

		describe('when everything is valid', () => {

			beforeEach(() => {
				return Promise.resolve()
					.then(() => authenticateWithUser('admin@example.com', 'password'))
					.then(cookie => {
						request = agent
							.post('/profile')
							.set('Content-Type', 'application/x-www-form-urlencoded')
							.set('Cookie', cookie)
							.send(testEdits);
					});
			});

			it('responds with a 302 status', done => {
				request.expect(302).end(done);
			});

			it('responds with a location header pointing to profile page', done => {
				request.expect('Location', '/profile').end(done);
			});

			it('updates the user details in the database', done => {
				request.end(() => {
					dashboard.database.select('*').from('users').where({email: 'new@example.com'})
						.then(users => {
							assert.isDefined(users[0]);
							assert.strictEqual(users[0].email, 'new@example.com');
							assert.isTrue(bcrypt.compareSync('new-password', users[0].password));
							assert.strictEqual(users[0].apiKey, 'mock-admin-api-key');
							done();
						})
						.catch(done);
				});
			});

		});

		describe('when no password is specified', () => {

			beforeEach(() => {
				testEdits.password = '';
				return Promise.resolve()
					.then(() => authenticateWithUser('admin@example.com', 'password'))
					.then(cookie => {
						request = agent
							.post('/profile')
							.set('Content-Type', 'application/x-www-form-urlencoded')
							.set('Cookie', cookie)
							.send(testEdits);
					});
			});

			it('responds with a 302 status', done => {
				request.expect(302).end(done);
			});

			it('responds with a location header pointing to profile page', done => {
				request.expect('Location', '/profile').end(done);
			});

			it('updates the user details in the database, but does not touch the password', done => {
				request.end(() => {
					dashboard.database.select('*').from('users').where({email: 'new@example.com'})
						.then(users => {
							assert.isDefined(users[0]);
							assert.strictEqual(users[0].email, 'new@example.com');
							assert.isTrue(bcrypt.compareSync('password', users[0].password));
							assert.strictEqual(users[0].apiKey, 'mock-admin-api-key');
							done();
						})
						.catch(done);
				});
			});

		});

		describe('when the email is invalid', () => {

			beforeEach(() => {
				testEdits.email = 'notanemail';
				return Promise.resolve()
					.then(() => authenticateWithUser('admin@example.com', 'password'))
					.then(cookie => {
						request = agent
							.post('/profile')
							.set('Content-Type', 'application/x-www-form-urlencoded')
							.set('Cookie', cookie)
							.send(testEdits);
					});
			});

			it('responds with a 400 status', done => {
				request.expect(400).end(done);
			});

			it('responds with HTML', done => {
				request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
			});

			it('responds with the profile page containing an error', done => {
				request.expect(response => {
					jsdom.env(response.text, (error, window) => {
						const document = window.document;

						// Check page title
						assert.match(document.querySelector('title').textContent, /profile/i);

						// Check error message
						assert.match(document.querySelector('output[name="error"]').textContent, /valid email address/i);

						// Check that the form data is set
						const form = document.querySelector('form[action="/profile"]');
						const emailField = form.querySelector('input[name="email"]');
						assert.strictEqual(emailField.getAttribute('type'), 'email');
						assert.strictEqual(emailField.getAttribute('value'), testEdits.adminEmail);
						const passwordField = form.querySelector('input[name="password"]');
						assert.strictEqual(passwordField.getAttribute('value'), null);
					});
				}).end(done);
			});

		});

	});

	describe('unauthenticated', () => {

		beforeEach(() => {
			request = agent.post('/profile');
		});

		it('responds with a 401 status', done => {
			request.expect(401).end(done);
		});

	});

});
