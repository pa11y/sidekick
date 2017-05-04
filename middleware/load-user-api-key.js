'use strict';

const httpError = require('http-errors');

module.exports = loadUserFromApiKey;

// This middleware loads the current user and populates
// request and view variables
function loadUserFromApiKey(dashboard) {
	const model = dashboard.model;
	return (request, response, next) => {
		return Promise.resolve()
			.then(() => {
				if (!request.headers['x-api-key']) {
					const defaultPermissions = dashboard.settings.defaultPermissions;
					return {
						isLoggedIn: false,
						allowRead: (defaultPermissions ? defaultPermissions.allowRead : false),
						allowWrite: (defaultPermissions ? defaultPermissions.allowWrite : false),
						allowDelete: (defaultPermissions ? defaultPermissions.allowDelete : false),
						allowAdmin: (defaultPermissions ? defaultPermissions.allowAdmin : false)
					};
				}
				return model.user.getByApiKey(request.headers['x-api-key']);
			})
			.then(user => {
				if (!user) {
					throw httpError(401, 'Invalid API credentials');
				} else if (user.isLoggedIn !== false) {
					user.isLoggedIn = true;
				}
				request.user = user;
				next();
			})
			.catch(next);
	};
}
