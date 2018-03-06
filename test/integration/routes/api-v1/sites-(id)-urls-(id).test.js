'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
let response;

describe('GET /api/v1/sites/:siteId/urls/:urlId', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/api/v1/sites/mock-site-id-1/urls/mock-url-id-1', {
				headers: {
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
				}
			});
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with the URL details', () => {
			assert.isObject(response.body);
			assert.strictEqual(response.body.id, 'mock-url-id-1');
			assert.strictEqual(response.body.site, 'mock-site-id-1');
			assert.strictEqual(response.body.address, '/');
			assert.strictEqual(response.body.fullAddress, 'http://mock-site-1/');
			assert.deepEqual(response.body.pa11yConfig, {
				standard: 'WCAG2AAA',
				timeout: 500
			});
		});

	});

	describe('when :siteId is not a valid site ID', () => {

		before(async () => {
			response = await request.get('/api/v1/sites/not-an-id/urls/mock-url-id-1', {
				headers: {
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
				}
			});
		});

		it('responds with a 404 status', () => {
			assert.strictEqual(response.statusCode, 404);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 404);
		});

	});

	describe('when :urlId is not a valid URL ID', () => {

		before(async () => {
			response = await request.get('/api/v1/sites/mock-site-id-1/urls/not-an-id', {
				headers: {
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
				}
			});
		});

		it('responds with a 404 status', () => {
			assert.strictEqual(response.statusCode, 404);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 404);
		});

	});

	describe('when :siteId and :urlId are mismatched', () => {

		before(async () => {
			response = await request.get('/api/v1/sites/mock-site-id-2/urls/mock-url-id-1', {
				headers: {
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
				}
			});
		});

		it('responds with a 404 status', () => {
			assert.strictEqual(response.statusCode, 404);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 404);
		});

	});

	describe('when no API credentials are provided', () => {

		before(async () => {
			response = await request.get('/api/v1/sites/mock-site-id-1/urls/mock-url-id-1');
		});

		it('responds with a 403 status', () => {
			assert.strictEqual(response.statusCode, 403);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 403);
		});

	});

	describe('when the provided API key does not have the required permissions', () => {

		before(async () => {
			response = await request.get('/api/v1/sites/mock-site-id-1/urls/mock-url-id-1', {
				headers: {
					'X-Api-Key': 'mock-noaccess-key',
					'X-Api-Secret': 'mock-noaccess-secret'
				}
			});
		});

		it('responds with a 403 status', () => {
			assert.strictEqual(response.statusCode, 403);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 403);
		});

	});

});

