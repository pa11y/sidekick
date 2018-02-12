'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
const {JSDOM} = require('jsdom');

describe('GET /login', () => {
	let request;

	beforeEach(async () => {
		await database.seed(dashboard, 'basic');
		request = agent.get('/login');
	});

	it('responds with a 200 status', () => {
		return request.expect(200);
	});

	it('responds with HTML', () => {
		return request.expect('Content-Type', /text\/html/);
	});

	describe('HTML response', () => {
		let dom;
		let errors;
		let form;

		beforeEach(async () => {
			dom = new JSDOM((await request.then()).text);
			form = dom.window.document.querySelector('[data-test=login-form]');
			errors = form.querySelectorAll('[data-test=alert-error]');
		});

		it('contains no error messages', () => {
			assert.lengthEquals(errors, 0);
		});

		it('contains a login form', () => {
			assert.isNotNull(form);
			assert.strictEqual(form.getAttribute('action'), '/login');
			assert.strictEqual(form.getAttribute('method'), 'post');
			assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');

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
	let request;

	beforeEach(async () => {
		await database.seed(dashboard, 'basic');
		request = agent.get('/login?referer=/mock-referer');
	});

	it('responds with a 200 status', () => {
		return request.expect(200);
	});

	it('responds with HTML', () => {
		return request.expect('Content-Type', /text\/html/);
	});

	describe('HTML response', () => {
		let dom;
		let form;

		beforeEach(async () => {
			dom = new JSDOM((await request.then()).text);
			form = dom.window.document.querySelector('[data-test=login-form]');
		});

		it('contains a login form with a referer field', () => {
			assert.isNotNull(form);

			const refererField = form.querySelector('input[name="referer"]');
			assert.strictEqual(refererField.getAttribute('type'), 'hidden');
			assert.strictEqual(refererField.getAttribute('value'), '/mock-referer');
		});

	});

});

describe('POST /login', () => {
	let request;

	beforeEach(async () => {
		await database.seed(dashboard, 'basic');
		request = agent
			.post('/login')
			.set('Content-Type', 'application/x-www-form-urlencoded');
	});

	describe('when everything is valid', () => {

		beforeEach(() => {
			request.send({
				email: 'admin@example.com',
				password: 'password'
			});
		});

		it('creates a login session', async () => {
			const response = await request.then();
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
			return request.expect(302);
		});

		it('responds with a Location header pointing to the home page', () => {
			return request.expect('Location', '/');
		});

		it('responds with plain text', () => {
			return request.expect('Content-Type', /text\/plain/);
		});

	});

	describe('when a referer was sent with the form', () => {

		beforeEach(() => {
			request.send({
				email: 'admin@example.com',
				password: 'password',
				referer: '/mock-referer?mock-param=mock-value'
			});
		});

		it('responds with a 302 status', () => {
			return request.expect(302);
		});

		it('responds with a Location header pointing to the referring page', () => {
			return request.expect('Location', '/mock-referer?mock-param=mock-value');
		});

		it('responds with plain text', () => {
			return request.expect('Content-Type', /text\/plain/);
		});

	});

	describe('when the login email address does not exist', () => {

		beforeEach(() => {
			request.send({
				email: 'notauser@example.com',
				password: 'password'
			});
		});

		it('does not creates a login session', async () => {
			const response = await request.then();
			const sessions = await dashboard.database.knex.select('*').from('sessions').limit(1);
			assert.lengthEquals(sessions, 0);
			assert.isUndefined(response.headers['set-cookie']);
		});

		it('responds with a 401 status', () => {
			return request.expect(401);
		});

		it('responds with HTML', () => {
			return request.expect('Content-Type', /text\/html/);
		});

		describe('HTML response', () => {
			let dom;
			let errors;
			let form;

			beforeEach(async () => {
				dom = new JSDOM((await request.then()).text);
				form = dom.window.document.querySelector('[data-test=login-form]');
				errors = form.querySelectorAll('[data-test=alert-error]');
			});

			it('contains an error message', () => {
				assert.lengthEquals(errors, 1);
				assert.match(errors[0].textContent, /email address is not registered, or password is incorrect/i);
			});

			it('contains a login form', () => {
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/login');
				assert.strictEqual(form.getAttribute('method'), 'post');
				assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');
			});

			it('fills the email address field but not the password', () => {
				const emailField = form.querySelector('input[name="email"]');
				assert.strictEqual(emailField.getAttribute('value'), 'notauser@example.com');
				const passwordField = form.querySelector('input[name="password"]');
				assert.strictEqual(passwordField.getAttribute('value'), '');
			});

		});

	});

	describe('when the login password is incorrect', () => {

		beforeEach(() => {
			request.send({
				email: 'admin@example.com',
				password: 'incorrectpassword'
			});
		});

		it('does not creates a login session', async () => {
			const response = await request.then();
			const sessions = await dashboard.database.knex.select('*').from('sessions').limit(1);
			assert.lengthEquals(sessions, 0);
			assert.isUndefined(response.headers['set-cookie']);
		});

		it('responds with a 401 status', () => {
			return request.expect(401);
		});

		it('responds with HTML', () => {
			return request.expect('Content-Type', /text\/html/);
		});

		describe('HTML response', () => {
			let dom;
			let errors;
			let form;

			beforeEach(async () => {
				dom = new JSDOM((await request.then()).text);
				form = dom.window.document.querySelector('[data-test=login-form]');
				errors = form.querySelectorAll('[data-test=alert-error]');
			});

			it('contains an error message', () => {
				assert.lengthEquals(errors, 1);
				assert.match(errors[0].textContent, /email address is not registered, or password is incorrect/i);
			});

			it('contains a login form', () => {
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/login');
				assert.strictEqual(form.getAttribute('method'), 'post');
				assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');
			});

			it('fills the email address field but not the password', () => {
				const emailField = form.querySelector('input[name="email"]');
				assert.strictEqual(emailField.getAttribute('value'), 'admin@example.com');
				const passwordField = form.querySelector('input[name="password"]');
				assert.strictEqual(passwordField.getAttribute('value'), '');
			});

		});

	});

});
