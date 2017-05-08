/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const jsdom = require('jsdom').jsdom;
const loadSeedData = require('../helper/load-seed-data');

describe('POST /login', () => {
	let request;
	let testLoginData;

	beforeEach(() => {
		testLoginData = {
			email: 'admin@example.com',
			password: 'password'
		};
		request = agent
			.post('/login')
			.set('Content-Type', 'application/x-www-form-urlencoded');
		return loadSeedData(dashboard, 'base');
	});

	describe('when everything is valid', () => {

		beforeEach(() => {
			request.send(testLoginData);
		});

		it('responds with a 302 status', done => {
			request.expect(302).end(done);
		});

		it('responds with a location header pointing to the home page', done => {
			request.expect('Location', '/').end(done);
		});

		it('responds with a session cookie', done => {
			request.expect('Set-Cookie', /sidekick.sid=/i).end(done);
		});

		it('creates a session in the database', done => {
			request.end(() => {
				let adminUser;
				dashboard.database.select('*').from('users').where({email: testLoginData.email})
					.then(users => {
						adminUser = users[0];
						return dashboard.database.select('*').from('sessions');
					})
					.then(sessions => {
						assert.strictEqual(sessions.length, 1);
						assert.strictEqual(sessions[0].sess.userId, adminUser.id);
						done();
					})
					.catch(done);
			});
		});

	});

	describe('when a `referer` query parameter is present', () => {

		beforeEach(() => {
			testLoginData.referer = '/mock-referer';
			request.send(testLoginData);
		});

		it('responds with a 302 status', done => {
			request.expect(302).end(done);
		});

		it('responds with a location header pointing to the referer', done => {
			request.expect('Location', '/mock-referer').end(done);
		});

	});

	describe('when the email is invalid', () => {

		beforeEach(() => {
			testLoginData.email = 'notanemail';
			request.send(testLoginData);
		});

		it('responds with a 401 status', done => {
			request.expect(401).end(done);
		});

		it('responds with HTML', done => {
			request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('does not respond with a session cookie', done => {
			request.expect(response => {
				assert.isUndefined(response.headers['set-cookie']);
			}).end(done);
		});

		it('responds with the login page containing an error', done => {
			request.expect(response => {
				jsdom.env(response.text, (error, window) => {
					const document = window.document;

					// Check page title
					assert.match(document.querySelector('title').textContent, /login/i);

					// Check error message
					assert.match(document.querySelector('output[name="error"]').textContent, /incorrect email or password/i);

					// Check that the form data is set
					const form = document.querySelector('form[action="/login"]');
					const emailField = form.querySelector('input[name="email"]');
					assert.strictEqual(emailField.getAttribute('value'), testLoginData.email);
					const passwordField = form.querySelector('input[name="password"]');
					assert.strictEqual(passwordField.getAttribute('value'), null);
				});

			}).end(done);
		});

	});

	describe('when the password is invalid', () => {

		beforeEach(() => {
			testLoginData.password = 'nottherightpassword';
			request.send(testLoginData);
		});

		it('responds with a 401 status', done => {
			request.expect(401).end(done);
		});

		it('responds with HTML', done => {
			request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('does not respond with a session cookie', done => {
			request.expect(response => {
				assert.isUndefined(response.headers['set-cookie']);
			}).end(done);
		});

		it('responds with the login page containing an error', done => {
			request.expect(response => {
				jsdom.env(response.text, (error, window) => {
					const document = window.document;

					// Check page title
					assert.match(document.querySelector('title').textContent, /login/i);

					// Check error message
					assert.match(document.querySelector('output[name="error"]').textContent, /incorrect email or password/i);

					// Check that the form data is set
					const form = document.querySelector('form[action="/login"]');
					const emailField = form.querySelector('input[name="email"]');
					assert.strictEqual(emailField.getAttribute('value'), testLoginData.email);
					const passwordField = form.querySelector('input[name="password"]');
					assert.strictEqual(passwordField.getAttribute('value'), null);
				});
			}).end(done);
		});

	});

});
