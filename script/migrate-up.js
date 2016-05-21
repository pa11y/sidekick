#!/usr/bin/env node
'use strict';

const sidekick = require('..');
const config = require('../config.js');
config.start = false;

const usage = `
  Usage: ./script/migrate-up.js
`;

let dashboard;

sidekick(config)
	.then(getDashboard)
	.then(migrateUp)
	.then(logSuccess)
	.then(destroyDatabaseConnection)
	.catch(handleError);

function getDashboard(dash) {
	dashboard = dash;
}

function migrateUp() {
	return dashboard.migrations.latest();
}

function logSuccess() {
	console.log('Migrated to the latest schema');
}

function destroyDatabaseConnection() {
	return dashboard.database.destroy();
}

function handleError(error) {
	console.error('Error:', error.message);
	console.log(usage);
	process.exit(1);
}
