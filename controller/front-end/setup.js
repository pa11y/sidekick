'use strict';

const express = require('express');
const validationError = require('../../lib/util/validation-error');

/**
 * Initialise the setup controller.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @param {Object} router - The front end Express router.
 * @returns {undefined} Nothing
 */
function initSetupController(dashboard, router) {
	const Setting = dashboard.model.Setting;
	const User = dashboard.model.User;

	// Setup page
	router.get('/', async (request, response, next) => {
		if (await Setting.get('setupComplete')) {
			return next();
		}
		response.render('template/setup');
	});

	// Setup action
	router.post('/', express.urlencoded({extended: false}), async (request, response, next) => {
		if (await Setting.get('setupComplete')) {
			return next();
		}
		try {

			// Check that the password and confirmation match
			if (request.body.adminPassword !== request.body.adminPasswordConfirm) {
				throw validationError('password and confirmed password do not match');
			}

			// Set up the admin user
			await User.create({
				email: request.body.adminEmail,
				password: request.body.adminPassword,
				is_owner: true,
				allow_read: true,
				allow_write: true,
				allow_delete: true,
				allow_admin: true
			});

			// Set all the settings
			await Setting.set('publicReadAccess', Boolean(request.body.publicReadAccess));
			await Setting.set('setupComplete', true);

			// All done
			request.flash.set('site-wide-alert', 'Sidekick has been successfully set up! You can now log in with the super admin details you entered');
			if (request.body.publicReadAccess) {
				return response.redirect('/');
			}
			return response.redirect('/login');

		} catch (error) {
			if (error.name === 'ValidationError') {
				return response.status(400).render('template/setup', {
					form: {
						setup: {
							adminEmail: request.body.adminEmail,
							publicReadAccess: request.body.publicReadAccess,
							errors: error.details.map(detail => detail.message)
						}
					}
				});
			}
			return next(error);
		}
	});

}

module.exports = initSetupController;
