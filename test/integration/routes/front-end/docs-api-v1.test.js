'use strict';

const assert = require('proclaim');
const auth = require('../../helpers/auth');
const database = require('../../helpers/database');
let response;

describe('GET /docs/api/v1', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when a user is logged in', () => {

		before(async () => {
			response = await request.get('/docs/api/v1', {
				jar: await auth.getCookieJar('read@example.com', 'password')
			});
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

	});

	describe('when no user is logged in', () => {

		before(async () => {
			response = await request.get('/docs/api/v1');
		});

		it('responds with a 403 status', () => {
			assert.strictEqual(response.statusCode, 403);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

		it('it responds with an error page', () => {
			const body = response.body.document.querySelector('body');
			assert.match(body.innerHTML, /not authorised/i);
		});

	});

	describe('when no user is logged in and the public read access setting is enabled', () => {

		before(async () => {
			await database.seed(dashboard, 'no-auth');
			response = await request.get('/');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with HTML', () => {
			assert.include(response.headers['content-type'], 'text/html');
		});

	});

});
