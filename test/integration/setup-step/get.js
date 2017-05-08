/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const jsdom = require('jsdom');
const loadSeedData = require('../helper/load-seed-data');

describe('GET / (setup step)', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/');
		return loadSeedData(dashboard, 'empty');
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with HTML', done => {
		request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
	});

	it('responds with the setup page', done => {
		request.expect(response => {
			jsdom.env(response.text, (error, window) => {
				const document = window.document;

				// Check page title
				assert.match(document.querySelector('title').textContent, /setup/i);

				// Check that form is present
				const form = document.querySelector('form[action="/"]');
				assert.strictEqual(form.getAttribute('method'), 'post');

				// Check admin setup fields
				const adminEmailField = form.querySelector('input[name="adminEmail"]');
				assert.strictEqual(adminEmailField.getAttribute('type'), 'email');
				const adminPasswordField = form.querySelector('input[name="adminPassword"]');
				assert.strictEqual(adminPasswordField.getAttribute('type'), 'password');

				// Check default access fields
				const defaultAccessReadField = form.querySelector('input[name="defaultAccessRead"]');
				assert.strictEqual(defaultAccessReadField.getAttribute('type'), 'checkbox');
				assert.isNotNull(defaultAccessReadField.getAttribute('checked'));
				const defaultAccessWriteField = form.querySelector('input[name="defaultAccessWrite"]');
				assert.strictEqual(defaultAccessWriteField.getAttribute('type'), 'checkbox');
				assert.isNull(defaultAccessWriteField.getAttribute('checked'));
				const defaultAccessDeleteField = form.querySelector('input[name="defaultAccessDelete"]');
				assert.strictEqual(defaultAccessDeleteField.getAttribute('type'), 'checkbox');
				assert.isNull(defaultAccessDeleteField.getAttribute('checked'));
				const defaultAccessAdminField = form.querySelector('input[name="defaultAccessAdmin"]');
				assert.strictEqual(defaultAccessAdminField.getAttribute('type'), 'checkbox');
				assert.isNull(defaultAccessAdminField.getAttribute('checked'));
			});
		}).end(done);
	});

});
