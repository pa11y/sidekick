'use strict';

exports.up = async database => {

	// Create the sites table
	await database.schema.createTable('sites', table => {

		// Meta information
		table.string('id').unique().primary();
		table.timestamp('created_at').defaultTo(database.fn.now());
		table.timestamp('updated_at').defaultTo(database.fn.now());

		// Site information
		table.string('name').notNullable();
		table.string('base_url').notNullable();
		table.boolean('is_runnable').notNullable().defaultTo(true);
		table.boolean('is_scheduled').notNullable().defaultTo(false);
		table.string('schedule');
		table.json('pa11y_config').notNullable().defaultTo('{}');

	});

};

exports.down = async database => {
	await database.schema.dropTable('sites');
};
