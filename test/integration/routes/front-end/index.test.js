'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');

describe('GET /', () => {
	let request;

	beforeEach(async () => {
		await database.seed(dashboard, 'basic');
		request = agent.get('/');
	});

	it('responds with a 200 status', () => {
		return request.expect(200);
	});

	it('responds with HTML', () => {
		return request.expect('Content-Type', /text\/html/);
	});

	// Temporary until home page has more content
	describe('HTML response', () => {
		it('is the home page', async () => {
			const html = (await request.then()).text;
			assert.match(html, /hello world/i);
		});
	});

});
