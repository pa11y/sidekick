#!/usr/bin/env node
'use strict';

const sidekick = require('..');
const config = require('../config.js');
config.start = false;

const usage = `
  Usage: ./script/migrate-down.js
`;

let dashboard;

sidekick(config)
	.then(getDashboard)
	.then(migrateDown)
	.then(logSuccess)
	.then(destroyDatabaseConnection)
	.catch(handleError);

function getDashboard(dash) {
	dashboard = dash;
}

function migrateDown() {
	return dashboard.migrations.rollback();
}

function logSuccess() {
	console.log('Rolled back the latest migration');
}

function destroyDatabaseConnection() {
	return dashboard.database.knex.destroy();
}

function handleError(error) {
	console.error('Error:', error.message);
	console.log(usage);
	process.exit(1);
}
