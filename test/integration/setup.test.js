'use strict';

const Dashboard = require('../..');
const supertest = require('supertest');

before(async () => {
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
	global.agent = supertest.agent(dashboard.app);
});

after(() => {
	if (dashboard) {
		dashboard.server.close();
		dashboard.database.knex.destroy();
	}
});
