/* eslint no-underscore-dangle: 'off' */
'use strict';

const shortid = require('shortid');

module.exports = (dashboard, models) => {
	const database = dashboard.database.knex;
	const table = 'settings';

	const model = models.settings = {

		// Get the settings
		get() {
			return database
				.select('data')
				.from(table)
				.limit(1)
				.then(settings => {
					return (settings[0] ? settings[0].data : {});
				})
				.catch(() => {
					return {};
				});
		},

		// Edit the settings
		edit(data) {
			data = JSON.stringify(data);
			return database
				.select('id')
				.from(table)
				.limit(1)
				.then(results => {
					return (results[0] ? results[0].id : null);
				})
				.then(id => {
					if (id) {
						return database(table).where({id}).update({
							data
						});
					}
					return database(table).insert({
						id: shortid.generate(),
						data
					});
				});
		}

	};
};
