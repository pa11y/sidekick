'use strict';

const Dashboard = require('../..');
const {JSDOM} = require('jsdom');
const request = require('request-promise-native');

before(async () => {

	// Create a test dashboard and start it
	const dashboard = global.dashboard = new Dashboard({
		databaseConnectionString: process.env.TEST_DATABASE || 'postgres://localhost:5432/pa11y_sidekick_test',
		environment: 'test',
		log: {
			info: () => {},
			error: () => {}
		},
		port: process.env.TEST_PORT || 0,
		requestLogStream: {
			write: () => {}
		},
		sessionSecret: 'test'
	});
	await dashboard.start();

	// Set up a pre-configured request function
	global.request = request.defaults({
		baseUrl: dashboard.address,
		followRedirect: false,
		resolveWithFullResponse: true,
		simple: false,
		transform: (body, response) => {
			if (response.headers['content-type']) {
				if (response.headers['content-type'].includes('text/html')) {
					const dom = new JSDOM(response.body);
					response.body = dom.window;
				} else if (response.headers['content-type'].includes('application/json')) {
					response.body = JSON.parse(response.body);
				}
			}
			return response;
		}
	});

});

after(() => {
	if (dashboard) {
		dashboard.server.close();
		dashboard.database.knex.destroy();
	}
});
