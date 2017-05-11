/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const loadSeedData = require('../../helper/load-seed-data');

describe('PATCH /api/v1/sites/:siteId/urls/:urlId', () => {
	let request;
	let siteId;
	let testEdits;
	let urlId;

	beforeEach(() => {
		siteId = 'testsite-1';
		urlId = 'testurl-1';
		testEdits = {
			name: 'Edited',
			address: 'http://www.example.com/edited'
		};
		return loadSeedData(dashboard, 'base');
	});

	describe('when everything is valid', () => {

		beforeEach(() => {
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('responds with JSON', done => {
			request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
		});

		it('responds with a location header pointing to the updated URL', done => {
			request.expect('Location', `/api/v1/sites/${siteId}/urls/${urlId}`).end(done);
		});

		it('updates the URL in the database', done => {
			request.end(() => {
				dashboard.database.select('*').from('urls').where({id: urlId})
					.then(urls => {
						assert.strictEqual(urls.length, 1);
						assert.strictEqual(urls[0].name, 'Edited');
						assert.strictEqual(urls[0].address, 'http://www.example.com/edited');
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
			testEdits.pa11yConfig = {
				foo: 'bar'
			};
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('updates the URL in the database', done => {
			request.end(() => {
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
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
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
			testEdits.name = 123;
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
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
			testEdits.name = ' ';
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
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
			testEdits.address = 123;
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
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
			testEdits.address = ' ';
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
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
			testEdits.id = '12345';
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
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

	describe('when the URL data includes a site ID', () => {

		beforeEach(() => {
			testEdits.site = '12345';
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('does not update the site property in the database', done => {
			request.end(() => {
				dashboard.database.select('*').from('urls').where({id: urlId})
					.then(urls => {
						assert.strictEqual(urls.length, 1);
						assert.notStrictEqual(urls[0].site, testEdits.site);
						done();
					})
					.catch(done);
			});
		});

	});

	describe('when a site with the given ID does not exist', () => {

		beforeEach(() => {
			siteId = 'notasite';
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when a url with the given ID does not exist', () => {

		beforeEach(() => {
			urlId = 'notaurl';
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the site ID and url ID are mismatched', () => {

		beforeEach(() => {
			urlId = 'testurl-4';
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the default permissions do not allow write access and a write API key is specified', () => {

		beforeEach(() => {
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.set('X-Api-Key', 'mock-readwrite-api-key')
				.send(testEdits);
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

	});

	describe('when the default permissions do not allow write access and no API key is specified', () => {

		beforeEach(() => {
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.set('X-Api-Key', 'mock-readonly-api-key')
				.send(testEdits);
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 403 status', done => {
			request.expect(403).end(done);
		});

	});

});
