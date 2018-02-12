'use strict';

exports.up = async database => {

	// Create the settings table
	await database.schema.createTable('settings', table => {

		// Meta information
		table.string('id').unique().primary();
		table.timestamp('created_at').defaultTo(database.fn.now());
		table.timestamp('updated_at').defaultTo(database.fn.now());

		// Setting information
		table.json('value').defaultTo('null');

	});

	// Create the users table
	await database.schema.createTable('users', table => {

		// Meta information
		table.string('id').unique().primary();
		table.timestamp('created_at').defaultTo(database.fn.now());
		table.timestamp('updated_at').defaultTo(database.fn.now());

		// User information
		table.string('email').notNullable().unique();
		table.string('password').notNullable();
		table.boolean('is_owner').notNullable().defaultTo(false);
		table.boolean('allow_read').notNullable().defaultTo(true);
		table.boolean('allow_write').notNullable().defaultTo(true);
		table.boolean('allow_delete').notNullable().defaultTo(false);
		table.boolean('allow_admin').notNullable().defaultTo(false);

	});

	// Create the keys table
	await database.schema.createTable('keys', table => {

		// Meta information
		table.string('id').unique().primary();
		table.string('user_id').notNullable();
		table.timestamp('created_at').defaultTo(database.fn.now());
		table.timestamp('updated_at').defaultTo(database.fn.now());

		// Key information
		table.string('secret').notNullable();
		table.string('description').notNullable();

		// Indexes and foreign key contraints
		table.foreign('user_id').references('users.id').onDelete('CASCADE');

	});

	// Create the sessions table
	await database.schema.createTable('sessions', table => {

		// Session table columns
		table.string('sid').unique().primary();
		table.json('sess').notNullable();
		table.timestamp('expired').notNullable().index();

	});

};

exports.down = async database => {
	await database.schema.dropTable('sessions');
	await database.schema.dropTable('keys');
	await database.schema.dropTable('users');
	await database.schema.dropTable('settings');
};
