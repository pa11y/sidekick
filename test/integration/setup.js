/* global dashboard */
'use strict';

const sidekick = require('../..');
const supertest = require('supertest');

const defaultTestDatabase = 'postgres://localhost:5432/pa11y_sidekick_test';

before(() => {
	let nonStarter;

	// First we have to create a non-starting app
	// so that we can run migrations
	return sidekick({
		database: process.env.TEST_DATABASE || defaultTestDatabase,
		start: false
	})
	.then(dashboard => {
		nonStarter = dashboard;
		return deleteAllTables(nonStarter.database);
	})
	.then(() => {
		return nonStarter.migrations.latest();
	})
	.then(() => {
		return nonStarter.migrations.seed();
	})
	.then(() => {
		// Now we create an app that actually runs
		return sidekick({
			database: process.env.TEST_DATABASE || defaultTestDatabase,
			environment: 'test',
			port: process.env.PORT || null
		});
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

function deleteAllTables(database) {
	return Promise.resolve()
		.then(() => {
			const query = `SELECT tablename FROM pg_tables WHERE schemaname='public'`;
			return database.raw(query);
		})
		.then(result => {
			return result.rows.map(row => `DROP TABLE ${row.tablename} CASCADE`).join(';');
		})
		.then(query => {
			return database.raw(query);
		});
}
