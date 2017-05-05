/* global agent, dashboard */
'use strict';

const loadSeedData = require('../../helper/load-seed-data');

describe('GET /api/v1/404', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/api/v1/404');
		return loadSeedData(dashboard, 'base');
	});

	it('responds with a 404 status', done => {
		request.expect(404).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('responds with an error message', done => {
		request.expect({
			error: {
				message: 'Not Found',
				status: 404
			}
		}).end(done);
	});

});
