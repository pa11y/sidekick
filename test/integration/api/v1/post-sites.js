/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const loadSeedData = require('../../helper/load-seed-data');

describe('POST /api/v1/sites', () => {
	let request;
	let testSite;

	beforeEach(() => {
		testSite = {
			name: 'Test Site'
		};
		return loadSeedData(dashboard, 'base');
	});

	describe('when everything is valid', () => {

		beforeEach(() => {
			request = agent
				.post('/api/v1/sites')
				.set('Content-Type', 'application/json')
				.send(testSite);
		});

		it('responds with a 201 status', done => {
			request.expect(201).end(done);
		});

		it('responds with JSON', done => {
			request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
		});

		it('responds with a location header pointing to the new site', done => {
			request.expect('Location', /^\/api\/v1\/sites\/[a-zA-Z0-9_-]+$/).end(done);
		});

		it('creates a site in the database', done => {
			let response;
			request.expect(requestResponse => {
				response = requestResponse;
			}).end(() => {
				const siteId = response.headers.location.match(/\/([a-zA-Z0-9_-]+)$/)[1];
				dashboard.database.select('*').from('sites').where({id: siteId})
					.then(sites => {
						assert.strictEqual(sites.length, 1);
						assert.strictEqual(sites[0].name, 'Test Site');
						done();
					})
					.catch(done);
			});
		});

		it('responds with an empty object', done => {
			request.expect(response => {
				assert.isObject(response.body);
				assert.deepEqual(response.body, {});
			}).end(done);
		});

	});

	describe('when the POST data includes Pa11y config', () => {

		beforeEach(() => {
			testSite.pa11yConfig = {
				foo: 'bar'
			};
			request = agent
				.post('/api/v1/sites')
				.set('Content-Type', 'application/json')
				.send(testSite);
		});

		it('responds with a 201 status', done => {
			request.expect(201).end(done);
		});

		it('creates a site in the database', done => {
			let response;
			request.expect(requestResponse => {
				response = requestResponse;
			}).end(() => {
				const siteId = response.headers.location.match(/\/([a-zA-Z0-9_-]+)$/)[1];
				dashboard.database.select('*').from('sites').where({id: siteId})
					.then(sites => {
						assert.strictEqual(sites.length, 1);
						assert.deepEqual(sites[0].pa11yConfig, {
							foo: 'bar'
						});
						done();
					})
					.catch(done);
			});
		});

	});

	describe('when the POST data is invalid', () => {

		beforeEach(() => {
			request = agent
				.post('/api/v1/sites')
				.set('Content-Type', 'application/json')
				.send([]);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Invalid site data',
					validationMessages: [
						'Site should be an object'
					],
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the site name is invalid', () => {

		beforeEach(() => {
			testSite.name = 123;
			request = agent
				.post('/api/v1/sites')
				.set('Content-Type', 'application/json')
				.send(testSite);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Invalid site data',
					validationMessages: [
						'Site name should be a string'
					],
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the site name is empty', () => {

		beforeEach(() => {
			testSite.name = ' ';
			request = agent
				.post('/api/v1/sites')
				.set('Content-Type', 'application/json')
				.send(testSite);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Invalid site data',
					validationMessages: [
						'Site name cannot be empty'
					],
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the site data includes an ID', () => {

		beforeEach(() => {
			testSite.id = '12345';
			request = agent
				.post('/api/v1/sites')
				.set('Content-Type', 'application/json')
				.send(testSite);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Invalid site data',
					validationMessages: [
						'Site ID cannot be set manually'
					],
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the default permissions do not allow write access and a write API key is specified', () => {

		beforeEach(() => {
			request = agent
				.post('/api/v1/sites')
				.set('Content-Type', 'application/json')
				.set('X-Api-Key', 'mock-readwrite-api-key')
				.send(testSite);
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 201 status', done => {
			request.expect(201).end(done);
		});

	});

	describe('when the default permissions do not allow write access and no API key is specified', () => {

		beforeEach(() => {
			request = agent
				.post('/api/v1/sites')
				.set('Content-Type', 'application/json')
				.set('X-Api-Key', 'mock-readonly-api-key')
				.send(testSite);
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 403 status', done => {
			request.expect(403).end(done);
		});

	});

});
