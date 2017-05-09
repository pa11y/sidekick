/* global agent, dashboard */
'use strict';

const authenticateWithUser = require('../helper/authenticate-with-user');
const loadSeedData = require('../helper/load-seed-data');

describe('GET /', () => {
	let request;

	describe('unauthenticated', () => {

		beforeEach(() => {
			request = agent.get('/');
			return loadSeedData(dashboard, 'base');
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('responds with HTML', done => {
			request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

	});

	describe('unauthenticated when the default permissions do not allow read access', () => {

		beforeEach(() => {
			request = agent.get('/');
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 302 status', done => {
			request.expect(302).end(done);
		});

		it('responds with a location header pointing to the login page', done => {
			request.expect('Location', '/login').end(done);
		});

	});

	describe('authenticated with a user who has read access', () => {

		beforeEach(() => {
			return Promise.resolve()
				.then(() => loadSeedData(dashboard, 'permissions'))
				.then(() => authenticateWithUser('readonly@example.com', 'password'))
				.then(cookie => {
					request = agent
						.get('/')
						.set('Cookie', cookie);
				});
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('responds with HTML', done => {
			request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

	});

});
