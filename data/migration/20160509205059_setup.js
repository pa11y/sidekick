'use strict';

// NOTE: during the alpha, this migration will be modified.
// This is normally against the rules, but I'd like to leave
// the alpha with a clean initial database setup.

exports.up = (database, Promise) => {
	return Promise.resolve()
		.then(() => {
			// Create the sites table
			return database.schema.createTable('sites', table => {

				// Sites table columns
				table.string('id').unique().primary();
				table.string('name').notNullable();
				table.timestamp('created_at').defaultTo(database.fn.now());
				table.timestamp('updated_at').defaultTo(database.fn.now());

			});
		})
		.then(() => {
			// Create the URLs table
			return database.schema.createTable('urls', table => {

				// URLs table columns
				table.string('id').unique().primary();
				table.string('site');
				table.string('name').notNullable();
				table.string('address').notNullable();
				table.timestamp('created_at').defaultTo(database.fn.now());
				table.timestamp('updated_at').defaultTo(database.fn.now());

				// Foreign key contraints
				table.foreign('site').references('sites.id');

			});
		});
};

exports.down = (database, Promise) => {
	return Promise.resolve()
		.then(() => {
			return database.schema.dropTable('urls');
		})
		.then(() => {
			return database.schema.dropTable('sites');
		});
};
