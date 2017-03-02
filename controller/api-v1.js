'use strict';

const allow = require('../middleware/allow');
const handleErrors = require('../middleware/handle-errors');
const httpError = require('http-errors');
const notFound = require('../middleware/not-found');
const requireUserAgent = require('../middleware/require-user-agent');

module.exports = dashboard => {
	const app = dashboard.app;
	const model = dashboard.model;

	app.use('/api/v1', requireUserAgent);

	// API documentation (example route)
	app.all('/api/v1', allow.get, (request, response) => {
		response.render('api-v1');
	});

	// Get all sites
	app.all('/api/v1/sites', allow.get, (request, response, next) => {
		model.site.getAll()
			.then(sites => {
				response.send({sites});
			})
			.catch(next);
	});

	// Get a site by ID
	app.all('/api/v1/sites/:siteId', allow.get, (request, response, next) => {
		const json = {};
		model.site.getById(request.params.siteId)
			.then(site => {
				if (!site) {
					throw httpError(404);
				}
				json.site = site;
				response.send(json);
			})
			.catch(next);
	});

	// Get a site's URLs
	app.all('/api/v1/sites/:siteId/urls', allow.get, (request, response, next) => {
		const json = {};
		model.site.getById(request.params.siteId)
			.then(site => {
				if (!site) {
					throw httpError(404);
				}
				return model.url.getAllBySite(site.id);
			})
			.then(urls => {
				json.urls = urls;
				response.send(json);
			})
			.catch(next);
	});

	// Get a site's results
	app.all('/api/v1/sites/:siteId/results', allow.get, (request, response, next) => {
		const json = {};
		model.site.getById(request.params.siteId)
			.then(site => {
				if (!site) {
					throw httpError(404);
				}
				return model.result.getAllBySite(site.id);
			})
			.then(results => {
				json.results = results;
				response.send(json);
			})
			.catch(next);
	});

	// Get a site/URL by ID
	app.all('/api/v1/sites/:siteId/urls/:urlId', allow.get, (request, response, next) => {
		const json = {};
		model.url.getByIdAndSite(request.params.urlId, request.params.siteId)
			.then(url => {
				if (!url) {
					throw httpError(404);
				}
				json.url = url;
				response.send(json);
			})
			.catch(next);
	});

	// Get a site/URL results
	app.all('/api/v1/sites/:siteId/urls/:urlId/results', allow.get, (request, response, next) => {
		const json = {};
		model.url.getByIdAndSite(request.params.urlId, request.params.siteId)
			.then(url => {
				if (!url) {
					throw httpError(404);
				}
				return model.result.getAllByUrl(request.params.urlId);
			})
			.then(results => {
				json.results = results;
				response.send(json);
			})
			.catch(next);
	});

	// Get a site/URL/result by ID
	app.all('/api/v1/sites/:siteId/urls/:urlId/results/:resultId', allow.get, (request, response, next) => {
		const json = {};
		model.result.getByIdAndUrlAndSite(request.params.resultId, request.params.urlId, request.params.siteId)
			.then(result => {
				if (!result) {
					throw httpError(404);
				}
				json.result = result;
				response.send(json);
			})
			.catch(next);
	});

	// API 404 handler
	app.use('/api/v1', notFound);

	// API error handler
	app.use('/api/v1', handleErrors.json(dashboard));

};
