'use strict';

const bodyParser = require('body-parser');
const handleErrors = require('../middleware/handle-errors');
const httpError = require('http-errors');
const notFound = require('../middleware/not-found');
const requireUserAgent = require('../middleware/require-user-agent');

module.exports = dashboard => {
	const app = dashboard.app;
	const model = dashboard.model;
	const parseJsonBody = bodyParser.json();

	app.use('/api/v1', requireUserAgent);

	// API documentation
	app.get('/api/v1', (request, response) => {
		response.render('api-v1');
	});

	// Create a site
	app.post('/api/v1/sites', parseJsonBody, (request, response, next) => {
		model.site.create(request.body)
			.then(siteId => {
				response.set('Location', `/api/v1/sites/${siteId}`);
				response.status(201);
				response.send(response.locals);
			})
			.catch(error => {
				if (error.isValidationError) {
					error.status = 400;
				}
				next(error);
			});
	});

	// Get all sites
	app.get('/api/v1/sites', (request, response, next) => {
		model.site.getAll()
			.then(sites => {
				response.locals.sites = sites;
				response.send(response.locals);
			})
			.catch(next);
	});

	// Get a site by ID
	app.get('/api/v1/sites/:siteId', (request, response, next) => {
		model.site.getById(request.params.siteId)
			.then(site => {
				if (!site) {
					throw httpError(404);
				}
				response.locals.site = site;
				response.send(response.locals);
			})
			.catch(next);
	});

	// Edit a site by ID
	app.patch('/api/v1/sites/:siteId', parseJsonBody, (request, response, next) => {
		model.site.getById(request.params.siteId)
			.then(site => {
				if (!site) {
					throw httpError(404);
				}
				return model.site.edit(site.id, request.body);
			})
			.then(() => {
				response.set('Location', `/api/v1/sites/${request.params.siteId}`);
				response.send(response.locals);
			})
			.catch(error => {
				if (error.isValidationError) {
					error.status = 400;
				}
				next(error);
			});
	});

	// Delete a site by ID
	app.delete('/api/v1/sites/:siteId', (request, response, next) => {
		model.site.getById(request.params.siteId)
			.then(site => {
				if (!site) {
					throw httpError(404);
				}
				return model.site.delete(site.id);
			})
			.then(deleted => {
				response.locals.deleted = deleted;
				response.send(response.locals);
			})
			.catch(next);
	});

	// Create a URL
	app.post('/api/v1/sites/:siteId/urls', parseJsonBody, (request, response, next) => {
		model.site.getById(request.params.siteId)
			.then(site => {
				if (!site) {
					throw httpError(404);
				}
				request.body.site = site.id;
				return model.url.create(request.body);
			})
			.then(urlId => {
				response.set('Location', `/api/v1/sites/${request.params.siteId}/urls/${urlId}`);
				response.status(201);
				response.send(response.locals);
			})
			.catch(error => {
				if (error.isValidationError) {
					error.status = 400;
				}
				next(error);
			});
	});

	// Get a site's URLs
	app.get('/api/v1/sites/:siteId/urls', (request, response, next) => {
		model.site.getById(request.params.siteId)
			.then(site => {
				if (!site) {
					throw httpError(404);
				}
				return model.url.getAllBySite(site.id);
			})
			.then(urls => {
				response.locals.urls = urls;
				response.send(response.locals);
			})
			.catch(next);
	});

	// Get a site's results
	app.get('/api/v1/sites/:siteId/results', (request, response, next) => {
		model.site.getById(request.params.siteId)
			.then(site => {
				if (!site) {
					throw httpError(404);
				}
				return model.result.getAllBySite(site.id);
			})
			.then(results => {
				response.locals.results = results;
				response.send(response.locals);
			})
			.catch(next);
	});

	// Get a URL by ID
	app.get('/api/v1/sites/:siteId/urls/:urlId', (request, response, next) => {
		model.url.getByIdAndSite(request.params.urlId, request.params.siteId)
			.then(url => {
				if (!url) {
					throw httpError(404);
				}
				response.locals.url = url;
				response.send(response.locals);
			})
			.catch(next);
	});

	// Edit a URL by ID
	app.patch('/api/v1/sites/:siteId/urls/:urlId', parseJsonBody, (request, response, next) => {
		model.url.getByIdAndSite(request.params.urlId, request.params.siteId)
			.then(url => {
				if (!url) {
					throw httpError(404);
				}
				return model.url.edit(url.id, request.body);
			})
			.then(() => {
				response.set('Location', `/api/v1/sites/${request.params.siteId}/urls/${request.params.urlId}`);
				response.send(response.locals);
			})
			.catch(error => {
				if (error.isValidationError) {
					error.status = 400;
				}
				next(error);
			});
	});

	// Delete a URL by ID
	app.delete('/api/v1/sites/:siteId/urls/:urlId', (request, response, next) => {
		model.url.getByIdAndSite(request.params.urlId, request.params.siteId)
			.then(url => {
				if (!url) {
					throw httpError(404);
				}
				return model.url.delete(url.id);
			})
			.then(deleted => {
				response.locals.deleted = deleted;
				response.send(response.locals);
			})
			.catch(next);
	});

	// Get a URL's results
	app.get('/api/v1/sites/:siteId/urls/:urlId/results', (request, response, next) => {
		model.url.getByIdAndSite(request.params.urlId, request.params.siteId)
			.then(url => {
				if (!url) {
					throw httpError(404);
				}
				return model.result.getAllByUrl(request.params.urlId);
			})
			.then(results => {
				response.locals.results = results;
				response.send(response.locals);
			})
			.catch(next);
	});

	// Get a result by ID
	app.get('/api/v1/sites/:siteId/urls/:urlId/results/:resultId', (request, response, next) => {
		model.result.getByIdAndUrlAndSite(request.params.resultId, request.params.urlId, request.params.siteId)
			.then(result => {
				if (!result) {
					throw httpError(404);
				}
				response.locals.result = result;
				response.send(response.locals);
			})
			.catch(next);
	});

	// Delete a result by ID
	app.delete('/api/v1/sites/:siteId/urls/:urlId/results/:resultId', (request, response, next) => {
		model.result.getByIdAndUrlAndSite(request.params.resultId, request.params.urlId, request.params.siteId)
			.then(result => {
				if (!result) {
					throw httpError(404);
				}
				return model.result.delete(result.id);
			})
			.then(deleted => {
				response.locals.deleted = deleted;
				response.send(response.locals);
			})
			.catch(next);
	});

	// API 404 handler
	app.use('/api/v1', notFound);

	// API error handler
	app.use('/api/v1', handleErrors.json(dashboard));

};
