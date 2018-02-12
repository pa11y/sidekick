'use strict';

const bcrypt = require('bcrypt');
const database = require('../../helpers/database');
const assert = require('proclaim');

describe('GET /api/v1/users', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.get('/api/v1/users')
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
			it('is an array containing each user in the database', async () => {
				const json = (await request.then()).body;
				assert.isArray(json);
				assert.lengthEquals(json, 7);
				assert.isObject(json[0]);
				assert.strictEqual(json[0].id, 'mock-owner-id');
				assert.isObject(json[1]);
				assert.strictEqual(json[1].id, 'mock-admin-id');
				assert.isObject(json[2]);
				assert.strictEqual(json[2].id, 'mock-delete-id');
				assert.isObject(json[3]);
				assert.strictEqual(json[3].id, 'mock-noaccess-id');
				assert.isObject(json[4]);
				assert.strictEqual(json[4].id, 'mock-nokeys-id');
				assert.isObject(json[5]);
				assert.strictEqual(json[5].id, 'mock-read-id');
				assert.isObject(json[6]);
				assert.strictEqual(json[6].id, 'mock-write-id');
			});
		});

	});

	describe('when no API credentials are provided', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent.get('/api/v1/users');
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
				.get('/api/v1/users')
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

describe('POST /api/v1/users', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.post('/api/v1/users')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret')
				.send({
					id: 'extra-property-id',
					email: 'test-new-user@example.com',
					password: 'mock-password',
					read: true,
					write: true,
					delete: false,
					admin: false
				});
		});

		it('creates a new user in the database', async () => {
			await request.then();
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
			return request.expect(201);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains the new user details', async () => {
				const json = (await request.then()).body;
				const users = await dashboard.database.knex.select('*').from('users').where({
					email: 'test-new-user@example.com'
				});

				assert.isObject(json);
				assert.strictEqual(json.id, users[0].id);
			});
		});

	});

	describe('when the request does not include permission properties', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.post('/api/v1/users')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret')
				.send({
					email: 'test-new-user@example.com',
					password: 'mock-password'
				});
		});

		it('defaults them to `false`', async () => {
			await request.then();
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
			return request.expect(201);
		});

	});

	describe('when the request does not include an email or password property', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.post('/api/v1/users')
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
					'"email" is required',
					'"password" is required'
				]);
				assert.strictEqual(json.status, 400);
			});
		});

	});

	describe('when the email property is not unique', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.post('/api/v1/users')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret')
				.send({
					email: 'admin@example.com',
					password: 'mock-password'
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
					'"email" must be unique'
				]);
				assert.strictEqual(json.status, 400);
			});
		});

	});

	describe('when no API credentials are provided', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent.post('/api/v1/users');
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
				.post('/api/v1/users')
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
