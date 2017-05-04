'use strict';

const httpError = require('http-errors');

module.exports = notFound;

// This middleware can be mounted after all of the
// other routes in order to pass on 404 errors to
// the main error handlers
function notFound() {
	return (request, response, next) => {
		next(httpError(404));
	};
}
