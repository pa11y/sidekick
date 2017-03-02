// jscs:disable disallowDanglingUnderscores
'use strict';

module.exports = dashboard => {
	const database = dashboard.database;
	const table = 'sites';

	const model = {

		// Get all sites
		getAll() {
			return this._rawGetAll().then(sites => {
				return sites.map(this.prepareForOutput);
			});
		},

		// Get a single site by ID
		getById(id) {
			return this._rawGetById(id).then(site => {
				return (site ? this.prepareForOutput(site) : site);
			});
		},

		// Prepare a site object for output
		prepareForOutput(site) {
			site.paths = {
				api: `/api/v1/sites/${site.id}`
			};
			return site;
		},

		// "Raw" methods used to get data that's not
		// prepared for output to the user

		_rawGetAll() {
			return database
				.select('*')
				.from(table);
		},

		_rawGetById(id) {
			return database
				.select('*')
				.from(table)
				.where({
					id
				})
				.limit(1)
				.then(sites => {
					return sites[0];
				});
		}

	};

	return model;
};
