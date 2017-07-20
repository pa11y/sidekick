/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const loadSeedData = require('../../helper/load-seed-data');

describe('GET /api/v1/sites/:siteId/results', () => {
	let request;
	let siteId;


	beforeEach(() => {
		siteId = 'testsite-1';
	});

	describe('when everything is valid', () => {

		beforeEach(() => {
			siteId = 'testsite-1';
			request = agent.get(`/api/v1/sites/${siteId}/results`);
			return loadSeedData(dashboard, 'base');
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('responds with JSON', done => {
			request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
		});

		it('responds with all of the results in the database for the given site as an array', done => {
			dashboard.database.knex.select('*').from('results').orderBy('createdAt', 'desc').where({
				site: siteId
			})
			.then(results => {
				const jsonifiedResults = JSON.parse(JSON.stringify(results))
					.map(dashboard.model.result.prepareForOutput);
				request.expect(response => {
					assert.isObject(response.body);
					assert.isArray(response.body.results);
					assert.greaterThan(response.body.results.length, 0);
					assert.deepEqual(response.body.results, jsonifiedResults);
				}).end(done);
			})
			.catch(done);
		});

	});

	describe('when the site has no results', () => {

		beforeEach(() => {
			request = agent.get(`/api/v1/sites/${siteId}/results`);
			return dashboard.database.knex('results').where({site: siteId}).delete();
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('responds with JSON', done => {
			request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
		});

		it('responds with an empty array', done => {
			request.expect(response => {
				assert.isObject(response.body);
				assert.isArray(response.body.results);
				assert.strictEqual(response.body.results.length, 0);
			}).end(done);
		});

	});

	describe('when a site with the given ID does not exist', () => {

		beforeEach(() => {
			siteId = 'notasite';
			request = agent.get(`/api/v1/sites/${siteId}/results`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the default permissions do not allow read access and a read API key is specified', () => {

		beforeEach(() => {
			request = agent.get(`/api/v1/sites/${siteId}/results`).set('X-Api-Key', 'mock-readonly-api-key');
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

	});

	describe('when the default permissions do not allow read access and no API key is specified', () => {

		beforeEach(() => {
			request = agent.get(`/api/v1/sites/${siteId}/results`);
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 403 status', done => {
			request.expect(403).end(done);
		});

	});

});
