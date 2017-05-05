/* global agent, dashboard */
'use strict';

const assert = require('proclaim');
const loadSeedData = require('../../helper/load-seed-data');

describe('GET /api/v1/sites/:siteId', () => {
	let request;
	let siteId;

	beforeEach(() => {
		siteId = 'testsite-1';
		request = agent.get(`/api/v1/sites/${siteId}`);
		return loadSeedData(dashboard, 'base');
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('responds with the site as an object', done => {
		dashboard.database.select('sites.*')
			.leftJoin('urls', 'sites.id', 'urls.site')
			.count('urls.id as urlCount')
			.groupBy('sites.id')
			.from('sites')
			.where({'sites.id': siteId})
			.then(sites => {
				const jsonifiedSite = dashboard.model.site
					.prepareForOutput(JSON.parse(JSON.stringify(sites[0])));
				request.expect(response => {
					assert.isObject(response.body);
					assert.isObject(response.body.site);
					assert.deepEqual(response.body.site, jsonifiedSite);
				}).end(done);
			})
			.catch(done);
	});

	describe('when a site with the given ID does not exist', () => {

		beforeEach(() => {
			siteId = 'notasite';
			request = agent.get(`/api/v1/sites/${siteId}`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

});
