'use strict';

const database = require('../../helpers/database');
const assert = require('proclaim');

describe('GET /api/v1/me/keys/:keyId', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.get('/api/v1/me/keys/mock-read-key')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret');
		});

		it('responds with a 200 status', () => {
			return request.expect(200);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains the key details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.strictEqual(json.id, 'mock-read-key');
				assert.strictEqual(json.user, 'mock-read-id');
			});
		});

	});

	describe('when :keyId is not a valid key ID', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.get('/api/v1/me/keys/not-an-id')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret');
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

	describe('when the key does not belong to the currently authenticated user', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.get('/api/v1/me/keys/mock-write-key')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret');
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
			request = agent.get('/api/v1/me/keys/mock-read-key');
		});

		it('responds with a 401 status', () => {
			return request.expect(401);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains error details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.isString(json.message);
				assert.strictEqual(json.status, 401);
			});
		});

	});

});

describe('PATCH /api/v1/me/keys/:keyId', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/me/keys/mock-read-key')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret')
				.send({
					id: 'extra-property-id',
					secret: 'extra-property-secret',
					user_id: 'extra-property-user-id',
					description: 'new-description'
				});
		});

		it('updates the key in the database', async () => {
			await request.then();
			const keys = await dashboard.database.knex.select('*').from('keys').where({
				description: 'new-description'
			});
			const key = keys[0];

			assert.lengthEquals(keys, 1, 'One key is present');
			assert.notStrictEqual(key.id, 'extra-property-id', 'Key ID cannot be set in request');
			assert.notStrictEqual(key.secret, 'extra-property-secret', 'Key secret cannot be set in request');
			assert.notStrictEqual(key.user_id, 'extra-property-user-id', 'Key user cannot be set in the request');
			assert.strictEqual(key.description, 'new-description', 'Key has the correct description');
		});

		it('responds with a 200 status', () => {
			return request.expect(200);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains the updated key details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.strictEqual(json.id, 'mock-read-key');
				assert.strictEqual(json.user, 'mock-read-id');
				assert.strictEqual(json.description, 'new-description');
			});
		});

	});

	describe('when the request has no data set', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/me/keys/mock-read-key')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret')
				.send({});
		});

		it('responds with a 200 status', () => {
			return request.expect(200);
		});

	});

	describe('when the request includes an invalid description property', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/me/keys/mock-read-key')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret')
				.send({
					description: []
				});
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
					'"description" must be a string'
				]);
				assert.strictEqual(json.status, 400);
			});
		});

	});

	describe('when :keyId is not a valid key ID', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/me/keys/not-an-id')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret')
				.send({
					description: 'new-description'
				});
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

	describe('when the key does not belong to the currently authenticated user', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/me/keys/mock-write-key')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret')
				.send({
					description: 'new-description'
				});
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
			request = agent
				.patch('/api/v1/me/keys/mock-read-key')
				.send({
					description: 'new-description'
				});
		});

		it('responds with a 401 status', () => {
			return request.expect(401);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains error details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.isString(json.message);
				assert.strictEqual(json.status, 401);
			});
		});

	});

});

describe('DELETE /api/v1/me/keys/:keyId', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.delete('/api/v1/me/keys/mock-read-key-2')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret');
		});

		it('removes the expected key from the database', async () => {
			await request.then();
			const keys = await dashboard.database.knex.select('*').from('keys').where({
				id: 'mock-read-key-2'
			});
			assert.lengthEquals(keys, 0);
		});

		it('responds with a 204 status', () => {
			return request.expect(204);
		});

		it('responds with nothing', async () => {
			const response = await request.then();
			assert.isUndefined(response.headers['content-type']);
			assert.strictEqual(response.text, '');
		});

	});

	describe('when :keyId is the ID of the key being used to authenticate', () => {
		let request;

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.delete('/api/v1/users/mock-admin-id/keys/mock-read-key')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret');
		});

		it('responds with a 403 status', () => {
			return request.expect(403);
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

	describe('when :keyId is not a valid key ID', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.delete('/api/v1/me/keys/not-an-id')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret');
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

	describe('when the key does not belong to the currently authenticated user', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.delete('/api/v1/me/keys/mock-write-key')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret');
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
			request = agent.delete('/api/v1/me/keys/mock-read-key');
		});

		it('responds with a 401 status', () => {
			return request.expect(401);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains error details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.isString(json.message);
				assert.strictEqual(json.status, 401);
			});
		});

	});

});
