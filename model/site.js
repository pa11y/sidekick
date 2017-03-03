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
			site.urlCount = site.urlCount || null;
			if (typeof site.urlCount === 'string') {
				site.urlCount = parseInt(site.urlCount, 10);
			}
			site.paths = {
				api: `/api/v1/sites/${site.id}`
			};
			return site;
		},

		// "Raw" methods used to get data that's not
		// prepared for output to the user

		_rawGetAll() {
			return database
				.select(`${table}.*`)
				.leftJoin('urls', `${table}.id`, 'urls.site')
				.count('urls.id as urlCount')
				.groupBy(`${table}.id`)
				.from(table)
				.orderBy(`${table}.name`);
		},

		_rawGetById(id) {
			return database
				.select(`${table}.*`)
				.leftJoin('urls', `${table}.id`, 'urls.site')
				.count('urls.id as urlCount')
				.groupBy(`${table}.id`)
				.from(table)
				.where({
					[`${table}.id`]: id
				})
				.limit(1)
				.then(sites => {
					return sites[0];
				});
		}

	};

	return model;
};
