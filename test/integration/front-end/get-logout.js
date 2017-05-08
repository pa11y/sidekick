/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const loadSeedData = require('../helper/load-seed-data');

describe('GET /logout', () => {
	let request;

	beforeEach(() => {
		request = agent
			.get('/logout')
			.set('Cookie', 'sidekick.sid=mock-sid');
		return loadSeedData(dashboard, 'base')
			.then(() => {
				return dashboard.database('sessions').insert({
					sid: 'mock-sid',
					sess: JSON.stringify({
						userId: 'H1tA5TKkb'
					}),
					expired: new Date(Date.now() + 86400000)
				});
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
