'use strict';

const assert = require('proclaim');
const bcrypt = require('bcrypt');
const database = require('../../helpers/database');
let response;

describe('GET /api/v1/me', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/api/v1/me', {
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

		it('responds with the currently authenticated user\'s details', () => {
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

	describe('when no API credentials are provided', () => {

		before(async () => {
			response = await request.get('/api/v1/me');
		});

		it('responds with a 401 status', () => {
			assert.strictEqual(response.statusCode, 401);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 401);
		});

	});

});

describe('PATCH /api/v1/me', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/me', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
				},
				body: JSON.stringify({
					id: 'extra-property-id',
					email: 'read@new-example.com',
					password: 'new-password',
					read: true,
					write: true,
					delete: true,
					admin: true
				})
			});
		});

		it('updates the currently authenticated user in the database', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'read@new-example.com'
			});
			const user = users[0];

			assert.lengthEquals(users, 1, 'One user is present');
			assert.isString(user.id, 'User has an ID');
			assert.notStrictEqual(user.id, 'extra-property-id', 'User ID cannot be set in request');
			assert.strictEqual(user.email, 'read@new-example.com', 'User has the correct new email');
			assert.notStrictEqual(user.password, 'new-password', 'New password is not stored in clear text');
			assert.isTrue(await bcrypt.compare('new-password', user.password), 'New password is hashed');
		});

		it('does not allow the user to modify or elevate their privileges', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'read@new-example.com'
			});
			const user = users[0];

			assert.isTrue(user.allow_read, 'User has the original "read" permission');
			assert.isFalse(user.allow_write, 'User has the original "write" permission');
			assert.isFalse(user.allow_delete, 'User has the original "delete" permission');
			assert.isFalse(user.allow_admin, 'User has the original "admin" permission');
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
			assert.strictEqual(response.body.email, 'read@new-example.com');
		});

	});

	describe('when everything is valid but a password is not set', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/me', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
				},
				body: JSON.stringify({
					email: 'read@new-example.com'
				})
			});
		});

		it('updates the currently authenticated user in the database but does not change the password', async () => {
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'read@new-example.com'
			});
			const user = users[0];

			assert.lengthEquals(users, 1, 'One user is present');
			assert.isString(user.id, 'User has an ID');
			assert.strictEqual(user.email, 'read@new-example.com', 'User has the correct new email');
			assert.isTrue(await bcrypt.compare('password', user.password), 'Password has not changed');
		});

		it('responds with a 200 status', () => {
			assert.strictEqual(response.statusCode, 200);
		});

	});

	describe('when the request has no data set', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/me', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
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
			response = await request.patch('/api/v1/me', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
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

	describe('when the email property is not unique', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.patch('/api/v1/me', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
				},
				body: JSON.stringify({
					email: 'admin@example.com'
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
			response = await request.patch('/api/v1/me', {
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: 'read@new-example.com'
				})
			});
		});

		it('responds with a 401 status', () => {
			assert.strictEqual(response.statusCode, 401);
		});

		it('responds with JSON', () => {
			assert.include(response.headers['content-type'], 'application/json');
		});

		it('responds with error details', () => {
			assert.isObject(response.body);
			assert.isString(response.body.message);
			assert.strictEqual(response.body.status, 401);
		});

	});

});
