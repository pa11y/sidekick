'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
const {JSDOM} = require('jsdom');

describe('GET / (when setup is not complete)', () => {
	let request;

	beforeEach(async () => {
		await database.clean(dashboard);
		request = agent.get('/');
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
			form = dom.window.document.querySelector('[data-test=setup-form]');
			errors = form.querySelectorAll('[data-test=alert-error]');
		});

		it('contains no error messages', () => {
			assert.lengthEquals(errors, 0);
		});

		it('contains a setup form', () => {
			assert.isNotNull(form);
			assert.strictEqual(form.getAttribute('action'), '/');
			assert.strictEqual(form.getAttribute('method'), 'post');
			assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');

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
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.clean(dashboard);
			request = agent
				.post('/')
				.set('Content-Type', 'application/x-www-form-urlencoded')
				.send({
					adminEmail: 'admin@example.com',
					adminPassword: 'password',
					adminPasswordConfirm: 'password',
					publicReadAccess: true
				});
		});

		it('adds an admin user to the database', async () => {
			await request.then();
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
			await request.then();
			const settings = await dashboard.database.knex.select('*').from('settings');

			assert.lengthEquals(settings, 2, 'Two settings are present');

			assert.strictEqual(settings[0].id, 'publicReadAccess');
			assert.strictEqual(settings[0].value, true);

			assert.strictEqual(settings[1].id, 'setupComplete');
			assert.strictEqual(settings[1].value, true);
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

	describe('when everything is valid but public read access is not enabled', () => {

		beforeEach(async () => {
			await database.clean(dashboard);
			request = agent
				.post('/')
				.set('Content-Type', 'application/x-www-form-urlencoded')
				.send({
					adminEmail: 'admin@example.com',
					adminPassword: 'password',
					adminPasswordConfirm: 'password'
				});
		});

		it('adds an admin user to the database', async () => {
			await request.then();
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
			await request.then();
			const settings = await dashboard.database.knex.select('*').from('settings');

			assert.lengthEquals(settings, 2, 'Two settings are present');

			assert.strictEqual(settings[0].id, 'publicReadAccess');
			assert.strictEqual(settings[0].value, false);

			assert.strictEqual(settings[1].id, 'setupComplete');
			assert.strictEqual(settings[1].value, true);
		});

		it('responds with a 302 status', () => {
			return request.expect(302);
		});

		it('responds with a Location header pointing to the login page', () => {
			return request.expect('Location', '/login');
		});

		it('responds with plain text', () => {
			return request.expect('Content-Type', /text\/plain/);
		});

	});

	describe('when the admin email is invalid', () => {

		beforeEach(async () => {
			await database.clean(dashboard);
			request = agent
				.post('/')
				.set('Content-Type', 'application/x-www-form-urlencoded')
				.send({
					adminEmail: 'invalid-email',
					adminPassword: 'password',
					adminPasswordConfirm: 'password',
					publicReadAccess: true
				});
		});

		it('does not add an admin user to the database', async () => {
			await request.then();
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'invalid-email'
			});
			assert.lengthEquals(users, 0);
		});

		it('does not add settings to the database', async () => {
			await request.then();
			const settings = await dashboard.database.knex.select('*').from('settings');
			assert.lengthEquals(settings, 0);
		});

		it('responds with a 400 status', () => {
			return request.expect(400);
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
				form = dom.window.document.querySelector('[data-test=setup-form]');
				errors = form.querySelectorAll('[data-test=alert-error]');
			});

			it('contains an error message', () => {
				assert.lengthEquals(errors, 1);
				assert.match(errors[0].textContent, /must be a valid email/i);
			});

			it('contains a setup form with some of the posted data pre-filled', () => {
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/');
				assert.strictEqual(form.getAttribute('method'), 'post');
				assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');

				const adminEmailField = form.querySelector('input[name="adminEmail"]');
				assert.strictEqual(adminEmailField.getAttribute('value'), 'invalid-email');

				const adminPasswordField = form.querySelector('input[name="adminPassword"]');
				assert.isNull(adminPasswordField.getAttribute('value'));

				const adminPasswordConfirmField = form.querySelector('input[name="adminPasswordConfirm"]');
				assert.isNull(adminPasswordConfirmField.getAttribute('value'));

				const publicReadAccessField = form.querySelector('input[name="publicReadAccess"]');
				assert.strictEqual(publicReadAccessField.getAttribute('checked'), '');
			});

		});

	});

	describe('when the admin password is invalid', () => {

		beforeEach(async () => {
			await database.clean(dashboard);
			request = agent
				.post('/')
				.set('Content-Type', 'application/x-www-form-urlencoded')
				.send({
					adminEmail: 'admin@example.com',
					adminPassword: 'pass',
					adminPasswordConfirm: 'pass',
					publicReadAccess: true
				});
		});

		it('does not add an admin user to the database', async () => {
			await request.then();
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'admin@example.com'
			});
			assert.lengthEquals(users, 0);
		});

		it('does not add settings to the database', async () => {
			await request.then();
			const settings = await dashboard.database.knex.select('*').from('settings');
			assert.lengthEquals(settings, 0);
		});

		it('responds with a 400 status', () => {
			return request.expect(400);
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
				form = dom.window.document.querySelector('[data-test=setup-form]');
				errors = form.querySelectorAll('[data-test=alert-error]');
			});

			it('contains an error message', () => {
				assert.lengthEquals(errors, 1);
				assert.match(errors[0].textContent, /length must be at least 6/i);
			});

			it('contains a setup form with some of the posted data pre-filled', () => {
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/');
				assert.strictEqual(form.getAttribute('method'), 'post');
				assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');

				const adminEmailField = form.querySelector('input[name="adminEmail"]');
				assert.strictEqual(adminEmailField.getAttribute('value'), 'admin@example.com');

				const adminPasswordField = form.querySelector('input[name="adminPassword"]');
				assert.isNull(adminPasswordField.getAttribute('value'));

				const adminPasswordConfirmField = form.querySelector('input[name="adminPasswordConfirm"]');
				assert.isNull(adminPasswordConfirmField.getAttribute('value'));

				const publicReadAccessField = form.querySelector('input[name="publicReadAccess"]');
				assert.strictEqual(publicReadAccessField.getAttribute('checked'), '');
			});

		});

	});

	describe('when the confirmed password does not match the new password', () => {

		beforeEach(async () => {
			await database.clean(dashboard);
			request = agent
				.post('/')
				.set('Content-Type', 'application/x-www-form-urlencoded')
				.send({
					adminEmail: 'admin@example.com',
					adminPassword: 'password',
					adminPasswordConfirm: 'pass word',
					publicReadAccess: true
				});
		});

		it('does not add an admin user to the database', async () => {
			await request.then();
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'admin@example.com'
			});
			assert.lengthEquals(users, 0);
		});

		it('does not add settings to the database', async () => {
			await request.then();
			const settings = await dashboard.database.knex.select('*').from('settings');
			assert.lengthEquals(settings, 0);
		});

		it('responds with a 400 status', () => {
			return request.expect(400);
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
				form = dom.window.document.querySelector('[data-test=setup-form]');
				errors = form.querySelectorAll('[data-test=alert-error]');
			});

			it('contains an error message', () => {
				assert.lengthEquals(errors, 1);
				assert.match(errors[0].textContent, /password and confirmed password do not match/i);
			});

			it('contains a setup form with some of the posted data pre-filled', () => {
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/');
				assert.strictEqual(form.getAttribute('method'), 'post');
				assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');

				const adminEmailField = form.querySelector('input[name="adminEmail"]');
				assert.strictEqual(adminEmailField.getAttribute('value'), 'admin@example.com');

				const adminPasswordField = form.querySelector('input[name="adminPassword"]');
				assert.isNull(adminPasswordField.getAttribute('value'));

				const adminPasswordConfirmField = form.querySelector('input[name="adminPasswordConfirm"]');
				assert.isNull(adminPasswordConfirmField.getAttribute('value'));

				const publicReadAccessField = form.querySelector('input[name="publicReadAccess"]');
				assert.strictEqual(publicReadAccessField.getAttribute('checked'), '');
			});

		});

	});

});
