'use strict';

module.exports = dashboard => {
	const app = dashboard.app;

	// API page (redirect to latest version)
	app.get('/api', (request, response) => {
		response.redirect('/api/v1');
	});

};
