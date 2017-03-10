// jscs:disable disallowDanglingUnderscores
'use strict';

module.exports = dashboard => {
	const database = dashboard.database;
	const table = 'results';

	const model = {

		// Get all results for a URL
		getAllByUrl(urlId) {
			return this._rawGetAllByUrl(urlId).then(results => {
				return results.map(this.prepareForOutput);
			});
		},

		// Get all results for a site
		getAllBySite(siteId) {
			return this._rawGetAllBySite(siteId).then(results => {
				return results.map(this.prepareForOutput);
			});
		},

		// Get a single result by ID
		getById(id) {
			return this._rawGetById(id).then(result => {
				return (result ? this.prepareForOutput(result) : result);
			});
		},

		// Get a single result by ID, URL ID, and site ID
		getByIdAndUrlAndSite(id, urlId, siteId) {
			return this._rawGetByIdAndUrlAndSite(id, urlId, siteId).then(result => {
				return (result ? this.prepareForOutput(result) : result);
			});
		},

		// Delete a result object (resolving with the number of results deleted)
		delete(id) {
			return this._rawDelete(id);
		},

		// Prepare a result object for output
		prepareForOutput(result) {
			result.paths = {
				api: `/api/v1/sites/${result.site}/urls/${result.url}/results/${result.id}`
			};
			return result;
		},

		// "Raw" methods used to get data that's not
		// prepared for output to the user

		_rawGetAllByUrl(url) {
			return database
				.select('*')
				.from(table)
				.where({
					url
				})
				.orderBy('createdAt', 'desc');
		},

		_rawGetAllBySite(site) {
			return database
				.select('*')
				.from(table)
				.where({
					site
				})
				.orderBy('createdAt', 'desc');
		},

		_rawGetById(id) {
			return database
				.select('*')
				.from(table)
				.where({
					id
				})
				.limit(1)
				.then(results => {
					return results[0];
				});
		},

		_rawGetByIdAndUrlAndSite(id, url, site) {
			return database
				.select('*')
				.from(table)
				.where({
					id,
					url,
					site
				})
				.limit(1)
				.then(results => {
					return results[0];
				});
		},

		_rawDelete(id) {
			return database(table)
				.where({id})
				.delete()
				.then(resultsDeleted => {
					return {
						results: resultsDeleted
					};
				});
		}

	};

	return model;
};
