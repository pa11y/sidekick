'use strict';

// Destroy the test database and migrate to the latest version
async function cleanDatabase(dashboard) {
	await destroyDatabase(dashboard);
	await dashboard.database.knex.migrate.latest({
		directory: `${__dirname}/../../../data/migration`,
		tableName: 'migrations'
	});
}

// Destroy the test database
async function destroyDatabase(dashboard) {

	// Destroying the database also involves clearing an
	// in-memory cache of settings
	dashboard.model.Setting.clearInMemoryCache();

	const result = await dashboard.database.knex.raw(
		'SELECT tablename FROM pg_tables WHERE schemaname=\'public\''
	);
	await dashboard.database.knex.raw(result.rows.map(row => {
		return `DROP TABLE ${row.tablename} CASCADE`;
	}).join(';'));
}

// Seed the test database from a test data directory
async function seedDatabase(dashboard, seedDirectory) {
	await cleanDatabase(dashboard);
	await dashboard.database.knex.seed.run({
		directory: `${__dirname}/../seed/${seedDirectory}`
	});
}

module.exports = {
	clean: cleanDatabase,
	destroy: destroyDatabase,
	seed: seedDatabase
};
