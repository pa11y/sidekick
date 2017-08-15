'use strict';

const bodyParser = require('body-parser');
const httpError = require('http-errors');
const ValidationError = require('../../lib/validation-error');

module.exports = dashboard => {
	const app = dashboard.app;
	const model = dashboard.model;
	const parseFormBody = bodyParser.urlencoded({
		extended: false
	});

	// Current user profile page
	app.get('/profile', (request, response) => {

		// If no user is present, redirect to login
		if (!request.user.isLoggedIn) {
			return response.redirect('/login?referer=/profile');
		}

		// Render the profile page
		response.render('profile', {
			formValues: {
				email: request.user.email
			}
		});
	});

	// Current user profile page form post
	app.post('/profile', parseFormBody, (request, response, next) => {
		if (!request.user.isLoggedIn) {
			return next(httpError(401));
		}
		const changes = {
			email: request.body.email
		};
		if (request.body.password) {
			changes.password = request.body.password;
		}
		return request.user.set(changes).save()
			.then(() => {
				request.session.success = 'Your details have been updated.';
				response.redirect('/profile');
			})
			.catch(error => {
				if (!error.isJoi) {
					return next(error);
				}
				response.status(400);
				response.render('profile', {
					error: error,
					formValues: request.body
				});
			});
	});

	// Regenerate the current user's API key
	app.post('/profile/regenerate-api-key', (request, response, next) => {
		if (!request.user.isLoggedIn) {
			return next(httpError(401));
		}
		request.user.regenerateApiKey().save()
			.then(() => {
				response.redirect('/profile');
			})
			.catch(next);
	});

};
