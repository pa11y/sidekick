'use strict';

exports.up = async database => {

	// Create the URLs table
	await database.schema.createTable('urls', table => {

		// Meta information
		table.string('id').unique().primary();
		table.timestamp('created_at').defaultTo(database.fn.now());
		table.timestamp('updated_at').defaultTo(database.fn.now());

		// URL information
		table.string('site_id').notNullable();
		table.string('name').notNullable();
		table.string('address').notNullable();
		table.json('pa11y_config').notNullable().defaultTo('{}');

		// Foreign key contraints
		table.foreign('site_id').references('sites.id').onDelete('CASCADE');

	});

};

exports.down = async database => {
	await database.schema.dropTable('urls');
};
