'use strict';

// NOTE: during the alpha, this migration will be modified.
// This is normally against the rules, but I'd like to leave
// the alpha with a clean initial database setup.

exports.up = (database, Promise) => {
	return Promise.resolve()
		.then(() => {
			// Create the settings table
			return database.schema.createTable('settings', table => {

				// Settings table columns
				table.string('id').unique().primary();
				table.json('data').notNullable().defaultTo('{}');

			});
		})
		.then(() => {
			// Create the sites table
			return database.schema.createTable('sites', table => {

				// Sites table columns
				table.string('id').unique().primary();
				table.timestamp('createdAt').defaultTo(database.fn.now());
				table.timestamp('updatedAt').defaultTo(database.fn.now());
				table.string('name').notNullable();
				table.json('pa11yConfig').notNullable().defaultTo('{}');

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
				table.json('pa11yConfig').notNullable().defaultTo('{}');

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
		})
		.then(() => {
			// Create the users table
			return database.schema.createTable('users', table => {

				// Users table columns
				table.string('id').unique().primary();
				table.timestamp('createdAt').defaultTo(database.fn.now());
				table.timestamp('updatedAt').defaultTo(database.fn.now());
				table.string('email').notNullable().unique();
				table.string('password').notNullable();
				table.string('apiKey').notNullable().unique();
				table.boolean('allowRead').notNullable().defaultTo(true);
				table.boolean('allowWrite').notNullable().defaultTo(true);
				table.boolean('allowDelete').notNullable().defaultTo(false);
				table.boolean('allowAdmin').notNullable().defaultTo(false);

			});
		});
};

exports.down = (database, Promise) => {
	return Promise.resolve()
		.then(() => {
			return database.schema.dropTable('settings');
		})
		.then(() => {
			return database.schema.dropTable('users');
		})
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
