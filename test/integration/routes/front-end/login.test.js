'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
const querystring = require('querystring');
let response;

describe('GET /login', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/login');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

		it('responds with no error messages', () => {
			const errors = response.body.document.querySelectorAll('[data-test=login-form] [data-test=alert-error]');
			assert.lengthEquals(errors, 0);
		});

		it('responds with a login form', () => {
			const form = response.body.document.querySelector('[data-test=login-form]');
			assert.isNotNull(form);
			assert.strictEqual(form.getAttribute('action'), '/login');
			assert.strictEqual(form.getAttribute('method'), 'post');

			const emailField = form.querySelector('input[name="email"]');
			assert.strictEqual(emailField.getAttribute('type'), 'email');
			assert.strictEqual(emailField.getAttribute('value'), '');

			const passwordField = form.querySelector('input[name="password"]');
			assert.strictEqual(passwordField.getAttribute('type'), 'password');
			assert.strictEqual(passwordField.getAttribute('value'), '');

			const refererField = form.querySelector('input[name="referer"]');
			assert.isNull(refererField);
		});

	});

});

describe('GET /login?referer=:referer', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/login?referer=/mock-referer');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

		it('responds with no error messages', () => {
			const errors = response.body.document.querySelectorAll('[data-test=login-form] [data-test=alert-error]');
			assert.lengthEquals(errors, 0);
		});

		it('responds with a login form that has a referer field', () => {
			const form = response.body.document.querySelector('[data-test=login-form]');
			assert.isNotNull(form);
			assert.strictEqual(form.getAttribute('action'), '/login');
			assert.strictEqual(form.getAttribute('method'), 'post');

			const emailField = form.querySelector('input[name="email"]');
			assert.strictEqual(emailField.getAttribute('type'), 'email');
			assert.strictEqual(emailField.getAttribute('value'), '');

			const passwordField = form.querySelector('input[name="password"]');
			assert.strictEqual(passwordField.getAttribute('type'), 'password');
			assert.strictEqual(passwordField.getAttribute('value'), '');

			const refererField = form.querySelector('input[name="referer"]');
			assert.strictEqual(refererField.getAttribute('type'), 'hidden');
			assert.strictEqual(refererField.getAttribute('value'), '/mock-referer');
		});

	});

});

describe('POST /login', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/login', {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: querystring.stringify({
					email: 'admin@example.com',
					password: 'password'
				})
			});
		});

		it('creates a login session', async () => {
			const sessions = await dashboard.database.knex.select('*').from('sessions').limit(1);
			const session = sessions[0];

			assert.isObject(session, 'Session exists in the database');
			assert.isArray(response.headers['set-cookie'], 'Set-Cookie header is set');

			const sessionCookie = response.headers['set-cookie'][0];
			const sessionCookieId = sessionCookie.match('sidekick.sid=s%3A([^.]+)')[1];

			assert.strictEqual(session.sid, sessionCookieId, 'Session cookie IDs match');
			assert.strictEqual(session.sess.userId, 'mock-admin-id', 'Correct user is logged in');
		});

		it('responds with a 302 status', () => {
			assert.strictEqual(response.statusCode, 302);
		});

		it('responds with a Location header pointing to the home page', () => {
			assert.strictEqual(response.headers.location, '/');
		});

		it('responds with plain text', () => {
			assert.include(response.headers['content-type'], 'text/plain');
		});

	});

	describe('when a referer was sent with the form', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/login', {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: querystring.stringify({
					email: 'admin@example.com',
					password: 'password',
					referer: '/mock-referer?mock-param=mock-value'
				})
			});
		});

		it('responds with a 302 status', () => {
			assert.strictEqual(response.statusCode, 302);
		});

		it('responds with a Location header pointing to the referring page', () => {
			assert.strictEqual(response.headers.location, '/mock-referer?mock-param=mock-value');
		});

		it('responds with plain text', () => {
			assert.include(response.headers['content-type'], 'text/plain');
		});

	});

	describe('when the login email address does not exist', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/login', {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: querystring.stringify({
					email: 'notauser@example.com',
					password: 'password'
				})
			});
		});

		it('does not creates a login session', async () => {
			const sessions = await dashboard.database.knex.select('*').from('sessions').limit(1);
			assert.lengthEquals(sessions, 0);
			assert.isUndefined(response.headers['set-cookie']);
		});

		it('responds with a 401 status', () => {
			assert.strictEqual(response.statusCode, 401);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

		it('responds with an error message', () => {
			const errors = response.body.document.querySelectorAll('[data-test=login-form] [data-test=alert-error]');
			assert.lengthEquals(errors, 1);
			assert.match(errors[0].textContent, /email address is not registered, or password is incorrect/i);
		});

		it('responds with a login form that has a pre-filled email field', () => {
			const form = response.body.document.querySelector('[data-test=login-form]');
			assert.isNotNull(form);
			assert.strictEqual(form.getAttribute('action'), '/login');
			assert.strictEqual(form.getAttribute('method'), 'post');

			const emailField = form.querySelector('input[name="email"]');
			assert.strictEqual(emailField.getAttribute('type'), 'email');
			assert.strictEqual(emailField.getAttribute('value'), 'notauser@example.com');

			const passwordField = form.querySelector('input[name="password"]');
			assert.strictEqual(passwordField.getAttribute('type'), 'password');
			assert.strictEqual(passwordField.getAttribute('value'), '');
		});

	});

	describe('when the login password is incorrect', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/login', {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: querystring.stringify({
					email: 'admin@example.com',
					password: 'incorrectpassword'
				})
			});
		});

		it('does not creates a login session', async () => {
			const sessions = await dashboard.database.knex.select('*').from('sessions').limit(1);
			assert.lengthEquals(sessions, 0);
			assert.isUndefined(response.headers['set-cookie']);
		});

		it('responds with a 401 status', () => {
			assert.strictEqual(response.statusCode, 401);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

		it('responds with an error message', () => {
			const errors = response.body.document.querySelectorAll('[data-test=login-form] [data-test=alert-error]');
			assert.lengthEquals(errors, 1);
			assert.match(errors[0].textContent, /email address is not registered, or password is incorrect/i);
		});

		it('responds with a login form that has a pre-filled email field', () => {
			const form = response.body.document.querySelector('[data-test=login-form]');
			assert.isNotNull(form);
			assert.strictEqual(form.getAttribute('action'), '/login');
			assert.strictEqual(form.getAttribute('method'), 'post');

			const emailField = form.querySelector('input[name="email"]');
			assert.strictEqual(emailField.getAttribute('type'), 'email');
			assert.strictEqual(emailField.getAttribute('value'), 'admin@example.com');

			const passwordField = form.querySelector('input[name="password"]');
			assert.strictEqual(passwordField.getAttribute('type'), 'password');
			assert.strictEqual(passwordField.getAttribute('value'), '');
		});

	});

});
