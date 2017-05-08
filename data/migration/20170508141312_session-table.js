'use strict';

exports.up = (database, Promise) => {
	return Promise.resolve()
		.then(() => {
			// Create the sessions table
			return database.schema.createTable('sessions', table => {

				// Settings table columns
				table.string('sid').unique().primary();
				table.json('sess').notNullable();
				table.timestamp('expired').notNullable().index();

			});
		});
};

exports.down = (database, Promise) => {
	return Promise.resolve()
		.then(() => {
			return database.schema.dropTable('sessions');
		});
};
