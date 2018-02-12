'use strict';

const requirePermission = require('../../lib/middleware/require-permission');

/**
 * Initialise the documentation controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @param {Object} router - The API Express router.
 * @returns {undefined} Nothing
 */
function initDocsController(dashboard, router) {

	// API documentation routes
	router.get('/docs/api/v1', requirePermission('read'), (request, response) => {
		response.render('template/docs/api-v1');
	});
	router.get('/docs/api/v1/users', requirePermission('read'), (request, response) => {
		response.render('template/docs/api-v1-users');
	});

}

module.exports = initDocsController;
