#!/usr/bin/env node
'use strict';

const dotenv = require('dotenv');
const Dashboard = require('../lib/dashboard');

// Load configurations from an .env file if present
dotenv.config();

// Create a Sidekick instance
const dashboard = new Dashboard({
	databaseConnectionString: process.env.DATABASE_URL
});

// Migrate up
async function migrateUp() {
	try {
		await dashboard.database.knex.migrate.latest({
			directory: `${__dirname}/../data/migration`,
			tableName: 'migrations'
		});
		console.log('Migrated to latest database schema');
		process.exit(0);
	} catch (error) {
		console.error(error.stack);
		process.exit(1);
	}
}

migrateUp();
