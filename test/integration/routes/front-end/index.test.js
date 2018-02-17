'use strict';

const assert = require('proclaim');
const auth = require('../../helpers/auth');
const database = require('../../helpers/database');
let response;

describe('GET /', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when a user is logged in', () => {

		before(async () => {
			response = await request.get('/', {
				jar: await auth.getCookieJar('read@example.com', 'password')
			});
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

	describe('when no user is logged in', () => {

		before(async () => {
			response = await request.get('/');
		});

		it('responds with a 302 status', () => {
			assert.strictEqual(response.statusCode, 302);
		});

		it('responds with a Location header pointing to the login page', () => {
			assert.strictEqual(response.headers.location, '/login');
		});

		it('responds with plain text', () => {
			assert.include(response.headers['content-type'], 'text/plain');
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
