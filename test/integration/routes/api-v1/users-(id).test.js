'use strict';

const assert = require('proclaim');
const bcrypt = require('bcrypt');
const database = require('../../helpers/database');
let response;

describe('GET /api/v1/users/:userId', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/api/v1/users/mock-read-id', {
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

		it('responds with the user details', () => {
			assert.isObject(response.body);
			assert.strictEqual(response.body.id, 'mock-read-id');
			assert.deepEqual(response.body.permissions, {
				admin: false,
				delete: false,
				write: false,
				read: true
			});
		});

	});

	describe('when :userId is not a valid user ID', () => {

		before(async () => {
			response = await request.get('/api/v1/users/not-an-id', {
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
			response = await request.get('/api/v1/users/mock-read-id');
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
			response = await request.get('/api/v1/users/mock-read-id', {
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

describe('PATCH /api/v1/users/:userId', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-read-id', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					id: 'extra-property-id',
					email: 'test-new-user@new-example.com',
					password: 'new-password',
					read: false,
					write: true,
					delete: true,
					admin: true
				})
			});
		});

		it('updates the user in the database', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'test-new-user@new-example.com'
			});
			const user = users[0];

			assert.lengthEquals(users, 1, 'One user is present');
			assert.isString(user.id, 'User has an ID');
			assert.notStrictEqual(user.id, 'extra-property-id', 'User ID cannot be set in request');
			assert.strictEqual(user.email, 'test-new-user@new-example.com', 'User has the correct new email');
			assert.notStrictEqual(user.password, 'new-password', 'New password is not stored in clear text');
			assert.isTrue(await bcrypt.compare('new-password', user.password), 'New password is hashed');
			assert.isFalse(user.allow_read, 'User has the correct new "read" permission');
			assert.isTrue(user.allow_write, 'User has the correct new "write" permission');
			assert.isTrue(user.allow_delete, 'User has the correct new "delete" permission');
			assert.isTrue(user.allow_admin, 'User has the correct new "admin" permission');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with the updated user details', () => {
			assert.isObject(response.body);
			assert.strictEqual(response.body.id, 'mock-read-id');
			assert.strictEqual(response.body.email, 'test-new-user@new-example.com');
			assert.deepEqual(response.body.permissions, {
				admin: true,
				delete: true,
				write: true,
				read: false
			});
		});

	});

	describe('when everything is valid but a password is not set', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-read-id', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					email: 'test-new-user@new-example.com'
				})
			});
		});

		it('updates the user in the database but does not change the password', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'test-new-user@new-example.com'
			});
			const user = users[0];

			assert.lengthEquals(users, 1, 'One user is present');
			assert.isString(user.id, 'User has an ID');
			assert.isTrue(await bcrypt.compare('password', user.password), 'Password has not changed');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

	});

	describe('when the request has no data set', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-read-id', {
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

	describe('when the request includes an invalid email property', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-read-id', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					email: []
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
				'"email" must be a string'
			]);
			assert.strictEqual(response.body.status, 400);
		});

	});

	describe('when :userId is the ID of an owner', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-owner-id', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					email: 'test-new-user@new-example.com'
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

	describe('when :userId is not a valid user ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/not-an-id', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					email: 'test-new-user@new-example.com'
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

	describe('when no API credentials are provided', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/users/mock-read-id', {
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: 'test-new-user@new-example.com'
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
			response = await request.patch('/api/v1/users/mock-read-id', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-delete-key',
					'X-Api-Secret': 'mock-delete-secret'
				},
				body: JSON.stringify({
					email: 'test-new-user@new-example.com'
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

describe('DELETE /api/v1/users/:userId', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/users/mock-read-id', {
				headers: {
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				}
			});
		});

		it('removes the expected user from the database', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				id: 'mock-read-id'
			});
			assert.lengthEquals(users, 0);
		});

		it('responds with a 204 status', () => {
			assert.strictEqual(response.statusCode, 204);
		});

		it('responds with nothing', () => {
			assert.isUndefined(response.headers['content-type']);
			assert.strictEqual(response.body, '');
		});

	});

	describe('when :userId is the ID of the authenticated user', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/users/mock-admin-id', {
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

	describe('when :userId is the ID of an owner', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/users/mock-owner-id', {
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

	describe('when :userId is not a valid user ID', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/users/not-an-id', {
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
			await database.seed(dashboard, 'basic');
			response = await request.delete('/api/v1/users/mock-read-id');
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
			response = await request.delete('/api/v1/users/mock-read-id', {
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
