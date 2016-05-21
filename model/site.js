'use strict';

module.exports = dashboard => {
	const database = dashboard.database;
	const table = 'sites';

	const model = {

		getAll() {
			return this.getAllRaw().then(sites => {
				return sites.map(this.prepareForOutput);
			});
		},

		getAllRaw() {
			return database.select('*').from(table);
		},

		prepareForOutput(site) {
			return site;
		}

	};

	return model;
};
