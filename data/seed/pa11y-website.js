'use strict';

const uuid = require('uuid').v4;

exports.seed = (database, Promise) => {
	const siteId = uuid();

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
					id: uuid(),
					site: siteId,
					name: 'Home',
					address: 'http://pa11y.github.io/'
				},
				{
					id: uuid(),
					site: siteId,
					name: 'Contact',
					address: 'http://pa11y.github.io/contact/'
				},
				{
					id: uuid(),
					site: siteId,
					name: 'Contributing',
					address: 'http://pa11y.github.io/contributing/'
				}
			]);
		});

};
