'use strict';

const httpError = require('http-errors');

module.exports = dashboard => {
	const app = dashboard.app;
	const model = dashboard.model;

	// Current user profile page
	app.get('/profile', (request, response) => {

		// If no user is present, redirect to login
		if (!request.user.isLoggedIn) {
			return response.redirect('/login?referer=/profile');
		}

		// Render the profile page
		response.render('profile');
	});

	// Regenerate the current user's API key
	app.post('/profile/regenerate-api-key', (request, response, next) => {
		if (!request.user.isLoggedIn) {
			return httpError(401);
		}
		model.user.regenerateApiKey(request.user.id)
			.then(() => {
				response.redirect('/profile');
			})
			.catch(next);
	});

};
