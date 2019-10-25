'use strict';

exports.up = async database => {

	// Change json columns to jsonb
	await database.schema.alterTable('settings', table => {
		table.jsonb('value').alter();
	});
	await database.schema.alterTable('sessions', table => {
		table.jsonb('sess').alter();
	});
	await database.schema.alterTable('sites', table => {
		table.jsonb('pa11y_config').alter();
	});
	await database.schema.alterTable('urls', table => {
		table.jsonb('pa11y_config').alter();
	});
};

exports.down = async database => {

	// Change jsonb columns to json
	await database.schema.alterTable('settings', table => {
		table.json('value').alter();
	});
	await database.schema.alterTable('sessions', table => {
		table.json('sess').alter();
	});
	await database.schema.alterTable('sites', table => {
		table.json('pa11y_config').alter();
	});
	await database.schema.alterTable('urls', table => {
		table.json('pa11y_config').alter();
	});

};
