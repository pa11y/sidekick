/* global agent, dashboard */
'use strict';

const loadSeedData = require('../helper/load-seed-data');

describe('GET /404', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/404');
		return loadSeedData(dashboard, 'base');
	});

	it('responds with a 404 status', done => {
		request.expect(404).end(done);
	});

	it('responds with HTML', done => {
		request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
	});

	it('responds with an error message', done => {
		request.expect(/Not Found/).end(done);
	});

});
