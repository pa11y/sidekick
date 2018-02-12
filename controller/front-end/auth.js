'use strict';

const express = require('express');

/**
 * Initialise the authentication controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @param {Object} router - The front end Express router.
 * @returns {undefined} Nothing
 */
function initAuthController(dashboard, router) {
	const User = dashboard.model.User;

	// Display the login page
	router.get('/login', (request, response) => {
		response.render('template/login', {
			form: {
				login: {
					referer: request.query.referer || null
				}
			}
		});
	});

	// Perform the login action
	router.post('/login', express.urlencoded({extended: false}), async (request, response, next) => {
		try {

			// Attempt to log in
			const user = await User.fetchOneByEmail(request.body.email);
			if (user && await User.checkPassword(request.body.password, user.get('password'))) {
				request.session.userId = user.get('id');
				return response.redirect(request.body.referer || '/');
			}

			// Logging in failed, re-render the login page
			response.status(401).render('template/login', {
				form: {
					login: {
						email: request.body.email,
						errors: [
							'Email address is not registered, or password is incorrect'
						],
						referer: request.body.referer || null
					}
				}
			});

		} catch (error) {
			return next(error);
		}
	});

	// Perform the logout action
	router.post('/logout', (request, response) => {
		if (request.session) {
			delete request.session;
		}
		return response.redirect('/');
	});

}

module.exports = initAuthController;
