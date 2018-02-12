'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');

describe('GET /404', () => {
	let request;

	beforeEach(async () => {
		await database.seed(dashboard, 'basic');
		request = agent.get('/404');
	});

	it('responds with a 404 status', () => {
		return request.expect(404);
	});

	it('responds with HTML', () => {
		return request.expect('Content-Type', /text\/html/);
	});

	describe('HTML response', () => {
		it('contains a 404 error message', async () => {
			const html = (await request.then()).text;
			assert.match(html, /not found/i);
		});
	});

});
