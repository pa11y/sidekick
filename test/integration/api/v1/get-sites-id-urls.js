/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const loadSeedData = require('../../helper/load-seed-data');

describe('GET /api/v1/sites/:siteId/urls', () => {
	let request;
	let siteId;

	beforeEach(() => {
		siteId = 'testsite-1';
	});

	describe('when everything is valid', () => {

		beforeEach(() => {
			request = agent.get(`/api/v1/sites/${siteId}/urls`);
			return loadSeedData(dashboard, 'base');
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

		it('responds with JSON', done => {
			request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
		});

		it('responds with all of the urls in the database for the given site as an array', done => {
			dashboard.database.select('*').from('urls').where({site: siteId}).orderBy('name')
				.then(urls => {
					const jsonifiedUrls = JSON.parse(JSON.stringify(urls))
						.map(dashboard.model.url.prepareForOutput);
					request.expect(response => {
						assert.isObject(response.body);
						assert.isArray(response.body.urls);
						assert.greaterThan(response.body.urls.length, 0);
						assert.deepEqual(response.body.urls, jsonifiedUrls);
					}).end(done);
				})
				.catch(done);
		});

	});

	describe('when the site has no URLs', () => {

		beforeEach(() => {
			request = agent.get(`/api/v1/sites/${siteId}/urls`);
			return Promise.resolve()
				.then(() => dashboard.database('results').where({site: siteId}).delete())
				.then(() => dashboard.database('urls').where({site: siteId}).delete());
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
				assert.isArray(response.body.urls);
				assert.strictEqual(response.body.urls.length, 0);
			}).end(done);
		});

	});

	describe('when a site with the given ID does not exist', () => {

		beforeEach(() => {
			siteId = 'notasite';
			request = agent.get(`/api/v1/sites/${siteId}/urls`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the default permissions do not allow read access and a read API key is specified', () => {

		beforeEach(() => {
			request = agent.get(`/api/v1/sites/${siteId}/urls`).set('X-Api-Key', 'mock-readonly-api-key');
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

	});

	describe('when the default permissions do not allow read access and no API key is specified', () => {

		beforeEach(() => {
			request = agent.get(`/api/v1/sites/${siteId}/urls`);
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 403 status', done => {
			request.expect(403).end(done);
		});

	});

});
