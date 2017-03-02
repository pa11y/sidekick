'use strict';

// Note: IDs in here are referenced in the integration
// tests, so should not be changed.
exports.seed = (database, Promise) => {
	const siteId = 's03e_site';

	return Promise.resolve()
		.then(() => {
			// Add a site
			return database('sites').insert({
				id: siteId,
				name: 'Empty'
			});
		});

};
