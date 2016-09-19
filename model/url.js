// jscs:disable disallowDanglingUnderscores
'use strict';

module.exports = dashboard => {
	const database = dashboard.database;
	const table = 'urls';

	const model = {

		// Get all URLs for a site
		getAllBySite(id) {
			return this._rawGetAllBySite(id).then(urls => {
				return urls.map(this.prepareForOutput);
			});
		},

		// Get a single URL by ID
		getById(id) {
			return this._rawGetById(id).then(url => {
				return (url ? this.prepareForOutput(url) : url);
			});
		},

		// Prepare a URL object for output
		prepareForOutput(url) {
			return url;
		},

		// "Raw" methods used to get data that's not
		// prepared for output to the user

		_rawGetAllBySite(id) {
			return database.select('*').from(table).where({site: id});
		},

		_rawGetById(id) {
			return database.select('*').from(table).where({id}).limit(1).then(urls => {
				return urls[0];
			});
		}

	};

	return model;
};
