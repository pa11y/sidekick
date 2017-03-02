/* global agent, dashboard */
'use strict';

const assert = require('proclaim');

describe('GET /api/v1', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/api/v1');
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with HTML', done => {
		request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
	});

	describe('with no User-Agent header', () => {
		let request;

		beforeEach(() => {
			request = agent.get('/api/v1').set('User-Agent', '');
		});

		it('responds with a 400 status', done => {
			request.expect(400).end(done);
		});

		it('responds with HTML', done => {
			request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
		});

		it('responds with an error message', done => {
			request.expect({
				error: {
					message: 'User-Agent header is required',
					status: 400
				}
			}).end(done);
		});

	});

});

describe('GET /api/v1/sites', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/api/v1/sites');
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('responds with all of the sites in the database as an array', done => {
		dashboard.database.select('*').from('sites')
			.then(sites => {
				const jsonifiedSites = JSON.parse(JSON.stringify(sites))
					.map(dashboard.model.site.prepareForOutput);
				request.expect(response => {
					assert.isObject(response.body);
					assert.isArray(response.body.sites);
					assert.greaterThan(response.body.sites.length, 0);
					assert.deepEqual(response.body.sites, jsonifiedSites);
				}).end(done);
			})
			.catch(done);
	});

});

describe('GET /api/v1/sites/:siteId', () => {
	let request;
	let siteId;

	beforeEach(() => {
		siteId = 's01p_site';
		request = agent.get(`/api/v1/sites/${siteId}`);
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('responds with the site as an object', done => {
		dashboard.database.select('*').from('sites').where({id: siteId})
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

describe('GET /api/v1/sites/:siteId/urls', () => {
	let request;
	let siteId;

	beforeEach(() => {
		siteId = 's01p_site';
		request = agent.get(`/api/v1/sites/${siteId}/urls`);
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('responds with all of the urls in the database for the given site as an array', done => {
		dashboard.database.select('*').from('urls').where({site: siteId})
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

	describe('when the site has no URLs', () => {

		beforeEach(() => {
			siteId = 's03e_site';
			request = agent.get(`/api/v1/sites/${siteId}/urls`);
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

});

describe('GET /api/v1/sites/:siteId/urls/:urlId', () => {
	let request;
	let siteId;
	let urlId;

	beforeEach(() => {
		siteId = 's01p_site';
		urlId = 's01p_u02c';
		request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}`);
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('responds with the url as an object', done => {
		dashboard.database.select('*').from('urls').where({id: urlId})
			.then(urls => {
				const jsonifiedUrl = dashboard.model.url
					.prepareForOutput(JSON.parse(JSON.stringify(urls[0])));
				request.expect(response => {
					assert.isObject(response.body);
					assert.isObject(response.body.url);
					assert.deepEqual(response.body.url, jsonifiedUrl);
				}).end(done);
			})
			.catch(done);
	});

	describe('when a site with the given ID does not exist', () => {

		beforeEach(() => {
			siteId = 'notasite';
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when a url with the given ID does not exist', () => {

		beforeEach(() => {
			urlId = 'notaurl';
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the site ID and url ID are mismatched', () => {

		beforeEach(() => {
			urlId = 's02g_u01h';
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

});

describe('GET /api/v1/404', () => {
	let request;

	beforeEach(() => {
		request = agent.get('/api/v1/404');
	});

	it('responds with a 404 status', done => {
		request.expect(404).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('responds with an error message', done => {
		request.expect({
			error: {
				message: 'Not Found',
				status: 404
			}
		}).end(done);
	});

});
