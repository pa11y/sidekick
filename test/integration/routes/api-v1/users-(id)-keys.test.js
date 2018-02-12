'use strict';

const bcrypt = require('bcrypt');
const database = require('../../helpers/database');
const assert = require('proclaim');

describe('GET /api/v1/users/:userId/keys', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.get('/api/v1/users/mock-read-id/keys')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret');
		});

		it('responds with a 200 status', () => {
			return request.expect(200);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('is an array containing each key for that user in the database', async () => {
				const json = (await request.then()).body;
				assert.isArray(json);
				assert.lengthEquals(json, 2);
				assert.isObject(json[0]);
				assert.strictEqual(json[0].id, 'mock-read-key');
				assert.strictEqual(json[0].user, 'mock-read-id');
				assert.isObject(json[1]);
				assert.strictEqual(json[1].id, 'mock-read-key-2');
				assert.strictEqual(json[1].user, 'mock-read-id');
			});
		});

	});

	describe('when the user does not have any keys', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.get('/api/v1/users/mock-nokeys-id/keys')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret');
		});

		it('responds with a 200 status', () => {
			return request.expect(200);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('is an empty array', async () => {
				const json = (await request.then()).body;
				assert.isArray(json);
				assert.lengthEquals(json, 0);
			});
		});

	});

	describe('when :userId is not a valid user ID', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.get('/api/v1/users/not-an-id/keys')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret');
		});

		it('responds with a 404 status', () => {
			return request.expect(404);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains error details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.isString(json.message);
				assert.strictEqual(json.status, 404);
			});
		});

	});

	describe('when no API credentials are provided', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent.get('/api/v1/users/mock-read-id/keys');
		});

		it('responds with a 403 status', () => {
			return request.expect(403);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains error details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.isString(json.message);
				assert.strictEqual(json.status, 403);
			});
		});

	});

	describe('when the provided API key does not have the required permissions', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.get('/api/v1/users/mock-read-id/keys')
				.set('X-Api-Key', 'mock-delete-key')
				.set('X-Api-Secret', 'mock-delete-secret');
		});

		it('responds with a 403 status', () => {
			return request.expect(403);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains error details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.isString(json.message);
				assert.strictEqual(json.status, 403);
			});
		});

	});

});

describe('POST /api/v1/users/:userId/keys', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.post('/api/v1/users/mock-read-id/keys')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret')
				.send({
					id: 'extra-property-id',
					secret: 'extra-property-secret',
					description: 'mock-description'
				});
		});

		it('creates a new key in the database', async () => {
			await request.then();
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
			return request.expect(201);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains the new key and secret', async () => {
				const json = (await request.then()).body;
				const keys = await dashboard.database.knex.select('*').from('keys').where({
					description: 'mock-description'
				});

				assert.isObject(json);
				assert.strictEqual(json.key, keys[0].id);
				assert.notStrictEqual(json.secret, keys[0].secret, 'Secret is hashed');
				assert.isTrue(await bcrypt.compare(json.secret, keys[0].secret), 'Secret is hashed');
			});
		});

	});

	describe('when the request does not include a description property', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.post('/api/v1/users/mock-read-id/keys')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret')
				.send({});
		});

		it('responds with a 400 status', () => {
			return request.expect(400);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains error details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.isString(json.message, 'Validation failed');
				assert.isArray(json.validation);
				assert.deepEqual(json.validation, [
					'"description" is required'
				]);
				assert.strictEqual(json.status, 400);
			});
		});

	});

	describe('when :userId is not a valid user ID', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.post('/api/v1/users/not-an-id/keys')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret');
		});

		it('responds with a 404 status', () => {
			return request.expect(404);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains error details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.isString(json.message);
				assert.strictEqual(json.status, 404);
			});
		});

	});

	describe('when no API credentials are provided', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent.post('/api/v1/users/mock-read-id/keys');
		});

		it('responds with a 403 status', () => {
			return request.expect(403);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains error details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.isString(json.message);
				assert.strictEqual(json.status, 403);
			});
		});

	});

	describe('when the provided API key does not have the required permissions', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.post('/api/v1/users/mock-read-id/keys')
				.set('X-Api-Key', 'mock-delete-key')
				.set('X-Api-Secret', 'mock-delete-secret');
		});

		it('responds with a 403 status', () => {
			return request.expect(403);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains error details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.isString(json.message);
				assert.strictEqual(json.status, 403);
			});
		});

	});

});
