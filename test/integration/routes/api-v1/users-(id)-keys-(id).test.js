'use strict';

const assert = require('proclaim');
const database = require('../../helpers/database');
let response;

describe('GET /api/v1/users/:userId/keys/:keyId', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/api/v1/users/mock-read-id/keys/mock-read-key', {
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

		it('responds with the key details', () => {
			assert.isObject(response.body);
			assert.strictEqual(response.body.id, 'mock-read-key');
			assert.strictEqual(response.body.user, 'mock-read-id');
		});

	});

	describe('when :userId is not a valid user ID', () => {

		before(async () => {
			response = await request.get('/api/v1/users/not-an-id/keys/mock-read-key', {
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

	describe('when :keyId is not a valid key ID', () => {

		before(async () => {
			response = await request.get('/api/v1/users/mock-read-id/keys/not-an-id', {
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

	describe('when :userId and :keyId are mismatched', () => {

		before(async () => {
			response = await request.get('/api/v1/users/mock-read-id/keys/mock-write-key', {
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
			response = await request.get('/api/v1/users/mock-read-id/keys/mock-read-key');
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
			response = await request.get('/api/v1/users/mock-read-id/keys/mock-read-key', {
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

describe('PATCH /api/v1/users/:userId/keys/:keyId', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-read-id/keys/mock-read-key', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					id: 'extra-property-id',
					secret: 'extra-property-secret',
					user_id: 'extra-property-user-id',
					description: 'new-description'
				})
			});
		});

		it('updates the key in the database', async () => {
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
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with the updated key details', () => {
			assert.isObject(response.body);
			assert.strictEqual(response.body.id, 'mock-read-key');
			assert.strictEqual(response.body.user, 'mock-read-id');
			assert.strictEqual(response.body.description, 'new-description');
		});

	});

	describe('when the request has no data set', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-read-id/keys/mock-read-key', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({})
			});
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

	});

	describe('when the request includes an invalid description property', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-read-id/keys/mock-read-key', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					description: []
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
				'"description" must be a string'
			]);
			assert.strictEqual(response.body.status, 400);
		});

	});

	describe('when :userId is not a valid user ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/not-an-id/keys/mock-read-key', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					description: 'new-description'
				})
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

	describe('when :keyId is not a valid key ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-read-id/keys/not-an-id', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					description: 'new-description'
				})
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

	describe('when :userId and :keyId are mismatched', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-read-id/keys/mock-write-key', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					description: 'new-description'
				})
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

	describe('when :userId is the ID of an owner', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-owner-id/keys/mock-owner-key', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					description: 'new-description'
				})
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

	describe('when no API credentials are provided', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-read-id/keys/mock-read-key', {
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					description: 'new-description'
				})
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
			response = await request.patch('/api/v1/users/mock-read-id/keys/mock-read-key', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-delete-key',
					'X-Api-Secret': 'mock-delete-secret'
				},
				body: JSON.stringify({
					description: 'new-description'
				})
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

describe('DELETE /api/v1/users/:userId/keys/:keyId', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/users/mock-read-id/keys/mock-read-key', {
				headers: {
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				}
			});
		});

		it('removes the expected key from the database', async () => {
			const keys = await dashboard.database.knex.select('*').from('keys').where({
				id: 'mock-read-key'
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

	describe('when :keyId is the ID of the key being used to authenticate', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/users/mock-admin-id/keys/mock-admin-key', {
				headers: {
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				}
			});
		});

		it('responds with a 403 status', () => {
			assert.strictEqual(response.statusCode, 403);
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 403);
		});

	});

	describe('when :userId is not a valid user ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/users/not-an-id/keys/mock-read-key', {
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

	describe('when :keyId is not a valid key ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/users/mock-read-id/keys/not-an-id', {
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

	describe('when :userId and :keyId are mismatched', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/users/mock-read-id/keys/mock-write-key', {
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

	describe('when :userId is the ID of an owner', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/users/mock-owner-id/keys/mock-owner-key', {
				headers: {
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
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

	describe('when no API credentials are provided', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/users/mock-read-id/keys/mock-read-key');
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
			response = await request.delete('/api/v1/users/mock-read-id/keys/mock-read-key', {
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
