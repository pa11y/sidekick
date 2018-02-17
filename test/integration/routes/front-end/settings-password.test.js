'use strict';

const assert = require('proclaim');
const auth = require('../../helpers/auth');
const bcrypt = require('bcrypt');
const database = require('../../helpers/database');
const querystring = require('querystring');
let response;

describe('GET /settings/password', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when a user is logged in', () => {

		describe('when everything is valid', () => {

			before(async () => {
				response = await request.get('/settings/password', {
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
				const errors = response.body.document.querySelectorAll('[data-test=password-form] [data-test=alert-error]');
				assert.lengthEquals(errors, 0);
			});

			it('responds with a password form', () => {
				const form = response.body.document.querySelector('[data-test=password-form]');
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/settings/password');
				assert.strictEqual(form.getAttribute('method'), 'post');

				const currentPasswordField = form.querySelector('input[name="current"]');
				assert.strictEqual(currentPasswordField.getAttribute('type'), 'password');
				assert.isNull(currentPasswordField.getAttribute('value'));

				const nextPasswordField = form.querySelector('input[name="next"]');
				assert.strictEqual(nextPasswordField.getAttribute('type'), 'password');
				assert.isNull(nextPasswordField.getAttribute('value'));

				const confirmPasswordField = form.querySelector('input[name="confirm"]');
				assert.strictEqual(confirmPasswordField.getAttribute('type'), 'password');
				assert.isNull(confirmPasswordField.getAttribute('value'));
			});

		});

	});

	describe('when no user is logged in', () => {

		before(async () => {
			response = await request.get('/settings/password');
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

describe('POST /settings/password', () => {

	describe('when a user is logged in', () => {

		describe('when everything is valid', () => {

			before(async () => {
				await database.seed(dashboard, 'basic');
				response = await request.post('/settings/password', {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: querystring.stringify({
						current: 'password',
						next: 'new-password',
						confirm: 'new-password'
					}),
					jar: await auth.getCookieJar('read@example.com', 'password')
				});
			});

			it('updates the expected user password in the database', async () => {
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'read@example.com'
				});
				const user = users[0];

				assert.lengthEquals(users, 1, 'One user is present');
				assert.notStrictEqual(user.password, 'new-password', 'New password is not stored in clear text');
				assert.isTrue(await bcrypt.compare('new-password', user.password), 'New password is hashed');
			});

			it('responds with a 302 status', () => {
				assert.strictEqual(response.statusCode, 302);
			});

			it('responds with a Location header pointing to the password settings page', () => {
				assert.strictEqual(response.headers.location, '/settings/password');
			});

			it('responds with plain text', () => {
				assert.include(response.headers['content-type'], 'text/plain');
			});

		});

		describe('when the current password is invalid', () => {

			before(async () => {
				await database.seed(dashboard, 'basic');
				response = await request.post('/settings/password', {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: querystring.stringify({
						current: 'invalid-password',
						next: 'new-password',
						confirm: 'new-password'
					}),
					jar: await auth.getCookieJar('read@example.com', 'password')
				});
			});

			it('does not update the user password in the database', async () => {
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'read@example.com'
				});
				const user = users[0];

				assert.lengthEquals(users, 1, 'One user is present');
				assert.isTrue(await bcrypt.compare('password', user.password), 'New password is hashed');
			});

			it('responds with a 400 status', () => {
				assert.strictEqual(response.statusCode, 400);
			});

			it('responds with HTML', () => {
				assert.include(response.headers['content-type'], 'text/html');
			});

			it('responds with an error message', () => {
				const errors = response.body.document.querySelectorAll('[data-test=password-form] [data-test=alert-error]');
				assert.lengthEquals(errors, 1);
				assert.match(errors[0].textContent, /current password was incorrect/i);
			});

			it('responds with a password form', () => {
				const form = response.body.document.querySelector('[data-test=password-form]');
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/settings/password');
				assert.strictEqual(form.getAttribute('method'), 'post');

				const currentPasswordField = form.querySelector('input[name="current"]');
				assert.strictEqual(currentPasswordField.getAttribute('type'), 'password');
				assert.isNull(currentPasswordField.getAttribute('value'));

				const nextPasswordField = form.querySelector('input[name="next"]');
				assert.strictEqual(nextPasswordField.getAttribute('type'), 'password');
				assert.isNull(nextPasswordField.getAttribute('value'));

				const confirmPasswordField = form.querySelector('input[name="confirm"]');
				assert.strictEqual(confirmPasswordField.getAttribute('type'), 'password');
				assert.isNull(confirmPasswordField.getAttribute('value'));
			});

		});

		describe('when the new password is invalid', () => {

			before(async () => {
				await database.seed(dashboard, 'basic');
				response = await request.post('/settings/password', {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: querystring.stringify({
						current: 'password',
						next: 'new',
						confirm: 'new'
					}),
					jar: await auth.getCookieJar('read@example.com', 'password')
				});
			});

			it('does not update the user password in the database', async () => {
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'read@example.com'
				});
				const user = users[0];

				assert.lengthEquals(users, 1, 'One user is present');
				assert.isTrue(await bcrypt.compare('password', user.password), 'New password is hashed');
			});

			it('responds with a 400 status', () => {
				assert.strictEqual(response.statusCode, 400);
			});

			it('responds with HTML', () => {
				assert.include(response.headers['content-type'], 'text/html');
			});

			it('responds with an error message', () => {
				const errors = response.body.document.querySelectorAll('[data-test=password-form] [data-test=alert-error]');
				assert.lengthEquals(errors, 1);
				assert.match(errors[0].textContent, /length must be at least 6/i);
			});

			it('responds with a password form', () => {
				const form = response.body.document.querySelector('[data-test=password-form]');
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/settings/password');
				assert.strictEqual(form.getAttribute('method'), 'post');

				const currentPasswordField = form.querySelector('input[name="current"]');
				assert.strictEqual(currentPasswordField.getAttribute('type'), 'password');
				assert.isNull(currentPasswordField.getAttribute('value'));

				const nextPasswordField = form.querySelector('input[name="next"]');
				assert.strictEqual(nextPasswordField.getAttribute('type'), 'password');
				assert.isNull(nextPasswordField.getAttribute('value'));

				const confirmPasswordField = form.querySelector('input[name="confirm"]');
				assert.strictEqual(confirmPasswordField.getAttribute('type'), 'password');
				assert.isNull(confirmPasswordField.getAttribute('value'));
			});

		});

		describe('when the confirmed password does not match the new password', () => {

			before(async () => {
				await database.seed(dashboard, 'basic');
				response = await request.post('/settings/password', {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: querystring.stringify({
						current: 'password',
						next: 'new-password',
						confirm: 'password-new'
					}),
					jar: await auth.getCookieJar('read@example.com', 'password')
				});
			});

			it('does not update the user password in the database', async () => {
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'read@example.com'
				});
				const user = users[0];

				assert.lengthEquals(users, 1, 'One user is present');
				assert.isTrue(await bcrypt.compare('password', user.password), 'New password is hashed');
			});

			it('responds with a 400 status', () => {
				assert.strictEqual(response.statusCode, 400);
			});

			it('responds with HTML', () => {
				assert.include(response.headers['content-type'], 'text/html');
			});

			it('responds with an error message', () => {
				const errors = response.body.document.querySelectorAll('[data-test=password-form] [data-test=alert-error]');
				assert.lengthEquals(errors, 1);
				assert.match(errors[0].textContent, /passwords do not match/i);
			});

			it('responds with a password form', () => {
				const form = response.body.document.querySelector('[data-test=password-form]');
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/settings/password');
				assert.strictEqual(form.getAttribute('method'), 'post');

				const currentPasswordField = form.querySelector('input[name="current"]');
				assert.strictEqual(currentPasswordField.getAttribute('type'), 'password');
				assert.isNull(currentPasswordField.getAttribute('value'));

				const nextPasswordField = form.querySelector('input[name="next"]');
				assert.strictEqual(nextPasswordField.getAttribute('type'), 'password');
				assert.isNull(nextPasswordField.getAttribute('value'));

				const confirmPasswordField = form.querySelector('input[name="confirm"]');
				assert.strictEqual(confirmPasswordField.getAttribute('type'), 'password');
				assert.isNull(confirmPasswordField.getAttribute('value'));
			});

		});

	});

	describe('when no user is logged in', () => {

		before(async () => {
			response = await request.get('/settings/password');
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
