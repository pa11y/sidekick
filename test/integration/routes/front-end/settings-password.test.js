'use strict';

const assert = require('proclaim');
const auth = require('../../helpers/auth');
const bcrypt = require('bcrypt');
const database = require('../../helpers/database');
const {JSDOM} = require('jsdom');

describe('GET /settings/password', () => {
	let request;

	describe('when a user is logged in', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			await auth.login('read@example.com', 'password');
			request = agent.get('/settings/password');
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
				form = dom.window.document.querySelector('[data-test=password-form]');
				errors = form.querySelectorAll('[data-test=alert-error]');
			});

			it('contains no error messages', () => {
				assert.lengthEquals(errors, 0);
			});

			it('contains a password form', () => {
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/settings/password');
				assert.strictEqual(form.getAttribute('method'), 'post');
				assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');

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

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent.get('/settings/password');
		});

		it('responds with a 401 status', () => {
			return request.expect(401);
		});

		describe('HTML response', () => {
			it('contains a 401 error message', async () => {
				const html = (await request.then()).text;
				assert.match(html, /must authenticate/i);
			});
		});

	});

});

describe('POST /settings/password', () => {
	let request;

	describe('when a user is logged in', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			await auth.login('read@example.com', 'password');
			request = agent
				.post('/settings/password')
				.set('Content-Type', 'application/x-www-form-urlencoded');
		});

		describe('when everything is valid', () => {

			beforeEach(() => {
				request.send({
					current: 'password',
					next: 'new-password',
					confirm: 'new-password'
				});
			});

			it('updates the expected user password in the database', async () => {
				await request.then();
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'read@example.com'
				});
				const user = users[0];

				assert.lengthEquals(users, 1, 'One user is present');
				assert.notStrictEqual(user.password, 'new-password', 'New password is not stored in clear text');
				assert.isTrue(await bcrypt.compare('new-password', user.password), 'New password is hashed');
			});

			it('responds with a 302 status', () => {
				return request.expect(302);
			});

			it('responds with a Location header pointing to the password settings page', () => {
				return request.expect('Location', '/settings/password');
			});

			it('responds with plain text', () => {
				return request.expect('Content-Type', /text\/plain/);
			});

		});

		describe('when the current password is invalid', () => {

			beforeEach(() => {
				request.send({
					current: 'invalid-password',
					next: 'new-password',
					confirm: 'new-password'
				});
			});

			it('does not update the user password in the database', async () => {
				await request.then();
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'read@example.com'
				});
				const user = users[0];

				assert.lengthEquals(users, 1, 'One user is present');
				assert.isTrue(await bcrypt.compare('password', user.password), 'New password is hashed');
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
					form = dom.window.document.querySelector('[data-test=password-form]');
					errors = form.querySelectorAll('[data-test=alert-error]');
				});

				it('contains an error message', () => {
					assert.lengthEquals(errors, 1);
					assert.match(errors[0].textContent, /current password was incorrect/i);
				});

				it('contains a password form', () => {
					assert.isNotNull(form);
					assert.strictEqual(form.getAttribute('action'), '/settings/password');
					assert.strictEqual(form.getAttribute('method'), 'post');
					assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');

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

		describe('when the new password is invalid', () => {

			beforeEach(() => {
				request.send({
					current: 'password',
					next: 'new',
					confirm: 'new'
				});
			});

			it('does not update the user password in the database', async () => {
				await request.then();
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'read@example.com'
				});
				const user = users[0];

				assert.lengthEquals(users, 1, 'One user is present');
				assert.isTrue(await bcrypt.compare('password', user.password), 'New password is hashed');
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
					form = dom.window.document.querySelector('[data-test=password-form]');
					errors = form.querySelectorAll('[data-test=alert-error]');
				});

				it('contains an error message', () => {
					assert.lengthEquals(errors, 1);
					assert.match(errors[0].textContent, /length must be at least 6/i);
				});

				it('contains a password form', () => {
					assert.isNotNull(form);
					assert.strictEqual(form.getAttribute('action'), '/settings/password');
					assert.strictEqual(form.getAttribute('method'), 'post');
					assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');

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

		describe('when the confirmed password does not match the new password', () => {

			beforeEach(() => {
				request.send({
					current: 'password',
					next: 'new-password',
					confirm: 'password-new'
				});
			});

			it('does not update the user password in the database', async () => {
				await request.then();
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'read@example.com'
				});
				const user = users[0];

				assert.lengthEquals(users, 1, 'One user is present');
				assert.isTrue(await bcrypt.compare('password', user.password), 'New password is hashed');
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
					form = dom.window.document.querySelector('[data-test=password-form]');
					errors = form.querySelectorAll('[data-test=alert-error]');
				});

				it('contains an error message', () => {
					assert.lengthEquals(errors, 1);
					assert.match(errors[0].textContent, /passwords do not match/i);
				});

				it('contains a password form', () => {
					assert.isNotNull(form);
					assert.strictEqual(form.getAttribute('action'), '/settings/password');
					assert.strictEqual(form.getAttribute('method'), 'post');
					assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');

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

	});

	describe('when no user is logged in', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent.get('/settings/password');
		});

		it('responds with a 401 status', () => {
			return request.expect(401);
		});

		describe('HTML response', () => {
			it('contains a 401 error message', async () => {
				const html = (await request.then()).text;
				assert.match(html, /must authenticate/i);
			});
		});

	});

});
