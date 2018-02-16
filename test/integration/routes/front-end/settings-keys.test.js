'use strict';

const assert = require('proclaim');
const auth = require('../../helpers/auth');
const database = require('../../helpers/database');
let response;

describe('GET /settings/keys', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when a user is logged in', () => {

		describe('when everything is valid', () => {

			before(async () => {
				response = await request.get('/settings/keys', {
					jar: await auth.getCookieJar('read@example.com', 'password')
				});
			});

			it('responds with a 200 status', () => {
				assert.strictEqual(response.statusCode, 200);
			});

			it('responds with HTML', () => {
				assert.include(response.headers['content-type'], 'text/html');
			});

			it('responds with a link to generate a new key', () => {
				const link = response.body.document.querySelector('a[href="/settings/keys/new"]');
				assert.isNotNull(link);
			});

			it('responds with a table containing all the user\'s API keys', () => {
				const table = response.body.document.querySelector('[data-test=keys-table]');
				assert.isNotNull(table);
				assert.match(table.textContent, /key with read permissions/i);
				assert.match(table.textContent, /mock-read-key/i);
				assert.isNotNull(table.querySelector('a[href="/settings/keys/mock-read-key/edit"]'), 'Has an edit link');
				assert.isNotNull(table.querySelector('a[href="/settings/keys/mock-read-key/delete"]'), 'Has a delete link');
			});

		});

	});

	describe('when no user is logged in', () => {

		before(async () => {
			response = await request.get('/settings/keys');
		});

		it('responds with a 401 status', () => {
			assert.strictEqual(response.statusCode, 401);
		});

		it('it responds with an error page', () => {
			const body = response.body.document.querySelector('body');
			assert.match(body.innerHTML, /must authenticate/i);
		});

	});

});
