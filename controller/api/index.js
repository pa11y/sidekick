'use strict';

module.exports = dashboard => {
	const app = dashboard.app;

	// API page (redirect to latest version documentation)
	app.get('/api', (request, response) => {
		response.redirect('/docs/api/v1');
	});

};
