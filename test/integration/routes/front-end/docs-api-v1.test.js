'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
let response;

describe('GET /docs/api/v1', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/docs/api/v1');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

	});

});
