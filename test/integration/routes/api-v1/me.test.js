'use strict';

const bcrypt = require('bcrypt');
const database = require('../../helpers/database');
const assert = require('proclaim');

describe('GET /api/v1/me', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.get('/api/v1/me')
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
			it('contains the currently authenticated user\'s details', async () => {
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

	describe('when no API credentials are provided', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent.get('/api/v1/me');
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

describe('PATCH /api/v1/me', () => {
	let request;

	describe('when everything is valid', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/me')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret')
				.send({
					id: 'extra-property-id',
					email: 'read@new-example.com',
					password: 'new-password',
					read: true,
					write: true,
					delete: true,
					admin: true
				});
		});

		it('updates the currently authenticated user in the database', async () => {
			await request.then();
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
			await request.then();
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
				assert.strictEqual(json.email, 'read@new-example.com');
			});
		});

	});

	describe('when everything is valid but a password is not set', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/me')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret')
				.send({
					email: 'read@new-example.com'
				});
		});

		it('updates the currently authenticated user in the database but does not change the password', async () => {
			await request.then();
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
			return request.expect(200);
		});

	});

	describe('when the request has no data set', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/me')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret')
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
				.patch('/api/v1/me')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret')
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

	describe('when the email property is not unique', () => {

		beforeEach(async () => {
			await database.seed(dashboard, 'basic');
			request = agent
				.patch('/api/v1/me')
				.set('X-Api-Key', 'mock-read-key')
				.set('X-Api-Secret', 'mock-read-secret')
				.send({
					email: 'admin@example.com'
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
			request = agent
				.patch('/api/v1/me')
				.send({
					email: 'read@new-example.com'
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
