'use strict';

const httpError = require('http-errors');

/**
 * Create a middleware function which calls `next` with a 404 error.
 * @returns {Function} A middleware function.
 */
function notFound() {
	return (request, response, next) => {
		next(httpError(404));
	};
}

module.exports = notFound;
