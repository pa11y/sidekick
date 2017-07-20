/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const loadSeedData = require('../../helper/load-seed-data');

describe('DELETE /api/v1/sites/:siteId/urls/:urlId', () => {
	let request;
	let siteId;
	let urlId;

	beforeEach(() => {
		siteId = 'testsite-1';
		urlId = 'testurl-1';
		request = agent.delete(`/api/v1/sites/${siteId}/urls/${urlId}`);
		return loadSeedData(dashboard, 'base');
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('removes the URL and results from the database', done => {
		request.end(() => {
			Promise.all([
				dashboard.database.knex.select('*').from('urls').where({id: urlId}),
				dashboard.database.knex.select('*').from('results').where({url: urlId})
			])
			.then(results => {
				assert.strictEqual(results[0].length, 0);
				assert.strictEqual(results[1].length, 0);
				done();
			})
			.catch(done);
		});
	});

	it('responds with an object which outlines what was deleted', done => {
		request.expect(response => {
			assert.isObject(response.body);
			assert.isObject(response.body.deleted);
			assert.deepEqual(response.body.deleted, {
				urls: 1,
				results: 3
			});
		}).end(done);
	});

	describe('when a site with the given ID does not exist', () => {

		beforeEach(() => {
			siteId = 'notasite';
			request = agent.delete(`/api/v1/sites/${siteId}/urls/${urlId}`).send();
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when a url with the given ID does not exist', () => {

		beforeEach(() => {
			urlId = 'notaurl';
			request = agent.delete(`/api/v1/sites/${siteId}/urls/${urlId}`).send();
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the site ID and url ID are mismatched', () => {

		beforeEach(() => {
			urlId = 'testurl-4';
			request = agent.delete(`/api/v1/sites/${siteId}/urls/${urlId}`).send();
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the default permissions do not allow delete access and a delete API key is specified', () => {

		beforeEach(() => {
			request = agent
				.delete(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('X-Api-Key', 'mock-readwritedelete-api-key');
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 200 status', done => {
			request.expect(200).end(done);
		});

	});

	describe('when the default permissions do not allow delete access and no API key is specified', () => {

		beforeEach(() => {
			request = agent
				.delete(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('X-Api-Key', 'mock-readwrite-api-key');
			return loadSeedData(dashboard, 'permissions');
		});

		it('responds with a 403 status', done => {
			request.expect(403).end(done);
		});

	});

});
