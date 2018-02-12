'use strict';

const assert = require('proclaim');
const auth = require('../../helpers/auth');
const database = require('../../helpers/database');
const {JSDOM} = require('jsdom');

describe('GET /settings/keys', () => {
	let request;

	describe('when a user is logged in', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			await auth.login('read@example.com', 'password');
			request = agent.get('/settings/keys');
		});

		it('responds with a 200 status', () => {
			return request.expect(200);
		});

		it('responds with HTML', () => {
			return request.expect('Content-Type', /text\/html/);
		});

		describe('HTML response', () => {
			let dom;
			let table;

			beforeEach(async () => {
				dom = new JSDOM((await request.then()).text);
				table = dom.window.document.querySelector('[data-test=keys-table]');
			});

			it('contains a link to generate a new key', () => {
				assert.isNotNull(dom.window.document.querySelector('a[href="/settings/keys/new"]'));
			});

			it('contains a table containing all the user\'s API keys', () => {
				assert.isNotNull(table);
				assert.match(table.textContent, /key with read permissions/i);
				assert.match(table.textContent, /mock-read-key/i);
				assert.isNotNull(table.querySelector('a[href="/settings/keys/mock-read-key/edit"]'), 'Has an edit link');
				assert.isNotNull(table.querySelector('a[href="/settings/keys/mock-read-key/delete"]'), 'Has a delete link');
			});

		});

	});

	describe('when no user is logged in', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent.get('/settings/keys');
		});

		it('responds with a 401 status', () => {
			return request.expect(401);
		});

		describe('HTML response', () => {
			it('contains a 401 error message', async () => {
				const html = (await request.then()).text;
				assert.match(html, /must authenticate/i);
			});
		});

	});

});
