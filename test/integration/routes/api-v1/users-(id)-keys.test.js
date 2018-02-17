'use strict';

const assert = require('proclaim');
const bcrypt = require('bcrypt');
const database = require('../../helpers/database');
let response;

describe('GET /api/v1/users/:userId/keys', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/api/v1/users/mock-read-id/keys', {
				headers: {
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				}
			});
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with each key for that user in the database', () => {
			assert.isArray(response.body);
			assert.lengthEquals(response.body, 2);
			assert.isObject(response.body[0]);
			assert.strictEqual(response.body[0].id, 'mock-read-key');
			assert.strictEqual(response.body[0].user, 'mock-read-id');
			assert.isObject(response.body[1]);
			assert.strictEqual(response.body[1].id, 'mock-read-key-2');
			assert.strictEqual(response.body[1].user, 'mock-read-id');
		});

	});

	describe('when the user does not have any keys', () => {

		before(async () => {
			response = await request.get('/api/v1/users/mock-nokeys-id/keys', {
				headers: {
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
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

	describe('when :userId is not a valid user ID', () => {

		before(async () => {
			response = await request.get('/api/v1/users/not-an-id/keys', {
				headers: {
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
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
			response = await request.get('/api/v1/users/mock-read-id/keys');
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
			response = await request.get('/api/v1/users/mock-read-id/keys', {
				headers: {
					'X-Api-Key': 'mock-delete-key',
					'X-Api-Secret': 'mock-delete-secret'
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

describe('POST /api/v1/users/:userId/keys', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/users/mock-read-id/keys', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					id: 'extra-property-id',
					secret: 'extra-property-secret',
					description: 'mock-description'
				})
			});
		});

		it('creates a new key in the database', async () => {
			const keys = await dashboard.database.knex.select('*').from('keys').where({
				description: 'mock-description'
			});
			const key = keys[0];

			assert.lengthEquals(keys, 1, 'One key is present');
			assert.isString(key.id, 'Key has an ID');
			assert.notStrictEqual(key.id, 'extra-property-id', 'Key ID cannot be set in request');
			assert.isString(key.secret, 'Key has a secret');
			assert.notStrictEqual(key.secret, 'extra-property-secret', 'Key secret cannot be set in request');
			assert.strictEqual(key.user_id, 'mock-read-id', 'Key is associated with the correct user');
			assert.strictEqual(key.description, 'mock-description', 'Key has the correct description');
		});

		it('responds with a 201 status', () => {
			assert.strictEqual(response.statusCode, 201);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with the new key and secret', async () => {
			const keys = await dashboard.database.knex.select('*').from('keys').where({
				description: 'mock-description'
			});

			assert.isObject(response.body);
			assert.strictEqual(response.body.key, keys[0].id);
			assert.notStrictEqual(response.body.secret, keys[0].secret, 'Secret is hashed');
			assert.isTrue(await bcrypt.compare(response.body.secret, keys[0].secret), 'Secret is hashed');
		});

	});

	describe('when the request does not include a description property', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/users/mock-read-id/keys', {
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
				'"description" is required'
			]);
			assert.strictEqual(response.body.status, 400);
		});

	});

	describe('when :userId is not a valid user ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/users/not-an-id/keys', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
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
			response = await request.post('/api/v1/users/mock-read-id/keys', {
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
			response = await request.post('/api/v1/users/mock-read-id/keys', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-delete-key',
					'X-Api-Secret': 'mock-delete-secret'
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