describe('PATCH /api/v1/sites/:siteId/urls/:urlId', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/sites/mock-site-id-1/urls/mock-url-id-1', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-write-key',
					'X-Api-Secret': 'mock-write-secret'
				},
				body: JSON.stringify({
					id: 'extra-property-id',
					site_id: 'extra-property-site-id',
					name: 'new-name',
					address: 'new-address',
					pa11yConfig: {
						isNewMockConfig: true
					}
				})
			});
		});

		it('updates the URL in the database', async () => {
			const urls = await dashboard.database.knex.select('*').from('urls').where({
				id: 'mock-url-id-1'
			});
			const url = urls[0];

			assert.lengthEquals(urls, 1, 'One URL is present');
			assert.lengthEquals(urls, 1, 'One url is present');
			assert.isString(url.id, 'URL has an ID');
			assert.notStrictEqual(url.id, 'extra-property-id', 'URL ID cannot be set in request');
			assert.strictEqual(url.site_id, 'mock-site-id-1', 'Site cannot be changed');
			assert.strictEqual(url.name, 'new-name', 'URL has the new name');
			assert.strictEqual(url.address, 'new-address', 'URL has the new address');
			assert.deepEqual(url.pa11y_config, {
				isNewMockConfig: true
			});
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with the updated URL details', () => {
			assert.isObject(response.body);
			assert.strictEqual(response.body.id, 'mock-url-id-1');
			assert.strictEqual(response.body.name, 'new-name');
		});

	});

	describe('when the request has no data set', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/sites/mock-site-id-1/urls/mock-url-id-1', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-write-key',
					'X-Api-Secret': 'mock-write-secret'
				},
				body: JSON.stringify({})
			});
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

	});

	describe('when the request includes an invalid name property', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/sites/mock-site-id-1/urls/mock-url-id-1', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-write-key',
					'X-Api-Secret': 'mock-write-secret'
				},
				body: JSON.stringify({
					name: []
				})
			});
		});

		it('responds with a 400 status', () => {
			assert.strictEqual(response.statusCode, 400);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message, 'Validation failed');
			assert.isArray(response.body.validation);
			assert.deepEqual(response.body.validation, [
				'"name" must be a string'
			]);
			assert.strictEqual(response.body.status, 400);
		});

	});

	describe('when :siteId is not a valid site ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/sites/not-an-id/urls/mock-url-id-1', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-write-key',
					'X-Api-Secret': 'mock-write-secret'
				},
				body: JSON.stringify({})
			});
		});

		it('responds with a 404 status', () => {
			assert.strictEqual(response.statusCode, 404);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 404);
		});

	});

	describe('when :urlId is not a valid URL ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/sites/mock-site-id-1/urls/not-an-id', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-write-key',
					'X-Api-Secret': 'mock-write-secret'
				},
				body: JSON.stringify({})
			});
		});

		it('responds with a 404 status', () => {
			assert.strictEqual(response.statusCode, 404);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 404);
		});

	});

	describe('when :siteId and :urlId are mismatched', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/sites/mock-site-id-2/urls/mock-url-id-1', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-write-key',
					'X-Api-Secret': 'mock-write-secret'
				},
				body: JSON.stringify({})
			});
		});

		it('responds with a 404 status', () => {
			assert.strictEqual(response.statusCode, 404);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 404);
		});

	});

	describe('when no API credentials are provided', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/sites/mock-site-id-1/urls/mock-url-id-1', {
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({})
			});
		});

		it('responds with a 403 status', () => {
			assert.strictEqual(response.statusCode, 403);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 403);
		});

	});

	describe('when the provided API key does not have the required permissions', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/sites/mock-site-id-1/urls/mock-url-id-1', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
				},
				body: JSON.stringify({})
			});
		});

		it('responds with a 403 status', () => {
			assert.strictEqual(response.statusCode, 403);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 403);
		});

	});

});

describe('DELETE /api/v1/sites/:siteId/urls/:urlId', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/sites/mock-site-id-1/urls/mock-url-id-1', {
				headers: {
					'X-Api-Key': 'mock-delete-key',
					'X-Api-Secret': 'mock-delete-secret'
				}
			});
		});

		it('removes the expected URL from the database', async () => {
			const keys = await dashboard.database.knex.select('*').from('keys').where({
				id: 'mock-url-id-1'
			});
			assert.lengthEquals(keys, 0);
		});

		it('responds with a 204 status', () => {
			assert.strictEqual(response.statusCode, 204);
		});

		it('responds with nothing', () => {
			assert.isUndefined(response.headers['content-type']);
			assert.strictEqual(response.body, '');
		});

	});

	describe('when :siteId is not a valid site ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/sites/not-an-id/urls/mock-url-id-1', {
				headers: {
					'X-Api-Key': 'mock-delete-key',
					'X-Api-Secret': 'mock-delete-secret'
				}
			});
		});

		it('responds with a 404 status', () => {
			assert.strictEqual(response.statusCode, 404);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 404);
		});

	});

	describe('when :urlId is not a valid URL ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/sites/mock-site-id-1/urls/not-an-id', {
				headers: {
					'X-Api-Key': 'mock-delete-key',
					'X-Api-Secret': 'mock-delete-secret'
				}
			});
		});

		it('responds with a 404 status', () => {
			assert.strictEqual(response.statusCode, 404);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 404);
		});

	});

	describe('when :siteId and :urlId are mismatched', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/sites/mock-site-id-2/urls/mock-url-id-1', {
				headers: {
					'X-Api-Key': 'mock-delete-key',
					'X-Api-Secret': 'mock-delete-secret'
				}
			});
		});

		it('responds with a 404 status', () => {
			assert.strictEqual(response.statusCode, 404);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 404);
		});

	});

	describe('when no API credentials are provided', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/sites/mock-site-id-1/urls/mock-url-id-1');
		});

		it('responds with a 403 status', () => {
			assert.strictEqual(response.statusCode, 403);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 403);
		});

	});

	describe('when the provided API key does not have the required permissions', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/sites/mock-site-id-1/urls/mock-url-id-1', {
				headers: {
					'X-Api-Key': 'mock-write-key',
					'X-Api-Secret': 'mock-write-secret'
				}
			});
		});

		it('responds with a 403 status', () => {
			assert.strictEqual(response.statusCode, 403);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 403);
		});

	});

});
