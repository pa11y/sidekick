/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const loadSeedData = require('../../helper/load-seed-data');

describe('PATCH /api/v1/sites/:siteId', () => {
	let request;
	let siteId;
	let testEdits;

	beforeEach(() => {
		siteId = 'testsite-1';
		testEdits = {
			name: 'Edited'
		};
		return loadSeedData(dashboard, 'base');
	});

	describe('when everything is valid', () => {

		beforeEach(() => {
			request = agent
				.patch(`/api/v1/sites/${siteId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('responds with JSON', done => {
			request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
		});

		it('responds with a location header pointing to the updated site', done => {
			request.expect('Location', `/api/v1/sites/${siteId}`).end(done);
		});

		it('updates the site in the database', done => {
			request.end(() => {
				dashboard.database.select('*').from('sites').where({id: siteId})
					.then(sites => {
						assert.strictEqual(sites.length, 1);
						assert.strictEqual(sites[0].name, 'Edited');
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
				.patch(`/api/v1/sites/${siteId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('updates the site in the database', done => {
			request.end(() => {
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

	describe('when a site with the given ID does not exist', () => {

		beforeEach(() => {
			siteId = 'notasite';
			request = agent
				.patch(`/api/v1/sites/${siteId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the POST data is invalid', () => {

		beforeEach(() => {
			request = agent
				.patch(`/api/v1/sites/${siteId}`)
				.set('Content-Type', 'application/json')
				.send([]);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Site should be an object',
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the site name is invalid', () => {

		beforeEach(() => {
			testEdits.name = 123;
			request = agent
				.patch(`/api/v1/sites/${siteId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Site name should be a string',
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the site name is empty', () => {

		beforeEach(() => {
			testEdits.name = ' ';
			request = agent
				.patch(`/api/v1/sites/${siteId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Site name cannot be empty',
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the site data includes an ID', () => {

		beforeEach(() => {
			testEdits.id = '12345';
			request = agent
				.patch(`/api/v1/sites/${siteId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'Site ID cannot be set manually',
					status: 400
				}
			}).end(done);
		});

	});

	describe('when the default permissions do not allow write access and a write API key is specified', () => {

		beforeEach(() => {
			request = agent
				.patch(`/api/v1/sites/${siteId}`)
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
				.patch(`/api/v1/sites/${siteId}`)
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
