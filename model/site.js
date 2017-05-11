/* eslint no-underscore-dangle: 'off' */
'use strict';

const shortid = require('shortid');
const ValidationError = require('../lib/validation-error');

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

		// Create a site (resolving with the new ID)
		create(data) {
			return this.cleanInput(data).then(cleanData => {
				cleanData.id = shortid.generate();
				cleanData.createdAt = cleanData.updatedAt = new Date();
				return this._rawCreate(cleanData);
			});
		},

		// Edit a site (resolving with site ID)
		edit(id, data) {
			return this.cleanInput(data).then(cleanData => {
				cleanData.updatedAt = new Date();
				return this._rawEdit(id, cleanData);
			});
		},

		// Delete a site and all child URLs/results (resolving with the number of things deleted)
		delete(id) {
			return this._rawDelete(id);
		},

		// Validate/sanitize site data input
		cleanInput(data) {
			const validationErrors = [];

			// Validation
			if (typeof data !== 'object' || Array.isArray(data) || data === null) {
				validationErrors.push('Site should be an object');
			} else {
				if (data.id) {
					validationErrors.push('Site ID cannot be set manually');
				}
				if (typeof data.name !== 'string') {
					validationErrors.push('Site name should be a string');
				} else if (!data.name.trim()) {
					validationErrors.push('Site name cannot be empty');
				}
				if (
					data.pa11yConfig !== undefined &&
					(
						typeof data.pa11yConfig !== 'object' ||
						Array.isArray(data.pa11yConfig) ||
						data.pa11yConfig === null
					)
				) {
					validationErrors.push('Site Pa11y config should be an object');
				}
			}

			if (validationErrors.length) {
				return Promise.reject(new ValidationError('Invalid site data', validationErrors));
			}
			const cleanData = {
				name: data.name.trim()
			};
			if (data.pa11yConfig) {
				cleanData.pa11yConfig = JSON.stringify(data.pa11yConfig);
			}
			return Promise.resolve(cleanData);
		},

		// Prepare a site object for output
		prepareForOutput(site) {
			site.urlCount = site.urlCount || null;
			if (typeof site.urlCount === 'string') {
				site.urlCount = parseInt(site.urlCount, 10);
			}
			site.paths = {
				api: `/api/v1/sites/${site.id}`,
				apiResults: `/api/v1/sites/${site.id}/results`,
				apiUrls: `/api/v1/sites/${site.id}/urls`,
				main: `/sites/${site.id}`
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
				sites: 0,
				urls: 0,
				results: 0
			};
			return Promise.resolve()
				.then(() => {
					return database('results')
						.where({site: id})
						.delete();
				})
				.then(resultsDeleted => {
					totals.results = resultsDeleted;
					return database('urls')
						.where({site: id})
						.delete();
				})
				.then(urlsDeleted => {
					totals.urls = urlsDeleted;
					return database(table)
						.where({id})
						.delete();
				})
				.then(sitesDeleted => {
					totals.sites = sitesDeleted;
					return totals;
				});
		}

	};

	return model;
};
