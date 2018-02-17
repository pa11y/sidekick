'use strict';

const assert = require('proclaim');
const bcrypt = require('bcrypt');
const database = require('../../helpers/database');
let response;

describe('GET /api/v1/me/keys', () => {

	before(async () => {
		await database.seed(dashboard, 'basic');
	});

	describe('when everything is valid', () => {

		before(async () => {
			response = await request.get('/api/v1/me/keys', {
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

		it('responds with each key for the currently authenticated user', () => {
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

	describe('when no API credentials are provided', () => {

		before(async () => {
			response = await request.get('/api/v1/me/keys');
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

describe('POST /api/v1/me/keys', () => {

	describe('when everything is valid', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/me/keys', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
				},
				body: JSON.stringify({
					id: 'extra-property-id',
					user_id: 'mock-admin-id',
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
			assert.strictEqual(key.user_id, 'mock-read-id', 'Key is associated with the authenticated user');
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
			response = await request.post('/api/v1/me/keys', {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'mock-read-key',
					'X-Api-Secret': 'mock-read-secret'
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
			assert.isString(response.body.message);
			assert.isArray(response.body.validation);
			assert.deepEqual(response.body.validation, [
				'"description" is required'
			]);
			assert.strictEqual(response.body.status, 400);
		});

	});

	describe('when no API credentials are provided', () => {

		before(async () => {
			await database.seed(dashboard, 'basic');
			response = await request.post('/api/v1/me/keys', {
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					description: 'mock-description'
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
