'use strict';

/**
 * Initialise the home controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @param {Object} router - The front end Express router.
 * @returns {undefined} Nothing
 */
function initHomeController(dashboard, router) {

	// Home page
	router.get('/', (request, response) => {
		if (request.permissions.read) {
			response.render('template/home');
		} else {
			response.redirect('/login');
		}
	});

}

module.exports = initHomeController;
