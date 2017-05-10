/* global agent, dashboard */
'use strict';

const loadSeedData = require('../helper/load-seed-data');

describe('GET /docs/api/v1', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/docs/api/v1');
		return loadSeedData(dashboard, 'base');
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with HTML', done => {
		request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
	});

});
