/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const bcrypt = require('bcrypt');
const jsdom = require('jsdom');
const loadSeedData = require('../helper/load-seed-data');

describe('POST / (setup step)', () => {
	let request;
	let testSetupData;

	beforeEach(() => {
		testSetupData = {
			adminEmail: 'example@example.com',
			adminPassword: 'password',
			defaultAccessRead: 'on',
			defaultAccessWrite: '',
			defaultAccessDelete: '',
			defaultAccessAdmin: ''
		};
		request = agent
			.post('/')
			.set('Content-Type', 'application/x-www-form-urlencoded');
		return loadSeedData(dashboard, 'empty');
	});

	describe('when everything is valid', () => {

		beforeEach(() => {
			request.send(testSetupData);
		});

		it('responds with a 302 status', done => {
			request.expect(302).end(done);
		});

		it('responds with a location header pointing to the new URL', done => {
			request.expect('Location', '/').end(done);
		});

		it('creates an admin user in the database', done => {
			request.end(() => {
				dashboard.database.knex.select('*').from('users')
					.then(users => {
						assert.strictEqual(users.length, 1);
						assert.strictEqual(users[0].email, 'example@example.com');
						assert.isTrue(bcrypt.compareSync('password', users[0].password));
						assert.match(users[0].apiKey, /^[a-z0-9-]+$/i);
						assert.strictEqual(users[0].allowRead, true);
						assert.strictEqual(users[0].allowWrite, true);
						assert.strictEqual(users[0].allowDelete, true);
						assert.strictEqual(users[0].allowAdmin, true);
						done();
					})
					.catch(done);
			});
		});

		it('creates a settings entry in the database', done => {
			request.end(() => {
				let adminUser;
				dashboard.database.knex.select('*').from('users')
					.then(users => {
						adminUser = users[0];
						return dashboard.database.knex.select('*').from('settings');
					})
					.then(settings => {
						assert.strictEqual(settings.length, 1);
						assert.isObject(settings[0].data);
						assert.deepEqual(settings[0].data.defaultPermissions, {
							allowRead: true,
							allowWrite: false,
							allowDelete: false,
							allowAdmin: false
						});
						assert.isTrue(settings[0].data.setupComplete);
						assert.strictEqual(settings[0].data.superAdminId, adminUser.id);
						done();
					})
					.catch(done);
			});
		});

	});

	describe('when the admin email is invalid', () => {

		beforeEach(() => {
			testSetupData.adminEmail = 'notanemail';
			request.send(testSetupData);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with HTML', done => {
			request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('responds with the setup page containing an error', done => {
			request.expect(response => {
				jsdom.env(response.text, (error, window) => {
					const document = window.document;

					// Check page title
					assert.match(document.querySelector('title').textContent, /setup/i);

					// Check error message
					assert.match(document.querySelector('output[name="error"]').textContent, /valid email address/i);

					// Check that the form data is set
					const form = document.querySelector('form[action="/"]');
					const adminEmailField = form.querySelector('input[name="adminEmail"]');
					assert.strictEqual(adminEmailField.getAttribute('value'), testSetupData.adminEmail);
					const adminPasswordField = form.querySelector('input[name="adminPassword"]');
					assert.strictEqual(adminPasswordField.getAttribute('value'), null);
				});
			}).end(done);
		});

	});

	describe('when the admin password is invalid', () => {

		beforeEach(() => {
			testSetupData.adminPassword = '';
			request.send(testSetupData);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with HTML', done => {
			request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('responds with the setup page containing an error', done => {
			request.expect(response => {
				jsdom.env(response.text, (error, window) => {
					const document = window.document;

					// Check page title
					assert.match(document.querySelector('title').textContent, /setup/i);

					// Check error message
					assert.match(document.querySelector('output[name="error"]').textContent, /password cannot be empty/i);
				});
			}).end(done);
		});

	});

});
