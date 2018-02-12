'use strict';

const httpError = require('http-errors');

/**
 * Create a middleware function which authenticates a user with an API key and secret.
 * @returns {Function} A middleware function.
 */
function authWithKey() {
	return async (request, response, next) => {
		const dashboard = request.app.dashboard;

		// Get the API key and secret from headers
		const apiKey = request.headers['x-api-key'];
		const apiSecret = request.headers['x-api-secret'];

		if (apiKey && apiSecret) {
			try {

				// Get the key from the database and check whether the secret matches
				const key = await dashboard.model.Key.fetchOneById(apiKey);
				const secretMatches = await dashboard.model.Key.checkSecret(apiSecret, (key ? key.get('secret') : ''));

				if (!key || !secretMatches) {
					return next(httpError(401, 'Invalid credentials'));
				}

				// Load the user that matches the authenticated key
				request.authUser = (await dashboard.model.User.fetchOneById(key.get('user_id'))).serialize();
				request.authKey = key.serialize();
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

module.exports = authWithKey;
