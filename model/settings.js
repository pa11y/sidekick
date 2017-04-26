/* eslint no-underscore-dangle: 'off' */
'use strict';

module.exports = dashboard => {
	const database = dashboard.database;
	const table = 'settings';

	const model = {

		// Get the settings
		get() {
			return database
				.select('data')
				.from(table)
				.limit(1)
				.then(settings => {
					return (settings[0] ? settings[0].data : {});
				});
		}

	};

	return model;
};
