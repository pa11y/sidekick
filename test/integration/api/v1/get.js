/* global agent, dashboard */
'use strict';

const loadSeedData = require('../../helper/load-seed-data');

describe('GET /api/v1', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/api/v1');
		return loadSeedData(dashboard, 'base');
	});

	it('responds with a 302 status', done => {
		request.expect(302).end(done);
	});

	it('responds with a Location header pointing to /docs/api/v1', done => {
		request.expect('Location', '/docs/api/v1').end(done);
	});

});
