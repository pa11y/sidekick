/* global agent */
'use strict';

describe('GET /api', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/api');
	});

	it('responds with a 302 status', done => {
		request.expect(302).end(done);
	});

	it('responds with a Location header pointing to /api/v1', done => {
		request.expect('Location', '/api/v1').end(done);
	});

});
