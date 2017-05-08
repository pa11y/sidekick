'use strict';

const reloadSettings = require('./reload-settings');

module.exports = loadSeedData;

// This helper function cleans and sets up a
// Sidekick database with specified seed data
function loadSeedData(dashboard, seedDirectory) {
	return deleteAllTables(dashboard.database)
		.then(() => {
			return dashboard.migrations.latest();
		})
		.then(() => {
			return dashboard.migrations.seed(`${__dirname}/../../../data/seed/test/${seedDirectory}`);
		})
		.then(() => {
			return reloadSettings(dashboard);
		});
}

// This helper function deletes all tables in the
// Sidekick database
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
