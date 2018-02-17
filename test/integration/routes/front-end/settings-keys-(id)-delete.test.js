'use strict';

const assert = require('proclaim');
const auth = require('../../helpers/auth');
const database = require('../../helpers/database');
let response;

describe('GET /settings/keys/:keyId/delete', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when a user is logged in', () => {

		describe('when everything is valid', () => {

			beforeEach(async () => {
				response = await request.get('/settings/keys/mock-read-key/delete', {
					jar: await auth.getCookieJar('read@example.com', 'password')
				});
			});

			it('responds with a 200 status', () => {
				assert.strictEqual(response.statusCode, 200);
			});

			it('responds with HTML', () => {
				assert.include(response.headers['content-type'], 'text/html');
			});

			it('responds with no error messages', () => {
				const errors = response.body.document.querySelectorAll('[data-test=delete-key-form] [data-test=alert-error]');
				assert.lengthEquals(errors, 0);
			});

			it('responds with a delete key form', () => {
				const form = response.body.document.querySelector('[data-test=delete-key-form]');
				assert.isNotNull(form);
				assert.strictEqual(form.getAttribute('action'), '/settings/keys/mock-read-key/delete');
				assert.strictEqual(form.getAttribute('method'), 'post');
			});

		});

		describe('when the given key does not exist', () => {

			beforeEach(async () => {
				response = await request.get('/settings/keys/not-a-key/delete', {
					jar: await auth.getCookieJar('read@example.com', 'password')
				});
			});

			it('responds with a 404 status', () => {
				assert.strictEqual(response.statusCode, 404);
			});

			it('it responds with an error page', () => {
				const body = response.body.document.querySelector('body');
				assert.match(body.innerHTML, /not found/i);
			});

		});

		describe('when the given key belongs to a different user', () => {

			beforeEach(async () => {
				response = await request.get('/settings/keys/mock-write-key/delete', {
					jar: await auth.getCookieJar('read@example.com', 'password')
				});
			});

			it('responds with a 404 status', () => {
				assert.strictEqual(response.statusCode, 404);
			});

			it('it responds with an error page', () => {
				const body = response.body.document.querySelector('body');
				assert.match(body.innerHTML, /not found/i);
			});

		});

	});

	describe('when no user is logged in', () => {

		beforeEach(async () => {
			response = await request.get('/settings/keys/mock-read-key/delete');
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

// TODO add test for POST method
