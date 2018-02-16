'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
let response;

describe('GET /', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

		// Temporary until home page has more content
		it('it responds with the home page', () => {
			const body = response.body.document.querySelector('body');
			assert.match(body.innerHTML, /hello world/i);
		});

	});

});
