/* global agent */
'use strict';

describe('GET /', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/');
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with HTML', done => {
		request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
	});

});

describe('GET /404', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/404');
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
