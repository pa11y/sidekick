'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
const querystring = require('querystring');
let response;

describe('GET / (when setup is not complete)', () => {

	before(async () => {
		await database.clean(dashboard);
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

		it('responds with no error messages', () => {
			const errors = response.body.document.querySelectorAll('[data-test=setup-form] [data-test=alert-error]');
			assert.lengthEquals(errors, 0);
		});

		it('responds with a setup form', () => {
			const form = response.body.document.querySelector('[data-test=setup-form]');
			assert.isNotNull(form);
			assert.strictEqual(form.getAttribute('action'), '/');
			assert.strictEqual(form.getAttribute('method'), 'post');

			const adminEmailField = form.querySelector('input[name="adminEmail"]');
			assert.strictEqual(adminEmailField.getAttribute('type'), 'email');
			assert.strictEqual(adminEmailField.getAttribute('value'), '');

			const adminPasswordField = form.querySelector('input[name="adminPassword"]');
			assert.strictEqual(adminPasswordField.getAttribute('type'), 'password');
			assert.isNull(adminPasswordField.getAttribute('value'));

			const adminPasswordConfirmField = form.querySelector('input[name="adminPasswordConfirm"]');
			assert.strictEqual(adminPasswordConfirmField.getAttribute('type'), 'password');
			assert.isNull(adminPasswordConfirmField.getAttribute('value'));

			const publicReadAccessField = form.querySelector('input[name="publicReadAccess"]');
			assert.strictEqual(publicReadAccessField.getAttribute('type'), 'checkbox');
			assert.isNull(publicReadAccessField.getAttribute('checked'));
		});

	});

});

