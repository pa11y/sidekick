'use strict';

// Note: IDs in here are referenced in the integration
// tests, so should not be changed.
exports.seed = (database, Promise) => {
	const siteId = 's01p_site';

	return Promise.resolve()
		.then(() => {
			// Add a site
			return database('sites').insert({
				id: siteId,
				name: 'Pa11y'
			});
		})
		.then(() => {
			// Add a bunch of URLs to the site
			return database('urls').insert([
				{
					id: 's01p_u01h',
					site: siteId,
					name: 'Home',
					address: 'http://pa11y.github.io/'
				},
				{
					id: 's01p_u02c',
					site: siteId,
					name: 'Contact',
					address: 'http://pa11y.github.io/contact/'
				},
				{
					id: 's01p_u03c',
					site: siteId,
					name: 'Contributing',
					address: 'http://pa11y.github.io/contributing/'
				}
			]);
		});

};
