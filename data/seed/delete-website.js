/* eslint max-len: 'off' */
'use strict';

// Note: IDs in here are referenced in the integration
// tests, so should not be changed.
exports.seed = (database, Promise) => {
	const siteId = 's04d_site';

	return Promise.resolve()
		.then(() => {
			// Add a site
			return database('sites').insert({
				id: siteId,
				name: 'Site to be Deleted'
			});
		})
		.then(() => {
			// Add a bunch of URLs to the site
			return database('urls').insert([
				{
					id: 's04d_u01d',
					site: siteId,
					name: 'URL to be Deleted 01',
					address: 'http://www.example.com/'
				},
				{
					id: 's04d_u02d',
					site: siteId,
					name: 'URL to be Deleted 02',
					address: 'http://www.example.com/'
				},
				{
					id: 's04d_u03d',
					site: siteId,
					name: 'URL to be Deleted 03',
					address: 'http://www.example.com/'
				}
			]);
		})
		.then(() => {
			// Add a bunch of results to the URLs
			return database('results').insert([
				{
					id: 's04d_u01d_r01',
					url: 's04d_u01d',
					site: siteId,
					createdAt: new Date(),
					errorCount: 0,
					warningCount: 0,
					noticeCount: 0,
					messages: '[]'
				},
				{
					id: 's04d_u02d_r01',
					url: 's04d_u02d',
					site: siteId,
					createdAt: new Date(),
					errorCount: 0,
					warningCount: 0,
					noticeCount: 0,
					messages: '[]'
				},
				{
					id: 's04d_u03d_r01',
					url: 's04d_u03d',
					site: siteId,
					createdAt: new Date(),
					errorCount: 0,
					warningCount: 0,
					noticeCount: 0,
					messages: '[]'
				},
				{
					id: 's04d_u03d_r02',
					url: 's04d_u03d',
					site: siteId,
					createdAt: new Date(),
					errorCount: 0,
					warningCount: 0,
					noticeCount: 0,
					messages: '[]'
				}
			]);
		});

};
