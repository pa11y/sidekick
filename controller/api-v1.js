'use strict';

const allow = require('../middleware/allow');
const handleErrors = require('../middleware/handle-errors');
const notFound = require('../middleware/not-found');
const requireUserAgent = require('../middleware/require-user-agent');

module.exports = dashboard => {
	const app = dashboard.app;

	app.use('/api/v1', requireUserAgent);

	// API documentation (example route)
	app.all('/api/v1', allow.get, (request, response) => {
		response.render('api-v1');
	});

	// Get all sites
	app.all('/api/v1/sites', allow.get, (request, response) => {
		dashboard.model.site.getAll().then(sites => {
			response.send({sites});
		});
	});

	// Get a site by ID
	app.all('/api/v1/sites/:siteId', allow.get, (request, response, next) => {
		const json = {};
		dashboard.model.site.getById(request.params.siteId)
			.then(site => {
				if (!site) {
					return next();
				}
				json.site = site;
				return dashboard.model.url.getAllBySite(site.id);
			})
			.then(urls => {
				if (json.site) {
					json.urls = urls;
					response.send(json);
				}
			});
	});

	// API 404 handler
	app.use('/api/v1', notFound);

	// API error handler
	app.use('/api/v1', handleErrors.json(dashboard));

};
