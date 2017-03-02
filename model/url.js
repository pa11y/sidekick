// jscs:disable disallowDanglingUnderscores
'use strict';

module.exports = dashboard => {
	const database = dashboard.database;
	const table = 'urls';

	const model = {

		// Get all URLs for a site
		getAllBySite(siteId) {
			return this._rawGetAllBySite(siteId).then(urls => {
				return urls.map(this.prepareForOutput);
			});
		},

		// Get a single URL by ID
		getById(id) {
			return this._rawGetById(id).then(url => {
				return (url ? this.prepareForOutput(url) : url);
			});
		},

		// Get a single URL by ID and site ID
		getByIdAndSite(id, siteId) {
			return this._rawGetByIdAndSite(id, siteId).then(url => {
				return (url ? this.prepareForOutput(url) : url);
			});
		},

		// Prepare a URL object for output
		prepareForOutput(url) {
			url.paths = {
				api: `/api/v1/sites/${url.site}/urls/${url.id}`
			};
			return url;
		},

		// "Raw" methods used to get data that's not
		// prepared for output to the user

		_rawGetAllBySite(site) {
			return database
				.select('*')
				.from(table)
				.where({
					site
				})
				.orderBy('name');
		},

		_rawGetById(id) {
			return database
				.select('*')
				.from(table)
				.where({
					id
				})
				.limit(1)
				.then(urls => {
					return urls[0];
				});
		},

		_rawGetByIdAndSite(id, site) {
			return database
				.select('*')
				.from(table)
				.where({
					id,
					site
				})
				.limit(1)
				.then(urls => {
					return urls[0];
				});
		}

	};

	return model;
};
