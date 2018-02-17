'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
let response;

describe('GET /api/v1', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.get('/api/v1');
		});

		it('responds with a 302 status', () => {
			assert.strictEqual(response.statusCode, 302);
		});

		it('responds with a Location header pointing to the API documentation page', () => {
			assert.strictEqual(response.headers.location, '/docs/api/v1');
		});

		it('responds with plain text', () => {
			assert.include(response.headers['content-type'], 'text/plain');
		});

	});

});
