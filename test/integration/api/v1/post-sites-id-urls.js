/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const loadSeedData = require('../../helper/load-seed-data');

describe('POST /api/v1/sites/:siteId/urls', () => {
	let request;
	let siteId;
	let testUrl;

	beforeEach(() => {
		siteId = 'testsite-1';
		testUrl = {
			name: 'Test URL',
			address: 'http://www.example.com/'
		};
		return loadSeedData(dashboard, 'base');
	});

	describe('when everything is valid', () => {

		beforeEach(() => {
			request = agent
				.post(`/api/v1/sites/${siteId}/urls`)
				.set('Content-Type', 'application/json')
				.send(testUrl);
		});

		it('responds with a 201 status', done => {
			request.expect(201).end(done);
		});

		it('responds with JSON', done => {
			request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
		});

		it('responds with a location header pointing to the new URL', done => {
			request.expect('Location', /^\/api\/v1\/sites\/[a-zA-Z0-9_-]+\/urls\/[a-zA-Z0-9_-]+$/).end(done);
		});

		it('creates a URL in the database', done => {
			let response;
			request.expect(requestResponse => {
				response = requestResponse;
			}).end(() => {
				const urlId = response.headers.location.match(/\/([a-zA-Z0-9_-]+)$/)[1];
				dashboard.database.select('*').from('urls').where({id: urlId})
					.then(urls => {
						assert.strictEqual(urls.length, 1);
						assert.strictEqual(urls[0].site, siteId);
						assert.strictEqual(urls[0].name, 'Test URL');
						assert.strictEqual(urls[0].address, 'http://www.example.com/');
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
			testUrl.pa11yConfig = {
				foo: 'bar'
			};
			request = agent
				.post(`/api/v1/sites/${siteId}/urls`)
				.set('Content-Type', 'application/json')
				.send(testUrl);
		});

		it('responds with a 201 status', done => {
			request.expect(201).end(done);
		});

		it('creates a URL in the database', done => {
			let response;
			request.expect(requestResponse => {
				response = requestResponse;
			}).end(() => {
				const urlId = response.headers.location.match(/\/([a-zA-Z0-9_-]+)$/)[1];
				dashboard.database.select('*').from('urls').where({id: urlId})
					.then(urls => {
						assert.strictEqual(urls.length, 1);
						assert.deepEqual(urls[0].pa11yConfig, {
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
				.post(`/api/v1/sites/${siteId}/urls`)
				.set('Content-Type', 'application/json')
				.send([]);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Invalid URL data',
					validationMessages: [
						'URL should be an object'
					],
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the URL name is invalid', () => {

		beforeEach(() => {
			testUrl.name = 123;
			request = agent
				.post(`/api/v1/sites/${siteId}/urls`)
				.set('Content-Type', 'application/json')
				.send(testUrl);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Invalid URL data',
					validationMessages: [
						'URL name should be a string'
					],
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the URL name is empty', () => {

		beforeEach(() => {
			testUrl.name = ' ';
			request = agent
				.post(`/api/v1/sites/${siteId}/urls`)
				.set('Content-Type', 'application/json')
				.send(testUrl);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Invalid URL data',
					validationMessages: [
						'URL name cannot be empty'
					],
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the URL address is invalid', () => {

		beforeEach(() => {
			testUrl.address = 123;
			request = agent
				.post(`/api/v1/sites/${siteId}/urls`)
				.set('Content-Type', 'application/json')
				.send(testUrl);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Invalid URL data',
					validationMessages: [
						'URL address should be a string'
					],
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the URL address is empty', () => {

		beforeEach(() => {
			testUrl.address = ' ';
			request = agent
				.post(`/api/v1/sites/${siteId}/urls`)
				.set('Content-Type', 'application/json')
				.send(testUrl);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Invalid URL data',
					validationMessages: [
						'URL address cannot be empty'
					],
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the URL data includes an ID', () => {

		beforeEach(() => {
			testUrl.id = '12345';
			request = agent
				.post(`/api/v1/sites/${siteId}/urls`)
				.set('Content-Type', 'application/json')
				.send(testUrl);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Invalid URL data',
					validationMessages: [
						'URL ID cannot be set manually'
					],
					status: 400
				}
			}).end(done);
		});

	});

	describe('when a site with the given ID does not exist', () => {

		beforeEach(() => {
			siteId = 'notasite';
			request = agent
				.post(`/api/v1/sites/${siteId}/urls`)
				.set('Content-Type', 'application/json')
				.send(testUrl);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the default permissions do not allow write access and a write API key is specified', () => {

		beforeEach(() => {
			request = agent
				.post(`/api/v1/sites/${siteId}/urls`)
				.set('Content-Type', 'application/json')
				.set('X-Api-Key', 'mock-readwrite-api-key')
				.send(testUrl);
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 201 status', done => {
			request.expect(201).end(done);
		});

	});

	describe('when the default permissions do not allow write access and no API key is specified', () => {

		beforeEach(() => {
			request = agent
				.post(`/api/v1/sites/${siteId}/urls`)
				.set('Content-Type', 'application/json')
				.set('X-Api-Key', 'mock-readonly-api-key')
				.send(testUrl);
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 403 status', done => {
			request.expect(403).end(done);
		});

	});

});
