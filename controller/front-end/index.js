'use strict';

module.exports = dashboard => {
	const app = dashboard.app;
	const model = dashboard.model;

	// Home page
	app.get('/', (request, response, next) => {

		// If the site hasn't been set up, switch
		// to the next matching route – setup
		if (!dashboard.settings.get('data').setupComplete) {
			return next();
		}

		// Render the home page if the user has permission
		if (request.user.hasPermission('read')) {
			return model.site.getAll()
				.then(sites => {
					response.locals.sites = sites;
					response.render('index');
				})
				.catch(next);
		}

		// No read permissions, redirect to login
		response.redirect('/login');
	});

};
