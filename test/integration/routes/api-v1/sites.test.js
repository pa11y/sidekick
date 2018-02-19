'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
let response;

describe('GET /api/v1/sites', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/api/v1/sites', {
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

		it('responds with an array of each site in the database', () => {
			assert.isArray(response.body);
			assert.lengthEquals(response.body, 2);
			assert.isObject(response.body[0]);
			assert.strictEqual(response.body[0].id, 'mock-site-id-1');
			assert.isObject(response.body[1]);
			assert.strictEqual(response.body[1].id, 'mock-site-id-2');
		});

	});

	describe('when no API credentials are provided', () => {

		before(async () => {
			response = await request.get('/api/v1/sites');
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
			response = await request.get('/api/v1/sites', {
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
			response = await request.get('/api/v1/sites');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

	});

});

describe('POST /api/v1/sites', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/sites', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-write-key',
					'X-Api-Secret': 'mock-write-secret'
				},
				body: JSON.stringify({
					id: 'extra-property-id',
					name: 'new site',
					baseUrl: 'https://new-site/',
					isRunnable: true,
					isScheduled: false,
					schedule: null,
					pa11yConfig: {
						isMockConfig: true
					}
				})
			});
		});

		it('creates a new site in the database', async () => {
			const sites = await dashboard.database.knex.select('*').from('sites').where({
				name: 'new site'
			});
			const site = sites[0];

			assert.lengthEquals(sites, 1, 'One site is present');
			assert.isString(site.id, 'Site has an ID');
			assert.notStrictEqual(site.id, 'extra-property-id', 'Site ID cannot be set in request');
			assert.strictEqual(site.name, 'edited site', 'Site has the correct name');
			assert.strictEqual(site.base_url, 'https://new-site/', 'Site has the correct base URL');
			assert.isTrue(site.is_runnable, 'Site is runnable');
			assert.isFalse(site.is_scheduled, 'Site is not scheduled');
			assert.isNull(site.schedule, 'Site has the correct schedule');
			assert.deepEqual(site.pa11y_config, {
				isMockConfig: true
			}, 'Site has the correct Pa11y config');
		});

		it('responds with a 201 status', () => {
			assert.strictEqual(response.statusCode, 201);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with the new site details', async () => {
			const sites = await dashboard.database.knex.select('*').from('sites').where({
				name: 'new site'
			});

			assert.isObject(response.body);
			assert.strictEqual(response.body.id, sites[0].id);
		});

	});

	describe('when the request does not include a name or baseUrl property', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/sites', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
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
				'"base_url" is required'
			]);
			assert.strictEqual(response.body.status, 400);
		});

	});

	describe('when no API credentials are provided', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/sites', {
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
			response = await request.post('/api/v1/sites', {
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
