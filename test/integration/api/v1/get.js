/* global agent, dashboard */
'use strict';

const loadSeedData = require('../../helper/load-seed-data');

describe('GET /api/v1', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/api/v1');
		return loadSeedData(dashboard, 'base');
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with HTML', done => {
		request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
	});

	describe('with no User-Agent header', () => {
		let request;

		beforeEach(() => {
			request = agent.get('/api/v1').set('User-Agent', '');
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with HTML', done => {
			request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'User-Agent header is required',
					status: 400
				}
			}).end(done);
		});

	});

});
