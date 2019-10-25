'use strict';

exports.up = async database => {

	// Create the issues dictionary table
	await database.schema.createTable('issue_types', table => {

		// Meta information
		table.string('code').unique().primary();
		table.string('description');

	});

	await database('issue_types').insert(
		[
			{
				code: '0',
				description: 'unknown'
			},
			{
				code: '1',
				description: 'error'
			},
			{
				code: '2',
				description: 'warning'
			},
			{
				code: '3',
				description: 'notice'
			}
		]
	);

	// Create the issues table
	await database.schema.createTable('issues', table => {

		// Meta information
		table.string('id').unique().primary();
		table.timestamp('created_at').defaultTo(database.fn.now());
		table.string('issue_description_id');
		table.string('code');
		table.string('context');
		table.string('selector');
		table.string('message');
		table.string('issue_types_code');

		// Foreign keys
		table.foreign('issue_types_code').references('issue_types.code');

	});

	// Create the results table
	await database.schema.createTable('results', table => {

		// Meta information
		table.string('id').unique().primary();
		table.timestamp('created_at').defaultTo(database.fn.now());
		table.string('url_id');
		table.string('issue_id');

		// Foreign keys
		table.foreign('url_id').references('urls.id');
		table.foreign('issue_id').references('issues.id').onDelete('CASCADE');

	});

};

exports.down = async database => {
	await database.schema.dropTable('results');
	await database.schema.dropTable('issues');
	await database.schema.dropTable('issue_types');
};
