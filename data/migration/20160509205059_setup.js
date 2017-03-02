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
				table.timestamp('createdAt').defaultTo(database.fn.now());
				table.timestamp('updatedAt').defaultTo(database.fn.now());
				table.string('name').notNullable();

			});
		})
		.then(() => {
			// Create the URLs table
			return database.schema.createTable('urls', table => {

				// URLs table columns
				table.string('id').unique().primary();
				table.string('site');
				table.timestamp('createdAt').defaultTo(database.fn.now());
				table.timestamp('updatedAt').defaultTo(database.fn.now());
				table.string('name').notNullable();
				table.string('address').notNullable();

				// Foreign key contraints
				table.foreign('site').references('sites.id');

			});
		})
		.then(() => {
			// Create the results table
			return database.schema.createTable('results', table => {

				// Results table columns
				table.string('id').unique().primary();
				table.string('url');
				table.string('site');
				table.timestamp('createdAt').defaultTo(database.fn.now());
				table.integer('errorCount').notNullable().defaultTo(0);
				table.integer('warningCount').notNullable().defaultTo(0);
				table.integer('noticeCount').notNullable().defaultTo(0);
				table.json('messages').notNullable().defaultTo('[]');

				// Foreign key contraints
				table.foreign('url').references('urls.id');
				table.foreign('site').references('sites.id');

			});
		});
};

exports.down = (database, Promise) => {
	return Promise.resolve()
		.then(() => {
			return database.schema.dropTable('results');
		})
		.then(() => {
			return database.schema.dropTable('urls');
		})
		.then(() => {
			return database.schema.dropTable('sites');
		});
};
