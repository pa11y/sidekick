'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
let response;

describe('GET /404', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/404');
		});

		it('responds with a 404 status', () => {
			assert.strictEqual(response.statusCode, 404);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

		it('it responds with an error page', () => {
			const body = response.body.document.querySelector('body');
			assert.match(body.innerHTML, /not found/i);
		});

	});

});
