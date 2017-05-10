/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const authenticateWithUser = require('../helper/authenticate-with-user');
const loadSeedData = require('../helper/load-seed-data');

describe('GET /profile/regenerate-api-key', () => {
	let request;

	describe('authenticated', () => {

		beforeEach(() => {
			return Promise.resolve()
				.then(() => loadSeedData(dashboard, 'base'))
				.then(() => authenticateWithUser('admin@example.com', 'password'))
				.then(cookie => {
					request = agent
						.post('/profile/regenerate-api-key')
						.set('Cookie', cookie);
				});
		});

		it('responds with a 302 status', done => {
			request.expect(302).end(done);
		});

		it('responds with a location header pointing to profile page', done => {
			request.expect('Location', '/profile').end(done);
		});

		it('updates the user API key in the database', done => {
			request.end(() => {
				dashboard.database.select('*').from('users').where({email: 'admin@example.com'})
					.then(users => {
						assert.isDefined(users[0]);
						assert.notStrictEqual(users[0].apiKey, 'mock-admin-api-key');
						assert.match(users[0].apiKey, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
						done();
					})
					.catch(done);
			});
		});

	});

	describe('unauthenticated', () => {

		beforeEach(() => {
			request = agent.post('/profile/regenerate-api-key');
			return loadSeedData(dashboard, 'base');
		});

		it('responds with a 401 status', done => {
			request.expect(401).end(done);
		});

	});

});
