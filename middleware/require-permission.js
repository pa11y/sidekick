'use strict';

const httpError = require('http-errors');

module.exports = requirePermission;

// This middleware is used to require a certain
// permission before executing middleware further
// down the chain. E.g. requiring write permission
// before processing a form
function requirePermission(permission) {
	return (request, response, next) => {
		const dashboard = request.app.dashboard;
		if (dashboard.model.user.hasPermission(request.user, permission)) {
			return next();
		}
		next(httpError(403, 'You do not have permission to do this'));
	};
}
