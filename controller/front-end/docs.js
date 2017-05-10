'use strict';

const requirePermission = require('../../middleware/require-permission');

module.exports = dashboard => {
	const app = dashboard.app;

	// V1 API documentation
	app.get('/docs/api/v1', requirePermission('read'), (request, response) => {
		response.render('api-v1');
	});

};
