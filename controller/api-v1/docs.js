'use strict';

/**
 * Initialise the documentation controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @param {Object} router - The API Express router.
 * @returns {undefined} Nothing
 */
function initDocsController(dashboard, router) {

	// The base path of the API redirects to the documentation
	router.get('/', (request, response) => {
		response.redirect('/docs/api/v1');
	});

}

module.exports = initDocsController;
