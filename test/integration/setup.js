/* global dashboard */
'use strict';

const sidekick = require('../..');
const supertest = require('supertest');

before(() => {
	// Create a Sidekick application
	return sidekick({
		database: process.env.TEST_DATABASE || 'postgres://localhost:5432/pa11y_sidekick_test',
		environment: 'test',
		port: process.env.PORT || null
	})
	.then(dashboard => {
		global.agent = supertest.agent(dashboard.app);
		global.dashboard = dashboard;
	});
});

after(() => {
	dashboard.server.close();
	return dashboard.database.destroy();
});
