'use strict';

const handleErrors = require('../middleware/handle-errors');
const notFound = require('../middleware/not-found');

module.exports = dashboard => {
	const app = dashboard.app;

	// Home page
	app.get('/', (request, response) => {
		response.render('index');
	});

	// API page (redirect to latest version)
	app.get('/api', (request, response) => {
		response.redirect('/api/v1');
	});

	// Error handling
	app.use(notFound);
	app.use(handleErrors.html(dashboard));

};
