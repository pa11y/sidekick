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

describe('POST /api/v1/sites', () => {
	let request;
	let testSite;

	beforeEach(() => {
		testSite = {
			name: 'Test Site'
		};
		request = agent
			.post('/api/v1/sites')
			.set('Content-Type', 'application/json')
			.send(testSite);
	});

	it('responds with a 201 status', done => {
		request.expect(201).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('responds with a location header pointing to the new site', done => {
		request.expect('Location', /^\/api\/v1\/sites\/[a-zA-Z0-9_-]+$/).end(done);
	});

	it('creates a site in the database', done => {
		let response;
		request.expect(res => response = res).end(() => {
			const siteId = response.headers.location.match(/\/([a-zA-Z0-9_-]+)$/)[1];
			dashboard.database.select('*').from('sites').where({id: siteId})
				.then(sites => {
					assert.strictEqual(sites.length, 1);
					assert.strictEqual(sites[0].name, 'Test Site');
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

	describe('when the POST data includes Pa11y config', () => {

		beforeEach(() => {
			testSite.pa11yConfig = {
				foo: 'bar'
			};
			request = agent
				.post('/api/v1/sites')
				.set('Content-Type', 'application/json')
				.send(testSite);
		});

		it('responds with a 201 status', done => {
			request.expect(201).end(done);
		});

		it('creates a site in the database', done => {
			let response;
			request.expect(res => response = res).end(() => {
				const siteId = response.headers.location.match(/\/([a-zA-Z0-9_-]+)$/)[1];
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

	describe('when the POST data is invalid', () => {

		beforeEach(() => {
			request = agent
				.post('/api/v1/sites')
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
			testSite.name = 123;
			request = agent
				.post('/api/v1/sites')
				.set('Content-Type', 'application/json')
				.send(testSite);
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
			testSite.name = ' ';
			request = agent
				.post('/api/v1/sites')
				.set('Content-Type', 'application/json')
				.send(testSite);
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
			testSite.id = '12345';
			request = agent
				.post('/api/v1/sites')
				.set('Content-Type', 'application/json')
				.send(testSite);
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
		dashboard.database.select('sites.*')
			.leftJoin('urls', 'sites.id', 'urls.site')
			.count('urls.id as urlCount')
			.groupBy('sites.id')
			.from('sites')
			.orderBy('sites.name')
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

describe('PATCH /api/v1/sites/:siteId', () => {
	let request;
	let siteId;
	let testEdits;

	beforeEach(() => {
		siteId = 's01p_site';
		testEdits = {
			name: 'Edited'
		};
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

});

describe('DELETE /api/v1/sites/:siteId', () => {
	let request;
	let siteId;

	beforeEach(() => {
		siteId = 's04d_site';
		return Promise.resolve()
			.then(() => dashboard.database('results').where('site', siteId).delete())
			.then(() => dashboard.database('urls').where('site', siteId).delete())
			.then(() => dashboard.database('sites').where('id', siteId).delete())
			.then(() => require('../../data/seed/delete-website').seed(dashboard.database, Promise))
			.then(() => {
				request = agent.delete(`/api/v1/sites/${siteId}`);
			});
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

describe('GET /api/v1/sites/:siteId/results', () => {
	let request;
	let siteId;

	beforeEach(() => {
		siteId = 's01p_site';
		request = agent.get(`/api/v1/sites/${siteId}/results`);
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('responds with all of the results in the database for the given site as an array', done => {
		dashboard.database.select('*').from('results').orderBy('createdAt', 'desc').where({
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

	describe('when the site has no results', () => {

		beforeEach(() => {
			siteId = 's03e_site';
			request = agent.get(`/api/v1/sites/${siteId}/results`);
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

});

describe('POST /api/v1/sites/:siteId/urls', () => {
	let request;
	let siteId;
	let testUrl;

	beforeEach(() => {
		siteId = 's01p_site';
		testUrl = {
			name: 'Test URL',
			address: 'http://www.example.com/'
		};
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
		request.expect(res => response = res).end(() => {
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
			request.expect(res => response = res).end(() => {
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
					message: 'URL should be an object',
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
					message: 'URL name should be a string',
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
					message: 'URL name cannot be empty',
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
					message: 'URL address should be a string',
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
					message: 'URL address cannot be empty',
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
					message: 'URL ID cannot be set manually',
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

describe('PATCH /api/v1/sites/:siteId/urls/:urlId', () => {
	let request;
	let siteId;
	let testEdits;
	let urlId;

	beforeEach(() => {
		siteId = 's01p_site';
		urlId = 's01p_u02c';
		testEdits = {
			name: 'Edited',
			address: 'http://www.example.com/edited'
		};
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
					message: 'URL should be an object',
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
					message: 'URL name should be a string',
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
					message: 'URL name cannot be empty',
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
					message: 'URL address should be a string',
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
					message: 'URL address cannot be empty',
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
					message: 'URL ID cannot be set manually',
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
			urlId = 's02g_u01h';
			request = agent
				.patch(`/api/v1/sites/${siteId}/urls/${urlId}`)
				.set('Content-Type', 'application/json')
				.send(testEdits);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

});

describe('DELETE /api/v1/sites/:siteId/urls/:urlId', () => {
	let request;
	let siteId;
	let urlId;

	beforeEach(() => {
		siteId = 's04d_site';
		urlId = 's04d_u03d';
		return Promise.resolve()
			.then(() => dashboard.database('results').where('site', siteId).delete())
			.then(() => dashboard.database('urls').where('site', siteId).delete())
			.then(() => dashboard.database('sites').where('id', siteId).delete())
			.then(() => require('../../data/seed/delete-website').seed(dashboard.database, Promise))
			.then(() => {
				request = agent.delete(`/api/v1/sites/${siteId}/urls/${urlId}`);
			});
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
				dashboard.database.select('*').from('urls').where({id: urlId}),
				dashboard.database.select('*').from('results').where({url: urlId})
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
				results: 2
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
			urlId = 's02g_u01h';
			request = agent.delete(`/api/v1/sites/${siteId}/urls/${urlId}`).send();
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

});

describe('GET /api/v1/sites/:siteId/urls/:urlId/results', () => {
	let request;
	let siteId;
	let urlId;

	beforeEach(() => {
		siteId = 's01p_site';
		urlId = 's01p_u01h';
		request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results`);
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('responds with all of the results in the database for the given site/url as an array', done => {
		dashboard.database.select('*').from('results').orderBy('createdAt', 'desc').where({
			url: urlId,
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

	describe('when the URL has no results', () => {

		beforeEach(() => {
			urlId = 's01p_u02c';
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results`);
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
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when a url with the given ID does not exist', () => {

		beforeEach(() => {
			urlId = 'notaurl';
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the site ID and url ID are mismatched', () => {

		beforeEach(() => {
			urlId = 's02g_u01h';
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

});

describe('GET /api/v1/sites/:siteId/urls/:urlId/results/:resultId', () => {
	let request;
	let siteId;
	let urlId;
	let resultId;

	beforeEach(() => {
		siteId = 's01p_site';
		urlId = 's01p_u01h';
		resultId = 's01p_u01h_r01';
		request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`);
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('responds with the result as an object', done => {
		dashboard.database.select('*').from('results').where({id: resultId})
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
			urlId = 's02g_u01h';
			request = agent.get(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`);
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

});

describe('DELETE /api/v1/sites/:siteId/urls/:urlId/results/:resultId', () => {
	let request;
	let siteId;
	let urlId;
	let resultId;

	beforeEach(() => {
		siteId = 's04d_site';
		urlId = 's04d_u03d';
		resultId = 's04d_u03d_r01';
		return Promise.resolve()
			.then(() => dashboard.database('results').where('site', siteId).delete())
			.then(() => dashboard.database('urls').where('site', siteId).delete())
			.then(() => dashboard.database('sites').where('id', siteId).delete())
			.then(() => require('../../data/seed/delete-website').seed(dashboard.database, Promise))
			.then(() => {
				request = agent.delete(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`);
			});
	});

	it('responds with a 200 status', done => {
		request.expect(200).end(done);
	});

	it('responds with JSON', done => {
		request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('removes the URL and results from the database', done => {
		request.end(() => {
			dashboard.database.select('*').from('results').where({id: resultId})
				.then(results => {
					assert.strictEqual(results.length, 0);
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
				results: 1
			});
		}).end(done);
	});

	describe('when a site with the given ID does not exist', () => {

		beforeEach(() => {
			siteId = 'notasite';
			request = agent.delete(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`).send();
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when a url with the given ID does not exist', () => {

		beforeEach(() => {
			urlId = 'notaurl';
			request = agent.delete(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`).send();
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when a result with the given ID does not exist', () => {

		beforeEach(() => {
			resultId = 'notaresult';
			request = agent.delete(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`).send();
		});

		it('responds with a 404 status', done => {
			request.expect(404).end(done);
		});

	});

	describe('when the site ID, url ID, and result ID are mismatched', () => {

		beforeEach(() => {
			urlId = 's02g_u01h';
			request = agent.delete(`/api/v1/sites/${siteId}/urls/${urlId}/results/${resultId}`).send();
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
