'use strict';

const httpError = require('http-errors');

/**
 * Create a middleware function which requires an authenticated user.
 * @returns {Function} A middleware function.
 */
function requireAuth() {
	return (request, response, next) => {
		if (!request.authUser) {
			return next(httpError(401, 'You must authenticate to perform this action'));
		}
		next();
	};
}

module.exports = requireAuth;
