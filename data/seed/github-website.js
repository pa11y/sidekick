'use strict';

// Note: IDs in here are referenced in the integration
// tests, so should not be changed.
exports.seed = (database, Promise) => {
	const siteId = 's02g_site';

	return Promise.resolve()
		.then(() => {
			// Add a site
			return database('sites').insert({
				id: siteId,
				name: 'GitHub'
			});
		})
		.then(() => {
			// Add a bunch of URLs to the site
			return database('urls').insert([
				{
					id: 's02g_u01h',
					site: siteId,
					name: 'Home',
					address: 'https://github.com/'
				}
			]);
		});

};
