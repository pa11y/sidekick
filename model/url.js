/* eslint no-underscore-dangle: 'off' */
'use strict';

const shortid = require('shortid');
const ValidationError = require('../lib/validation-error');

module.exports = (dashboard, models) => {
	const database = dashboard.database.knex;
	const table = 'urls';

	const model = models.url = {

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
				cleanData.createdAt = cleanData.updatedAt = new Date();
				return this._rawCreate(cleanData);
			});
		},

		// Edit a URL (resolving with the URL ID)
		edit(id, data) {
			data.site = '-'; // site cannot be changed
			return this.cleanInput(data).then(cleanData => {
				delete cleanData.site; // site cannot be changed
				cleanData.updatedAt = new Date();
				return this._rawEdit(id, cleanData);
			});
		},

		// Delete a URL and all child results (resolving with the number of things deleted)
		delete(id) {
			return this._rawDelete(id);
		},

		// Validate/sanitize site data input
		cleanInput(data) {
			const validationErrors = [];

			// Validation
			if (typeof data !== 'object' || Array.isArray(data) || data === null) {
				validationErrors.push('URL should be an object');
			} else {
				if (data.id) {
					validationErrors.push('URL ID cannot be set manually');
				}
				if (typeof data.site !== 'string') {
					validationErrors.push('URL site should be a string');
				}
				if (typeof data.name !== 'string') {
					validationErrors.push('URL name should be a string');
				} else if (!data.name.trim()) {
					validationErrors.push('URL name cannot be empty');
				}
				if (typeof data.address !== 'string') {
					validationErrors.push('URL address should be a string');
				} else if (!data.address.trim()) {
					validationErrors.push('URL address cannot be empty');
				}
				if (
					data.pa11yConfig !== undefined &&
					(
						typeof data.pa11yConfig !== 'object' ||
						Array.isArray(data.pa11yConfig) ||
						data.pa11yConfig === null
					)
				) {
					validationErrors.push('URL Pa11y config should be an object');
				}
			}

			if (validationErrors.length) {
				return Promise.reject(new ValidationError('Invalid URL data', validationErrors));
			}
			const cleanData = {
				site: data.site,
				name: data.name.trim(),
				address: data.address.trim()
			};
			if (data.pa11yConfig) {
				cleanData.pa11yConfig = JSON.stringify(data.pa11yConfig);
			}
			return Promise.resolve(cleanData);
		},

		// Prepare a URL object for output
		prepareForOutput(url) {
			url.paths = {
				api: `/api/v1/sites/${url.site}/urls/${url.id}`,
				apiResults: `/api/v1/sites/${url.site}/urls/${url.id}/results`,
				apiSite: `/api/v1/sites/${url.site}`
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
		},

		_rawEdit(id, data) {
			return database(table)
				.where({id})
				.update(data, 'id')
				.then(ids => {
					return ids[0];
				});
		},

		_rawDelete(id) {
			const totals = {
				urls: 0,
				results: 0
			};
			return Promise.resolve()
				.then(() => {
					return database('results')
						.where({url: id})
						.delete();
				})
				.then(resultsDeleted => {
					totals.results = resultsDeleted;
					return database(table)
						.where({id})
						.delete();
				})
				.then(urlsDeleted => {
					totals.urls = urlsDeleted;
					return totals;
				});
		}

	};
};
