'use strict';

const httpError = require('http-errors');

/**
 * Create a middleware function which authenticates a user with a session cookie.
 * @returns {Function} A middleware function.
 */
function authWithCookie() {
	return async (request, response, next) => {
		const dashboard = request.app.dashboard;

		if (request.session && request.session.userId) {
			try {

				// Load the user that matches the session user ID
				const user = await dashboard.model.User.fetchOneById(request.session.userId);
				if (!user) {
					delete request.session;
					throw httpError(401, 'Invalid credentials');
				}

				request.authUser = user.serialize();
				request.permissions = request.authUser.permissions;

			} catch (error) {
				return next(error);
			}
		}

		// Fetch the default permissions if none are set
		if (!request.permissions) {
			try {
				request.permissions = {
					read: await dashboard.model.Setting.get('publicReadAccess')
				};
			} catch (error) {}
		}
		request.permissions = request.permissions || {};

		next();
	};
}

module.exports = authWithCookie;
