/* global agent, dashboard */
'use strict';

const loadSeedData = require('../helper/load-seed-data');

describe('GET /api', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/api');
		return loadSeedData(dashboard, 'base');
	});

	it('responds with a 302 status', done => {
		request.expect(302).end(done);
	});

	it('responds with a Location header pointing to /api/v1', done => {
		request.expect('Location', '/api/v1').end(done);
	});

});
