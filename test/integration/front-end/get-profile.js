/* global agent, dashboard */
'use strict';

const authenticateWithUser = require('../helper/authenticate-with-user');
const jsdom = require('jsdom').jsdom;
const loadSeedData = require('../helper/load-seed-data');

describe.only('GET /profile', () => {
	let request;

	describe('authenticated', () => {

		beforeEach(() => {
			return Promise.resolve()
				.then(() => loadSeedData(dashboard, 'base'))
				.then(() => authenticateWithUser('admin@example.com', 'password'))
				.then(cookie => {
					request = agent
						.get('/profile')
						.set('Cookie', cookie);
				});
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('responds with HTML', done => {
			request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('responds with the profile page', done => {
			request.expect(response => {
				jsdom.env(response.text, (error, window) => {
					const document = window.document;

					// Check page title
					assert.match(document.querySelector('title').textContent, /profile/i);

					// Check that API key and regenerate button are present
					const form = document.querySelector('form[action="/profile/regenerate-api-key"]');
					assert.strictEqual(form.getAttribute('method'), 'post');
					assert.match(form.textContent, /mock-admin-api-key/i);
				});
			}).end(done);
		});

	});

	describe('unauthenticated', () => {

		beforeEach(() => {
			request = agent.get('/profile');
			return loadSeedData(dashboard, 'base');
		});

		it('responds with a 302 status', done => {
			request.expect(302).end(done);
		});

		it('responds with a location header pointing to the login page', done => {
			request.expect('Location', '/login?referer=/profile').end(done);
		});

	});

});
