/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const authenticateWithUser = require('../helper/authenticate-with-user');
const loadSeedData = require('../helper/load-seed-data');

describe('GET /logout', () => {
	let request;

	beforeEach(() => {
		return Promise.resolve()
			.then(() => loadSeedData(dashboard, 'base'))
			.then(() => authenticateWithUser('admin@example.com', 'password'))
			.then(cookie => {
				request = agent
					.get('/logout')
					.set('Cookie', cookie);
			});
	});

	it('responds with a 302 status', done => {
		request.expect(302).end(done);
	});

	it('responds with a location header pointing to the home page', done => {
		request.expect('Location', '/').end(done);
	});

	it('does not respond with a session cookie', done => {
		request.expect(response => {
			assert.isUndefined(response.headers['set-cookie']);
		}).end(done);
	});

});
