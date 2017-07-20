#!/usr/bin/env node
'use strict';

const sidekick = require('..');
const config = require('../config.js');
config.start = false;

const usage = `
  Usage: ./script/seed.js
`;

let dashboard;

sidekick(config)
	.then(getDashboard)
	.then(seedDatabase)
	.then(logSuccess)
	.then(destroyDatabaseConnection)
	.catch(handleError);

function getDashboard(dash) {
	dashboard = dash;
}

function seedDatabase() {
	return dashboard.migrations.seed();
}

function logSuccess() {
	console.log('Seeded the database');
}

function destroyDatabaseConnection() {
	return dashboard.database.knex.destroy();
}

function handleError(error) {
	console.error('Error:', error.message);
	console.log(usage);
	process.exit(1);
}