describe('POST / (when setup is not complete)', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.clean(dashboard);
			response = await request.post('/', {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: querystring.stringify({
					adminEmail: 'admin@example.com',
					adminPassword: 'password',
					adminPasswordConfirm: 'password',
					publicReadAccess: true
				})
			});
		});

		it('adds an admin user to the database', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'admin@example.com'
			});
			const user = users[0];

			assert.lengthEquals(users, 1, 'One user is present');
			assert.strictEqual(user.email, 'admin@example.com', 'User has the correct new email');
			assert.isTrue(user.allow_read, 'User has READ permissions');
			assert.isTrue(user.allow_write, 'User has WRITE permissions');
			assert.isTrue(user.allow_delete, 'User has DELETE permissions');
			assert.isTrue(user.allow_admin, 'User has ADMIN permissions');
			assert.isTrue(user.is_owner, 'User is an owner');
		});

		it('adds settings to the database', async () => {
			const settings = await dashboard.database.knex.select('*').from('settings');

			assert.lengthEquals(settings, 2, 'Two settings are present');

			assert.strictEqual(settings[0].id, 'publicReadAccess');
			assert.strictEqual(settings[0].value, true);

			assert.strictEqual(settings[1].id, 'setupComplete');
			assert.strictEqual(settings[1].value, true);
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

	describe('when everything is valid but public read access is not enabled', () => {

		before(async () => {
			await database.clean(dashboard);
			response = await request.post('/', {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: querystring.stringify({
					adminEmail: 'admin@example.com',
					adminPassword: 'password',
					adminPasswordConfirm: 'password'
				})
			});
		});

		it('adds an admin user to the database', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'admin@example.com'
			});
			const user = users[0];

			assert.lengthEquals(users, 1, 'One user is present');
			assert.strictEqual(user.email, 'admin@example.com', 'User has the correct new email');
			assert.isTrue(user.allow_read, 'User has READ permissions');
			assert.isTrue(user.allow_write, 'User has WRITE permissions');
			assert.isTrue(user.allow_delete, 'User has DELETE permissions');
			assert.isTrue(user.allow_admin, 'User has ADMIN permissions');
			assert.isTrue(user.is_owner, 'User is an owner');
		});

		it('adds settings to the database', async () => {
			const settings = await dashboard.database.knex.select('*').from('settings');

			assert.lengthEquals(settings, 2, 'Two settings are present');

			assert.strictEqual(settings[0].id, 'publicReadAccess');
			assert.strictEqual(settings[0].value, false);

			assert.strictEqual(settings[1].id, 'setupComplete');
			assert.strictEqual(settings[1].value, true);
		});

		it('responds with a 302 status', () => {
			assert.strictEqual(response.statusCode, 302);
		});

		it('responds with a Location header pointing to the login page', () => {
			assert.strictEqual(response.headers.location, '/login');
		});

		it('responds with plain text', () => {
			assert.include(response.headers['content-type'], 'text/plain');
		});

	});

	describe('when the admin email is invalid', () => {

		before(async () => {
			await database.clean(dashboard);
			response = await request.post('/', {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: querystring.stringify({
					adminEmail: 'invalid-email',
					adminPassword: 'password',
					adminPasswordConfirm: 'password',
					publicReadAccess: true
				})
			});
		});

		it('does not add an admin user to the database', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'invalid-email'
			});
			assert.lengthEquals(users, 0);
		});

		it('does not add settings to the database', async () => {
			const settings = await dashboard.database.knex.select('*').from('settings');
			assert.lengthEquals(settings, 0);
		});

		it('responds with a 400 status', () => {
			assert.strictEqual(response.statusCode, 400);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

		it('responds with an error message', () => {
			const errors = response.body.document.querySelectorAll('[data-test=setup-form] [data-test=alert-error]');
			assert.lengthEquals(errors, 1);
			assert.match(errors[0].textContent, /must be a valid email/i);
		});

		it('responds with a setup form with some of the posted data pre-filled', () => {
			const form = response.body.document.querySelector('[data-test=setup-form]');
			assert.isNotNull(form);
			assert.strictEqual(form.getAttribute('action'), '/');
			assert.strictEqual(form.getAttribute('method'), 'post');

			const adminEmailField = form.querySelector('input[name="adminEmail"]');
			assert.strictEqual(adminEmailField.getAttribute('type'), 'email');
			assert.strictEqual(adminEmailField.getAttribute('value'), 'invalid-email');

			const adminPasswordField = form.querySelector('input[name="adminPassword"]');
			assert.strictEqual(adminPasswordField.getAttribute('type'), 'password');
			assert.isNull(adminPasswordField.getAttribute('value'));

			const adminPasswordConfirmField = form.querySelector('input[name="adminPasswordConfirm"]');
			assert.strictEqual(adminPasswordConfirmField.getAttribute('type'), 'password');
			assert.isNull(adminPasswordConfirmField.getAttribute('value'));

			const publicReadAccessField = form.querySelector('input[name="publicReadAccess"]');
			assert.strictEqual(publicReadAccessField.getAttribute('type'), 'checkbox');
			assert.strictEqual(publicReadAccessField.getAttribute('checked'), '');
		});

	});

	describe('when the admin password is invalid', () => {

		before(async () => {
			await database.clean(dashboard);
			response = await request.post('/', {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: querystring.stringify({
					adminEmail: 'admin@example.com',
					adminPassword: 'pass',
					adminPasswordConfirm: 'pass',
					publicReadAccess: true
				})
			});
		});

		it('does not add an admin user to the database', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'admin@example.com'
			});
			assert.lengthEquals(users, 0);
		});

		it('does not add settings to the database', async () => {
			const settings = await dashboard.database.knex.select('*').from('settings');
			assert.lengthEquals(settings, 0);
		});

		it('responds with a 400 status', () => {
			assert.strictEqual(response.statusCode, 400);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

		it('responds with an error message', () => {
			const errors = response.body.document.querySelectorAll('[data-test=setup-form] [data-test=alert-error]');
			assert.lengthEquals(errors, 1);
			assert.match(errors[0].textContent, /length must be at least 6/i);
		});

		it('responds with a setup form with some of the posted data pre-filled', () => {
			const form = response.body.document.querySelector('[data-test=setup-form]');
			assert.isNotNull(form);
			assert.strictEqual(form.getAttribute('action'), '/');
			assert.strictEqual(form.getAttribute('method'), 'post');

			const adminEmailField = form.querySelector('input[name="adminEmail"]');
			assert.strictEqual(adminEmailField.getAttribute('type'), 'email');
			assert.strictEqual(adminEmailField.getAttribute('value'), 'admin@example.com');

			const adminPasswordField = form.querySelector('input[name="adminPassword"]');
			assert.strictEqual(adminPasswordField.getAttribute('type'), 'password');
			assert.isNull(adminPasswordField.getAttribute('value'));

			const adminPasswordConfirmField = form.querySelector('input[name="adminPasswordConfirm"]');
			assert.strictEqual(adminPasswordConfirmField.getAttribute('type'), 'password');
			assert.isNull(adminPasswordConfirmField.getAttribute('value'));

			const publicReadAccessField = form.querySelector('input[name="publicReadAccess"]');
			assert.strictEqual(publicReadAccessField.getAttribute('type'), 'checkbox');
			assert.strictEqual(publicReadAccessField.getAttribute('checked'), '');
		});

	});

	describe('when the confirmed password does not match the new password', () => {

		before(async () => {
			await database.clean(dashboard);
			response = await request.post('/', {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: querystring.stringify({
					adminEmail: 'admin@example.com',
					adminPassword: 'password',
					adminPasswordConfirm: 'pass word',
					publicReadAccess: true
				})
			});
		});

		it('does not add an admin user to the database', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'admin@example.com'
			});
			assert.lengthEquals(users, 0);
		});

		it('does not add settings to the database', async () => {
			const settings = await dashboard.database.knex.select('*').from('settings');
			assert.lengthEquals(settings, 0);
		});

		it('responds with a 400 status', () => {
			assert.strictEqual(response.statusCode, 400);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

		it('responds with an error message', () => {
			const errors = response.body.document.querySelectorAll('[data-test=setup-form] [data-test=alert-error]');
			assert.lengthEquals(errors, 1);
			assert.match(errors[0].textContent, /password and confirmed password do not match/i);
		});

		it('responds with a setup form with some of the posted data pre-filled', () => {
			const form = response.body.document.querySelector('[data-test=setup-form]');
			assert.isNotNull(form);
			assert.strictEqual(form.getAttribute('action'), '/');
			assert.strictEqual(form.getAttribute('method'), 'post');

			const adminEmailField = form.querySelector('input[name="adminEmail"]');
			assert.strictEqual(adminEmailField.getAttribute('type'), 'email');
			assert.strictEqual(adminEmailField.getAttribute('value'), 'admin@example.com');

			const adminPasswordField = form.querySelector('input[name="adminPassword"]');
			assert.strictEqual(adminPasswordField.getAttribute('type'), 'password');
			assert.isNull(adminPasswordField.getAttribute('value'));

			const adminPasswordConfirmField = form.querySelector('input[name="adminPasswordConfirm"]');
			assert.strictEqual(adminPasswordConfirmField.getAttribute('type'), 'password');
			assert.isNull(adminPasswordConfirmField.getAttribute('value'));

			const publicReadAccessField = form.querySelector('input[name="publicReadAccess"]');
			assert.strictEqual(publicReadAccessField.getAttribute('type'), 'checkbox');
			assert.strictEqual(publicReadAccessField.getAttribute('checked'), '');
		});

	});

});
