/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const jsdom = require('jsdom').jsdom;
const loadSeedData = require('../helper/load-seed-data');

describe('GET /login', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/login?referer=/mock-referer');
		return loadSeedData(dashboard, 'base');
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with HTML', done => {
		request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
	});

	it('responds with the login page', done => {
		request.expect(response => {
			jsdom.env(response.text, (error, window) => {
				const document = window.document;

				// Check page title
				assert.match(document.querySelector('title').textContent, /login/i);

				// Check that form is present
				const form = document.querySelector('form[action="/login"]');
				assert.strictEqual(form.getAttribute('method'), 'post');

				// Check login fields
				const emailField = form.querySelector('input[name="email"]');
				assert.strictEqual(emailField.getAttribute('type'), 'email');
				const passwordField = form.querySelector('input[name="password"]');
				assert.strictEqual(passwordField.getAttribute('type'), 'password');
				const refererField = form.querySelector('input[name="referer"]');
				assert.strictEqual(refererField.getAttribute('type'), 'hidden');
				assert.strictEqual(refererField.getAttribute('value'), '/mock-referer');
			});
		}).end(done);
	});

});
