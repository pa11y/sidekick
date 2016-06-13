'use strict';

const shortid = require('shortid');

exports.seed = (database, Promise) => {
	const siteId = shortid.generate();

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
					id: shortid.generate(),
					site: siteId,
					name: 'Home',
					address: 'http://pa11y.github.io/'
				},
				{
					id: shortid.generate(),
					site: siteId,
					name: 'Contact',
					address: 'http://pa11y.github.io/contact/'
				},
				{
					id: shortid.generate(),
					site: siteId,
					name: 'Contributing',
					address: 'http://pa11y.github.io/contributing/'
				}
			]);
		});

};
