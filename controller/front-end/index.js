'use strict';

module.exports = dashboard => {
	const app = dashboard.app;
	const model = dashboard.model;

	// Home page
	app.get('/', (request, response, next) => {

		// If the site hasn't been set up, switch
		// to the next matching route – setup
		if (!dashboard.settings.setupComplete) {
			return next();
		}

		// Render the home page
		model.site.getAll()
			.then(sites => {
				response.locals.sites = sites;
				response.render('index');
			})
			.catch(next);
	});

};
