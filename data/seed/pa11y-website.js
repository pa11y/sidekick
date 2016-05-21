'use strict';

const uuid = require('uuid').v4;

exports.seed = (database, Promise) => {
	const siteId = uuid();

	return Promise.join(

		// Add a site
		database('sites').insert({
			id: siteId,
			name: 'Pa11y'
		}),

		// Add a bunch of URLs to the site
		database('urls').insert([
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
		])

	);
};
