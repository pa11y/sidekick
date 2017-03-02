// jscs:disable maximumLineLength
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
		})
		.then(() => {
			// Add a bunch of results to the URLs
			return database('results').insert([
				{
					id: 's02g_u01h_r01',
					url: 's02g_u01h',
					site: siteId,
					createdAt: new Date(Date.now()), // now
					errorCount: 0,
					warningCount: 1,
					noticeCount: 1,
					messages: JSON.stringify([
						{
							code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.H49.B',
							context: '<b>Hello World!</b>',
							message: 'Semantic markup should be used to mark emphasised or special text so that it can be programmatically determined.',
							selector: '#content > b:nth-child(4)',
							type: 'warning',
							typeCode: 2
						},
						{
							code: 'WCAG2AA.Principle2.Guideline2_4.2_4_4.H77,H78,H79,H80,H81',
							context: '<a href="http://example.com/">Hello World!</a>',
							message: 'Check that the link text combined with programmatically determined link context identifies the purpose of the link.',
							selector: 'html > body > ul > li:nth-child(2) > a',
							type: 'notice',
							typeCode: 3
						}
					])
				}
			]);
		});

};
