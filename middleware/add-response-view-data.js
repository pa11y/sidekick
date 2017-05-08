'use strict';

module.exports = addResponseViewData;

// This middleware adds additional data to the response locals
function addResponseViewData(dashboard) {
	return (request, response, next) => {
		response.locals.settings = dashboard.settings;
		next();
	};
}
