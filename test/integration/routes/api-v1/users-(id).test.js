'use strict';

const bcrypt = require('bcrypt');
const database = require('../../helpers/database');
const assert = require('proclaim');

describe('GET /api/v1/users/:userId', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.get('/api/v1/users/mock-read-id')
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
			it('contains the user details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.strictEqual(json.id, 'mock-read-id');
				assert.deepEqual(json.permissions, {
					admin: false,
					delete: false,
					write: false,
					read: true
				});
			});
		});

	});

	describe('when :userId is not a valid user ID', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.get('/api/v1/users/not-an-id')
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
			request = agent.get('/api/v1/users/mock-read-id');
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
				.get('/api/v1/users/mock-read-id')
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

describe('PATCH /api/v1/users/:userId', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/users/mock-read-id')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret')
				.send({
					id: 'extra-property-id',
					email: 'test-new-user@new-example.com',
					password: 'new-password',
					read: false,
					write: true,
					delete: true,
					admin: true
				});
		});

		it('updates the user in the database', async () => {
			await request.then();
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
			return request.expect(200);
		});

		it('responds with JSON', () => {
			return request.expect('Content-Type', /application\/json/);
		});

		describe('JSON response', () => {
			it('contains the updated user details', async () => {
				const json = (await request.then()).body;
				assert.isObject(json);
				assert.strictEqual(json.id, 'mock-read-id');
				assert.strictEqual(json.email, 'test-new-user@new-example.com');
				assert.deepEqual(json.permissions, {
					admin: true,
					delete: true,
					write: true,
					read: false
				});
			});
		});

	});

	describe('when everything is valid but a password is not set', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/users/mock-read-id')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret')
				.send({
					email: 'test-new-user@new-example.com'
				});
		});

		it('updates the user in the database but does not change the password', async () => {
			await request.then();
			const users = await dashboard.database.knex.select('*').from('users').where({
				email: 'test-new-user@new-example.com'
			});
			const user = users[0];

			assert.lengthEquals(users, 1, 'One user is present');
			assert.isString(user.id, 'User has an ID');
			assert.isTrue(await bcrypt.compare('password', user.password), 'Password has not changed');
		});

		it('responds with a 200 status', () => {
			return request.expect(200);
		});

	});

	describe('when the request has no data set', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/users/mock-read-id')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret')
				.send({});
		});

		it('responds with a 200 status', () => {
			return request.expect(200);
		});

	});

	describe('when the request includes an invalid email property', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/users/mock-read-id')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret')
				.send({
					email: []
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
					'"email" must be a string'
				]);
				assert.strictEqual(json.status, 400);
			});
		});

	});

	describe('when :userId is the ID of an owner', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/users/mock-owner-id')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret')
				.send({
					email: 'test-new-user@new-example.com'
				});
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

	describe('when :userId is not a valid user ID', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/users/not-an-id')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret')
				.send({
					email: 'test-new-user@new-example.com'
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
				.patch('/api/v1/users/mock-read-id')
				.send({
					email: 'test-new-user@new-example.com'
				});
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
				.patch('/api/v1/users/mock-read-id')
				.set('X-Api-Key', 'mock-delete-key')
				.set('X-Api-Secret', 'mock-delete-secret')
				.send({
					email: 'test-new-user@new-example.com'
				});
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

describe('DELETE /api/v1/users/:userId', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.delete('/api/v1/users/mock-read-id')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret');
		});

		it('removes the expected user from the database', async () => {
			await request.then();
			const users = await dashboard.database.knex.select('*').from('users').where({
				id: 'mock-read-id'
			});
			assert.lengthEquals(users, 0);
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

	describe('when :userId is the ID of the authenticated user', () => {
		let request;

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.delete('/api/v1/users/mock-admin-id')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret');
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

	describe('when :userId is the ID of an owner', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.delete('/api/v1/users/mock-owner-id')
				.set('X-Api-Key', 'mock-admin-key')
				.set('X-Api-Secret', 'mock-admin-secret');
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

	describe('when :userId is not a valid user ID', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.delete('/api/v1/users/not-an-id')
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
			request = agent.delete('/api/v1/users/mock-read-id');
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
				.delete('/api/v1/users/mock-read-id')
				.set('X-Api-Key', 'mock-write-key')
				.set('X-Api-Secret', 'mock-write-secret');
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
