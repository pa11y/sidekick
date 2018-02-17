'use strict';

const assert = require('proclaim');
const bcrypt = require('bcrypt');
const database = require('../../helpers/database');
let response;

describe('GET /api/v1/users', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/api/v1/users', {
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

		it('responds with an array of each user in the database', () => {
			assert.isArray(response.body);
			assert.lengthEquals(response.body, 7);
			assert.isObject(response.body[0]);
			assert.strictEqual(response.body[0].id, 'mock-owner-id');
			assert.isObject(response.body[1]);
			assert.strictEqual(response.body[1].id, 'mock-admin-id');
			assert.isObject(response.body[2]);
			assert.strictEqual(response.body[2].id, 'mock-delete-id');
			assert.isObject(response.body[3]);
			assert.strictEqual(response.body[3].id, 'mock-noaccess-id');
			assert.isObject(response.body[4]);
			assert.strictEqual(response.body[4].id, 'mock-nokeys-id');
			assert.isObject(response.body[5]);
			assert.strictEqual(response.body[5].id, 'mock-read-id');
			assert.isObject(response.body[6]);
			assert.strictEqual(response.body[6].id, 'mock-write-id');
		});

	});

	describe('when no API credentials are provided', () => {

		before(async () => {
			response = await request.get('/api/v1/users');
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
			response = await request.get('/api/v1/users', {
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

describe('POST /api/v1/users', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/users', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					id: 'extra-property-id',
					email: 'test-new-user@example.com',
					password: 'mock-password',
					read: true,
					write: true,
					delete: false,
					admin: false
				})
			});
		});

		it('creates a new user in the database', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'test-new-user@example.com'
			});
			const user = users[0];

			assert.lengthEquals(users, 1, 'One user is present');
			assert.isString(user.id, 'User has an ID');
			assert.notStrictEqual(user.id, 'extra-property-id', 'User ID cannot be set in request');
			assert.isString(user.password, 'User has a password');
			assert.notStrictEqual(user.password, 'mock-password', 'Password is not stored in clear text');
			assert.isTrue(await bcrypt.compare('mock-password', user.password), 'Password is hashed');
			assert.isTrue(user.allow_read, 'User has the correct "read" permission');
			assert.isTrue(user.allow_write, 'User has the correct "write" permission');
			assert.isFalse(user.allow_delete, 'User has the correct "delete" permission');
			assert.isFalse(user.allow_admin, 'User has the correct "admin" permission');
		});

		it('responds with a 201 status', () => {
			assert.strictEqual(response.statusCode, 201);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with the new user details', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'test-new-user@example.com'
			});

			assert.isObject(response.body);
			assert.strictEqual(response.body.id, users[0].id);
		});

	});

	describe('when the request does not include permission properties', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/users', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					email: 'test-new-user@example.com',
					password: 'mock-password'
				})
			});
		});

		it('defaults them to `false`', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'test-new-user@example.com'
			});
			const user = users[0];

			assert.isFalse(user.allow_read, 'User has the correct "read" permission');
			assert.isFalse(user.allow_write, 'User has the correct "write" permission');
			assert.isFalse(user.allow_delete, 'User has the correct "delete" permission');
			assert.isFalse(user.allow_admin, 'User has the correct "admin" permission');
		});

		it('responds with a 201 status', () => {
			assert.strictEqual(response.statusCode, 201);
		});

	});

	describe('when the request does not include an email or password property', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/users', {
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
				'"email" is required',
				'"password" is required'
			]);
			assert.strictEqual(response.body.status, 400);
		});

	});

	describe('when the email property is not unique', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/users', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-admin-key',
					'X-Api-Secret': 'mock-admin-secret'
				},
				body: JSON.stringify({
					email: 'admin@example.com',
					password: 'mock-password'
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
				'"email" must be unique'
			]);
			assert.strictEqual(response.body.status, 400);
		});

	});

	describe('when no API credentials are provided', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/users', {
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
			response = await request.post('/api/v1/users', {
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
