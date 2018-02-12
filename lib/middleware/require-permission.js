'use strict';

const httpError = require('http-errors');

/**
 * Create a middleware function which requires a specific permission.
 * @param {String} level - The permission level to require. One of 'read', 'write', 'delete', 'admin'.
 * @returns {Function} A middleware function.
 */
function requirePermission(level) {
	return (request, response, next) => {
		if (!request.permissions || !request.permissions[level]) {
			return next(httpError(403, 'You are not authorised to perform this action'));
		}
		next();
	};
}

module.exports = requirePermission;
