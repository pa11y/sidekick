/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const loadSeedData = require('../../helper/load-seed-data');

describe('GET /api/v1/sites/:siteId/urls/:urlId/results/:resultId', () => {
	let request;
	let siteId;
	let urlId;
	let resultId;

	beforeEach(() => {
		siteId = 'testsite-1';
		urlId = 'testurl-1';
		resultId = 'testresult-1';
	});

	describe('when everything is valid', () => {

		beforeEach(() => {
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`);
			return loadSeedData(dashboard, 'base');
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('responds with JSON', done => {
			request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
		});

		it('responds with the result as an object', done => {
			dashboard.database.knex.select('*').from('results').where({id: resultId})
				.then(results => {
					const jsonifiedResult = dashboard.model.result
						.prepareForOutput(JSON.parse(JSON.stringify(results[0])));
					request.expect(response => {
						assert.isObject(response.body);
						assert.isObject(response.body.result);
						assert.deepEqual(response.body.result, jsonifiedResult);
					}).end(done);
				})
				.catch(done);
		});

	});

	describe('when a site with the given ID does not exist', () => {

		beforeEach(() => {
			siteId = 'notasite';
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when a url with the given ID does not exist', () => {

		beforeEach(() => {
			urlId = 'notaurl';
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when a result with the given ID does not exist', () => {

		beforeEach(() => {
			resultId = 'notaresult';
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the site ID, url ID, and result ID are mismatched', () => {

		beforeEach(() => {
			urlId = 'testurl-4';
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the default permissions do not allow read access and a read API key is specified', () => {

		beforeEach(() => {
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`).set('X-Api-Key', 'mock-readonly-api-key');
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

	});

	describe('when the default permissions do not allow read access and no API key is specified', () => {

		beforeEach(() => {
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`);
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 403 status', done => {
			request.expect(403).end(done);
		});

	});

});
