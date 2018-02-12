'use strict';

const database = require('../../helpers/database');

describe('GET /docs/api/v1', () => {
	let request;

	beforeEach(async () => {
		await database.seed(dashboard, 'basic');
		request = agent.get('/docs/api/v1');
	});

	it('responds with a 200 status', () => {
		return request.expect(200);
	});

	it('responds with HTML', () => {
		return request.expect('Content-Type', /text\/html/);
	});

});
