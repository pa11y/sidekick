/* global dashboard */
'use strict';

const sidekick = require('../..');
const supertest = require('supertest');

const defaultTestDatabase = 'postgres://localhost:5432/pa11y_sidekick_test';

before(() => {
	return sidekick({
		database: process.env.TEST_DATABASE || defaultTestDatabase,
		environment: 'test',
		port: process.env.PORT || null
	})
	.then(dashboard => {
		global.agent = supertest.agent(dashboard.app);
		global.dashboard = dashboard;
	})
	.then(() => {
		return deleteAllTables(dashboard.database);
	})
	.then(() => {
		return dashboard.migrations.latest();
	})
	.then(() => {
		return dashboard.migrations.seed();
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
