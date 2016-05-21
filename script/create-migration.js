#!/usr/bin/env node
'use strict';

const sidekick = require('..');
const config = require('../config.js');
config.start = false;

const usage = `
  Usage: ./script/create-migration.js <name>
`;

let dashboard;

sidekick(config)
	.then(getDashboard)
	.then(getMigrationName)
	.then(createMigration)
	.then(logMigrationCreation)
	.then(destroyDatabaseConnection)
	.catch(handleError);

function getDashboard(dash) {
	dashboard = dash;
}

function getMigrationName() {
	const migrationName = process.argv[2];
	if (!migrationName) {
		throw new Error('Migration name was not specified');
	}
	return migrationName;
}

function createMigration(migrationName) {
	return dashboard.migrations.create(migrationName);
}

function logMigrationCreation(migrationPath) {
	console.log(`Migration created: ${migrationPath}`);
}

function destroyDatabaseConnection() {
	return dashboard.database.destroy();
}

function handleError(error) {
	console.error('Error:', error.message);
	console.log(usage);
	process.exit(1);
}
