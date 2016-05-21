/* global agent, dashboard */
'use strict';

const assert = require('proclaim');

describe('GET /api/v1', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/api/v1');
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	describe('with no User-Agent header', () => {
		let request;

		beforeEach(() => {
			request = agent.get('/api/v1').set('User-Agent', '');
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with JSON', done => {
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

describe('GET /api/v1/sites', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/api/v1/sites');
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('responds with all of the sites in the database as an array', done => {
		dashboard.database.select('*').from('sites')
			.then(sites => {
				const jsonifiedSites = JSON.parse(JSON.stringify(sites));
				request.expect(response => {
					assert.isArray(response.body);
					assert.greaterThan(response.body.length, 0);
					assert.deepEqual(response.body, jsonifiedSites);
				}).end(done);
			})
			.catch(done);
	});

});

describe('GET /api/v1/404', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/api/v1/404');
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
