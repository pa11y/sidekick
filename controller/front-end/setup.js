'use strict';

const bodyParser = require('body-parser');

module.exports = dashboard => {
	const app = dashboard.app;
	const model = dashboard.model;
	const parseFormBody = bodyParser.urlencoded({
		extended: false
	});

	// Setup page
	app.get('/', (request, response, next) => {

		// If the site has been set up, switch
		// to the next matching route – home
		if (dashboard.settings.setupComplete) {
			return next();
		}

		// Render the setup page
		response.render('setup', {
			formValues: {
				'default-access-read': true
			}
		});
	});

	// Setup page form post
	app.post('/', parseFormBody, (request, response, next) => {

		// If the site has been set up, switch
		// to the next matching route – home
		if (dashboard.settings.setupComplete) {
			return next();
		}

		// Create the admin user
		const adminUser = {
			email: request.body['admin-email'],
			password: request.body['admin-password'],
			allowRead: true,
			allowWrite: true,
			allowDelete: true,
			allowAdmin: true
		};
		model.user.create(adminUser)
			.then(superAdminId => {
				// Update all of the settings
				dashboard.settings.superAdminId = superAdminId;
				dashboard.settings.defaultPermissions = {
					allowRead: Boolean(request.body['default-access-read']),
					allowWrite: Boolean(request.body['default-access-write']),
					allowDelete: Boolean(request.body['default-access-delete']),
					allowAdmin: Boolean(request.body['default-access-admin'])
				};

				// Mark setup as complete
				dashboard.settings.setupComplete = true;
			})
			.then(() => {
				// Save the settings
				return model.settings.edit(dashboard.settings);
			})
			.then(() => {
				response.redirect('/');
			})
			.catch(error => {
				if (!error.isValidationError) {
					return next(error);
				}
				response.render('setup', {
					error: error,
					formValues: request.body
				});
			});

	});

};
