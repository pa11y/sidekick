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
		response.send({
			apiV1: true
		});
	});

	// All sites (example route)
	app.all('/api/v1/sites', allow.get, (request, response) => {
		dashboard.model.site.getAll().then(sites => {
			response.send(sites);
		});
	});

	// API 404 handler
	app.use('/api/v1', notFound);

	// API error handler
	app.use('/api/v1', handleErrors.json(dashboard));

};
