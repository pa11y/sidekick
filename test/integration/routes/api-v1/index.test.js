'use strict';

const database = require('../../helpers/database');

describe('GET /api/v1', () => {
	let request;

	beforeEach(async () => {
		await database.seed(dashboard, 'basic');
		request = agent.get('/api/v1');
	});

	it('responds with a 302 status', () => {
		return request.expect(302);
	});

	it('responds with a Location header pointing to the API documentation page', () => {
		return request.expect('Location', '/docs/api/v1');
	});

	it('responds with plain text', () => {
		return request.expect('Content-Type', /text\/plain/);
	});

});
