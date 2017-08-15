'use strict';

module.exports = addResponseViewData;

// This middleware adds additional data to the response locals
function addResponseViewData(dashboard) {
	return (request, response, next) => {

		// Success flash messages
		if (request.session.success) {
			response.locals.success = request.session.success;
			delete request.session.success;
		}

		// Expose dashboard settings
		response.locals.settings = dashboard.settings.get('data');

		next();
	};
}
