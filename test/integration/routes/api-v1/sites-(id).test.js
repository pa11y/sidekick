'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
let response;

describe('GET /api/v1/sites/:siteId', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/api/v1/sites/mock-site-id-1', {
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

		it('responds with the site details', () => {
			assert.isObject(response.body);
			assert.strictEqual(response.body.id, 'mock-site-id-1');
		});

	});

	describe('when :siteId is not a valid site ID', () => {

		before(async () => {
			response = await request.get('/api/v1/sites/not-an-id', {
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
			response = await request.get('/api/v1/sites/mock-site-id-1');
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
			response = await request.get('/api/v1/sites/mock-site-id-1', {
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
			response = await request.get('/api/v1/sites/mock-site-id-1');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

	});

});

describe('PATCH /api/v1/sites/:siteId', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/sites/mock-site-id-1', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-write-key',
					'X-Api-Secret': 'mock-write-secret'
				},
				body: JSON.stringify({
					id: 'extra-property-id',
					name: 'edited site',
					baseUrl: 'https://edited-site/',
					isRunnable: false,
					isScheduled: false,
					schedule: null,
					pa11yConfig: {
						isUpdated: true
					}
				})
			});
		});

		it('updates the site in the database', async () => {
			const sites = await dashboard.database.knex.select('*').from('sites').where({
				name: 'edited site'
			});
			const site = sites[0];

			assert.lengthEquals(sites, 1, 'One site is present');
			assert.isString(site.id, 'Site has an ID');
			assert.notStrictEqual(site.id, 'extra-property-id', 'Site ID cannot be set in request');
			assert.strictEqual(site.name, 'edited site', 'Site has the correct name');
			assert.strictEqual(site.base_url, 'https://edited-site/', 'Site has the correct base URL');
			assert.isFalse(site.is_runnable, 'Site is not runnable');
			assert.isFalse(site.is_scheduled, 'Site is not scheduled');
			assert.isNull(site.schedule, 'Site has the correct schedule');
			assert.deepEqual(site.pa11y_config, {
				isUpdated: true
			}, 'Site has the correct Pa11y config');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with the updated site details', () => {
			assert.isObject(response.body);
			assert.strictEqual(response.body.id, 'mock-site-id-1');
			assert.strictEqual(response.body.name, 'edited site');
		});

	});

	describe('when the request has no data set', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/sites/mock-site-id-1', {
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

	describe('when :siteId is not a valid site ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/sites/not-an-id', {
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
			response = await request.patch('/api/v1/sites/mock-site-id-1', {
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
			response = await request.patch('/api/v1/sites/mock-site-id-1', {
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

describe('DELETE /api/v1/sites/:siteId', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/sites/mock-site-id-1', {
				headers: {
					'X-Api-Key': 'mock-delete-key',
					'X-Api-Secret': 'mock-delete-secret'
				}
			});
		});

		it('removes the expected site from the database', async () => {
			const sites = await dashboard.database.knex.select('*').from('sites').where({
				id: 'mock-site-id-1'
			});
			assert.lengthEquals(sites, 0);
		});

		it('removes the expected site\'s URLs from the database', async () => {
			const urls = await dashboard.database.knex.select('*').from('urls').where({
				site_id: 'mock-site-id-1'
			});
			assert.lengthEquals(urls, 0);
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
			response = await request.delete('/api/v1/sites/not-an-id', {
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
			response = await request.delete('/api/v1/sites/mock-site-id-1');
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
			response = await request.delete('/api/v1/sites/mock-site-id-1', {
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
