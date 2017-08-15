'use strict';

const httpError = require('http-errors');

module.exports = loadUserFromApiKey;

// This middleware loads the current user and populates
// request and view variables
function loadUserFromApiKey(dashboard) {
	const User = dashboard.model.User;

	return (request, response, next) => {
		return Promise.resolve()
			.then(() => {
				if (!request.headers['x-api-key']) {
					return User.getDefault();
				}
				return User.where({
					apiKey: request.headers['x-api-key']
				}).fetch();
			})
			.then(user => {
				if (!user) {
					throw httpError(401, 'Invalid API credentials');
				} else if (!user.isDefaultUser) {
					user.isLoggedIn = true;
				}
				request.user = user;
				next();
			})
			.catch(next);
	};
}
