'use strict';

const bodyParser = require('body-parser');

module.exports = dashboard => {
	const app = dashboard.app;
	const model = dashboard.model;
	const parseFormBody = bodyParser.urlencoded({
		extended: false
	});
	const Settings = dashboard.model.Settings;
	const User = dashboard.model.User;

	// Setup page
	app.get('/', (request, response, next) => {

		// If the site has been set up, switch
		// to the next matching route – home
		if (dashboard.settings.get('data').setupComplete) {
			return next();
		}

		// Render the setup page
		response.render('setup', {
			formValues: {
				defaultAccessRead: true
			}
		});
	});

	// Setup page form post
	app.post('/', parseFormBody, (request, response, next) => {

		// If the site has been set up, switch
		// to the next matching route – home
		if (dashboard.settings.get('data').setupComplete) {
			return next();
		}

		// Create the admin user
		const adminUser = new User({
			email: request.body.adminEmail,
			password: request.body.adminPassword,
			allowRead: true,
			allowWrite: true,
			allowDelete: true,
			allowAdmin: true
		});
		adminUser.save()
			.then(() => {
				// Update all of the settings
				dashboard.settings = new Settings({
					data: {
						setupComplete: true,
						superAdminId: adminUser.get('id'),
						defaultPermissions: {
							allowRead: Boolean(request.body.defaultAccessRead),
							allowWrite: Boolean(request.body.defaultAccessWrite),
							allowDelete: Boolean(request.body.defaultAccessDelete),
							allowAdmin: Boolean(request.body.defaultAccessAdmin)
						}
					}
				});
				return dashboard.settings.save();
			})
			.then(() => {
				response.redirect('/');
			})
			.catch(error => {
				if (!error.isJoi) {
					return next(error);
				}
				response.status(400);
				response.render('setup', {
					error: error,
					formValues: request.body
				});
			});

	});

};
