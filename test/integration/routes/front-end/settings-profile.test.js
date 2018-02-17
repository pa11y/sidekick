'use strict';

const assert = require('proclaim');
const auth = require('../../helpers/auth');
const database = require('../../helpers/database');
const querystring = require('querystring');
let response;

describe('GET /settings/profile', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when a user is logged in', () => {

		describe('when everything is valid', () => {

			before(async () => {
				response = await request.get('/settings/profile', {
					jar: await auth.getCookieJar('read@example.com', 'password')
				});
			});

			it('responds with a 200 status', () => {
				assert.strictEqual(response.statusCode, 200);
			});

			it('responds with HTML', () => {
				assert.include(response.headers['content-type'], 'text/html');
			});

			it('responds with no error messages', () => {
				const errors = response.body.document.querySelectorAll('[data-test=user-form] [data-test=alert-error]');
				assert.lengthEquals(errors, 0);
			});

			it('responds with a password form', () => {
				const form = response.body.document.querySelector('[data-test=user-form]');
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/settings/profile');
				assert.strictEqual(form.getAttribute('method'), 'post');

				const emailField = form.querySelector('input[name="email"]');
				assert.strictEqual(emailField.getAttribute('type'), 'email');
				assert.strictEqual(emailField.getAttribute('value'), 'read@example.com');
			});

		});

	});

	describe('when no user is logged in', () => {

		before(async () => {
			response = await request.get('/settings/profile');
		});

		it('responds with a 401 status', () => {
			assert.strictEqual(response.statusCode, 401);
		});

		it('it responds with an error page', () => {
			const body = response.body.document.querySelector('body');
			assert.match(body.innerHTML, /must authenticate/i);
		});

	});

});

describe('POST /settings/profile', () => {

	describe('when a user is logged in', () => {

		describe('when everything is valid', () => {

			before(async () => {
				await database.seed(dashboard, 'basic');
				response = await request.post('/settings/profile', {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: querystring.stringify({
						email: 'read-updated@example.com'
					}),
					jar: await auth.getCookieJar('read@example.com', 'password')
				});
			});

			it('updates the expected user details in the database', async () => {
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'read-updated@example.com'
				});
				const user = users[0];

				assert.lengthEquals(users, 1, 'One user is present');
				assert.strictEqual(user.email, 'read-updated@example.com', 'User has the correct new email');
			});

			it('responds with a 302 status', () => {
				assert.strictEqual(response.statusCode, 302);
			});

			it('responds with a Location header pointing to the profile settings page', () => {
				assert.strictEqual(response.headers.location, '/settings/profile');
			});

			it('responds with plain text', () => {
				assert.include(response.headers['content-type'], 'text/plain');
			});

		});

		describe('when the request includes an invalid email', () => {

			before(async () => {
				await database.seed(dashboard, 'basic');
				response = await request.post('/settings/profile', {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: querystring.stringify({
						email: 'invalid-email'
					}),
					jar: await auth.getCookieJar('read@example.com', 'password')
				});
			});

			it('does not update the user in the database', async () => {
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'invalid-email'
				});
				const user = users[0];
				assert.isUndefined(user);
			});

			it('responds with a 400 status', () => {
				assert.strictEqual(response.statusCode, 400);
			});

			it('responds with HTML', () => {
				assert.include(response.headers['content-type'], 'text/html');
			});

			it('responds with an error message', () => {
				const errors = response.body.document.querySelectorAll('[data-test=user-form] [data-test=alert-error]');
				assert.lengthEquals(errors, 1);
				assert.match(errors[0].textContent, /must be a valid email/i);
			});

			it('responds with a user form with the posted data pre-filled', () => {
				const form = response.body.document.querySelector('[data-test=user-form]');
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/settings/profile');
				assert.strictEqual(form.getAttribute('method'), 'post');

				const emailField = form.querySelector('input[name="email"]');
				assert.strictEqual(emailField.getAttribute('type'), 'email');
				assert.strictEqual(emailField.getAttribute('value'), 'invalid-email');
			});

		});

		describe('when the request includes an email that\'s already in use', () => {

			before(async () => {
				await database.seed(dashboard, 'basic');
				response = await request.post('/settings/profile', {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: querystring.stringify({
						email: 'admin@example.com'
					}),
					jar: await auth.getCookieJar('read@example.com', 'password')
				});
			});

			it('does not update the user in the database', async () => {
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'admin@example.com'
				});
				assert.lengthEquals(users, 1);
			});

			it('responds with a 400 status', () => {
				assert.strictEqual(response.statusCode, 400);
			});

			it('responds with HTML', () => {
				assert.include(response.headers['content-type'], 'text/html');
			});

			it('responds with an error message', () => {
				const errors = response.body.document.querySelectorAll('[data-test=user-form] [data-test=alert-error]');
				assert.lengthEquals(errors, 1);
				assert.match(errors[0].textContent, /must be unique/i);
			});

			it('responds with a user form with the posted data pre-filled', () => {
				const form = response.body.document.querySelector('[data-test=user-form]');
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/settings/profile');
				assert.strictEqual(form.getAttribute('method'), 'post');

				const emailField = form.querySelector('input[name="email"]');
				assert.strictEqual(emailField.getAttribute('type'), 'email');
				assert.strictEqual(emailField.getAttribute('value'), 'admin@example.com');
			});

		});

	});

	describe('when no user is logged in', () => {

		before(async () => {
			response = await request.get('/settings/profile');
		});

		it('responds with a 401 status', () => {
			assert.strictEqual(response.statusCode, 401);
		});

		it('it responds with an error page', () => {
			const body = response.body.document.querySelector('body');
			assert.match(body.innerHTML, /must authenticate/i);
		});

	});

});
