// jscs:disable disallowDanglingUnderscores
'use strict';

const shortid = require('shortid');

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

		// Create a URL (resolving with the new ID)
		create(data) {
			return this.cleanInput(data).then(cleanData => {
				cleanData.id = shortid.generate();
				return this._rawCreate(cleanData);
			});
		},

		// Validate/sanitize site data input
		cleanInput(data) {
			try {
				if (typeof data !== 'object' || Array.isArray(data) || data === null) {
					throw new Error('URL should be an object');
				}
				if (data.id) {
					throw new Error('URL ID cannot be set manually');
				}
				if (typeof data.site !== 'string') {
					throw new Error('URL site should be a string');
				}
				if (typeof data.name !== 'string') {
					throw new Error('URL name should be a string');
				}
				if (typeof data.address !== 'string') {
					throw new Error('URL address should be a string');
				}
			} catch (error) {
				error.isValidationError = true;
				return Promise.reject(error);
			}
			return Promise.resolve({
				site: data.site,
				name: data.name,
				address: data.address
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
		},

		_rawCreate(data) {
			return database(table)
				.returning('id')
				.insert(data)
				.then(ids => {
					return ids[0];
				});
		}

	};

	return model;
};
