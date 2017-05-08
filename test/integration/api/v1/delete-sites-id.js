/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const loadSeedData = require('../../helper/load-seed-data');

describe('DELETE /api/v1/sites/:siteId', () => {
	let request;
	let siteId;

	beforeEach(() => {
		siteId = 'testsite-1';
		request = agent.delete(`/api/v1/sites/${siteId}`);
		return loadSeedData(dashboard, 'base');
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('removes the site, URLs, and results from the database', done => {
		request.end(() => {
			Promise.all([
				dashboard.database.select('*').from('sites').where({id: siteId}),
				dashboard.database.select('*').from('urls').where({site: siteId}),
				dashboard.database.select('*').from('results').where({site: siteId})
			])
			.then(results => {
				assert.strictEqual(results[0].length, 0);
				assert.strictEqual(results[1].length, 0);
				assert.strictEqual(results[2].length, 0);
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
				sites: 1,
				urls: 3,
				results: 4
			});
		}).end(done);
	});

	describe('when a site with the given ID does not exist', () => {

		beforeEach(() => {
			siteId = 'notasite';
			request = agent.delete(`/api/v1/sites/${siteId}`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

});
