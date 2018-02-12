'use strict';

const assert = require('proclaim');
const auth = require('../../helpers/auth');
const database = require('../../helpers/database');
const {JSDOM} = require('jsdom');

describe('GET /settings/profile', () => {
	let request;

	describe('when a user is logged in', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			await auth.login('read@example.com', 'password');
			request = agent.get('/settings/profile');
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
				form = dom.window.document.querySelector('[data-test=user-form]');
				errors = form.querySelectorAll('[data-test=alert-error]');
			});

			it('contains no error messages', () => {
				assert.lengthEquals(errors, 0);
			});

			it('contains a pre-filled user form', () => {
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/settings/profile');
				assert.strictEqual(form.getAttribute('method'), 'post');
				assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');

				const emailField = form.querySelector('input[name="email"]');
				assert.strictEqual(emailField.getAttribute('type'), 'email');
				assert.strictEqual(emailField.getAttribute('value'), 'read@example.com');
			});

		});

	});

	describe('when no user is logged in', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent.get('/settings/profile');
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

describe('POST /settings/profile', () => {
	let request;

	describe('when a user is logged in', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			await auth.login('read@example.com', 'password');
			request = agent
				.post('/settings/profile')
				.set('Content-Type', 'application/x-www-form-urlencoded');
		});

		describe('when everything is valid', () => {

			beforeEach(() => {
				request.send({
					email: 'read-updated@example.com'
				});
			});

			it('updates the expected user details in the database', async () => {
				await request.then();
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'read-updated@example.com'
				});
				const user = users[0];

				assert.lengthEquals(users, 1, 'One user is present');
				assert.strictEqual(user.email, 'read-updated@example.com', 'User has the correct new email');
			});

			it('responds with a 302 status', () => {
				return request.expect(302);
			});

			it('responds with a Location header pointing to the profile settings page', () => {
				return request.expect('Location', '/settings/profile');
			});

			it('responds with plain text', () => {
				return request.expect('Content-Type', /text\/plain/);
			});

		});

		describe('when the request includes an invalid email', () => {

			beforeEach(() => {
				request.send({
					email: 'invalid-email'
				});
			});

			it('does not update the user in the database', async () => {
				await request.then();
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'invalid-email'
				});
				const user = users[0];
				assert.isUndefined(user);
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
					form = dom.window.document.querySelector('[data-test=user-form]');
					errors = form.querySelectorAll('[data-test=alert-error]');
				});

				it('contains an error message', () => {
					assert.lengthEquals(errors, 1);
					assert.match(errors[0].textContent, /must be a valid email/i);
				});

				it('contains a user form with the posted data pre-filled', () => {
					assert.isNotNull(form);
					assert.strictEqual(form.getAttribute('action'), '/settings/profile');
					assert.strictEqual(form.getAttribute('method'), 'post');
					assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');

					const emailField = form.querySelector('input[name="email"]');
					assert.strictEqual(emailField.getAttribute('type'), 'email');
					assert.strictEqual(emailField.getAttribute('value'), 'invalid-email');
				});

			});

		});

		describe('when the request includes an email that\'s already in use', () => {

			beforeEach(() => {
				request.send({
					email: 'admin@example.com'
				});
			});

			it('does not update the user in the database', async () => {
				await request.then();
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'admin@example.com'
				});
				assert.lengthEquals(users, 1);
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
					form = dom.window.document.querySelector('[data-test=user-form]');
					errors = form.querySelectorAll('[data-test=alert-error]');
				});

				it('contains an error message', () => {
					assert.lengthEquals(errors, 1);
					assert.match(errors[0].textContent, /must be unique/i);
				});

				it('contains a user form with the posted data pre-filled', () => {
					assert.isNotNull(form);
					assert.strictEqual(form.getAttribute('action'), '/settings/profile');
					assert.strictEqual(form.getAttribute('method'), 'post');
					assert.strictEqual(form.getAttribute('enctype'), 'application/x-www-form-urlencoded');

					const emailField = form.querySelector('input[name="email"]');
					assert.strictEqual(emailField.getAttribute('type'), 'email');
					assert.strictEqual(emailField.getAttribute('value'), 'admin@example.com');
				});

			});

		});

	});

	describe('when no user is logged in', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent.get('/settings/profile');
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
