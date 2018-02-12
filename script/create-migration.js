#!/usr/bin/env node
'use strict';

const dotenv = require('dotenv');
const Dashboard = require('../lib/dashboard');

// Load configurations from an .env file if present
dotenv.config();

// Check for a migration name
const migrationName = process.argv[2];
if (!migrationName) {
	console.log('Usage: ./script/create-migration.js <name>');
	process.exit(1);
}

// Create a Sidekick instance
const dashboard = new Dashboard({
	databaseConnectionString: process.env.DATABASE_URL
});

// Create a migration
async function createMigration() {
	try {
		const result = await dashboard.database.knex.migrate.make(migrationName, {
			directory: `${__dirname}/../data/migration`,
			tableName: 'migrations'
		});
		console.log(`Created migration file: ${result}`);
		process.exit(0);
	} catch (error) {
		console.error(error.stack);
		process.exit(1);
	}
}

createMigration();
