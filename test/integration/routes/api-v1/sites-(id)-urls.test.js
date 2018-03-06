'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
let response;

describe('GET /api/v1/sites/:siteId/urls', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/api/v1/sites/mock-site-id-1/urls', {
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

		it('responds with each URL for that site in the database', () => {
			assert.isArray(response.body);
			assert.lengthEquals(response.body, 3);
			assert.isObject(response.body[0]);
			assert.strictEqual(response.body[0].id, 'mock-url-id-1');
			assert.strictEqual(response.body[0].site, 'mock-site-id-1');
			assert.strictEqual(response.body[0].address, '/');
			assert.strictEqual(response.body[0].fullAddress, 'http://mock-site-1/');
			assert.deepEqual(response.body[0].pa11yConfig, {
				standard: 'WCAG2AAA',
				timeout: 500
			});
			assert.isObject(response.body[1]);
			assert.strictEqual(response.body[1].id, 'mock-url-id-2');
			assert.strictEqual(response.body[1].site, 'mock-site-id-1');
			assert.strictEqual(response.body[1].address, '/example');
			assert.strictEqual(response.body[1].fullAddress, 'http://mock-site-1/example');
			assert.deepEqual(response.body[1].pa11yConfig, {
				standard: 'WCAG2AAA'
			});
			assert.isObject(response.body[2]);
			assert.strictEqual(response.body[2].id, 'mock-url-id-3');
			assert.strictEqual(response.body[2].site, 'mock-site-id-1');
			assert.strictEqual(response.body[2].address, 'http://mock-url-3/example');
			assert.strictEqual(response.body[2].fullAddress, 'http://mock-url-3/example');
			assert.deepEqual(response.body[2].pa11yConfig, {
				standard: 'WCAG2AAA'
			});
		});

	});

	describe('when the site does not have any URLs', () => {

		before(async () => {
			response = await request.get('/api/v1/sites/mock-site-id-2/urls', {
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

		it('responds with an empty array', () => {
			assert.isArray(response.body);
			assert.lengthEquals(response.body, 0);
		});

	});

	describe('when :siteId is not a valid site ID', () => {

		before(async () => {
			response = await request.get('/api/v1/sites/not-an-id/urls', {
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
			response = await request.get('/api/v1/sites/mock-site-id-1/urls');
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
			response = await request.get('/api/v1/sites/mock-site-id-1/urls', {
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

	describe('when the public read access setting is enabled', () => {

		before(async () => {
			await database.seed(dashboard, 'no-auth');
			response = await request.get('/api/v1/sites/mock-site-id-1/urls');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

	});

});

describe('POST /api/v1/sites/:siteId/urls', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/sites/mock-site-id-1/urls', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-write-key',
					'X-Api-Secret': 'mock-write-secret'
				},
				body: JSON.stringify({
					id: 'extra-property-id',
					site_id: 'extra-property-site-id',
					name: 'mock-new-url',
					address: 'mock-address',
					pa11yConfig: {
						isMockConfig: true
					}
				})
			});
		});

		it('creates a new url in the database', async () => {
			const urls = await dashboard.database.knex.select('*').from('urls').where({
				name: 'mock-new-url'
			});
			const url = urls[0];

			assert.lengthEquals(urls, 1, 'One url is present');
			assert.isString(url.id, 'URL has an ID');
			assert.notStrictEqual(url.id, 'extra-property-id', 'URL ID cannot be set in request');
			assert.strictEqual(url.site_id, 'mock-site-id-1', 'URL is associated with the correct site');
			assert.strictEqual(url.name, 'mock-new-url', 'URL has the correct name');
			assert.strictEqual(url.address, 'mock-address', 'URL has the correct address');
			assert.deepEqual(url.pa11y_config, {
				isMockConfig: true
			});
		});

		it('responds with a 201 status', () => {
			assert.strictEqual(response.statusCode, 201);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with the new URL details', async () => {
			const urls = await dashboard.database.knex.select('*').from('urls').where({
				name: 'mock-new-url'
			});

			assert.isObject(response.body);
			assert.strictEqual(response.body.id, urls[0].id);
		});

	});

	describe('when the request does not include a name or address property', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/sites/mock-site-id-1/urls', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-write-key',
					'X-Api-Secret': 'mock-write-secret'
				},
				body: JSON.stringify({})
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
				'"name" is required',
				'"address" is required'
			]);
			assert.strictEqual(response.body.status, 400);
		});

	});

	describe('when :siteId is not a valid site ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/sites/not-an-id/urls', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-write-key',
					'X-Api-Secret': 'mock-write-secret'
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
			response = await request.post('/api/v1/sites/mock-site-id-1/urls', {
				headers: {
					'Content-Type': 'application/json'
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

	describe('when the provided API key does not have the required permissions', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/sites/mock-site-id-1/urls', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
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
