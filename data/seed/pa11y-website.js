// jscs:disable maximumLineLength
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
		})
		.then(() => {
			// Add a bunch of results to the URLs
			return database('results').insert([
				{
					id: 's01p_u01h_r01',
					url: 's01p_u01h',
					site: siteId,
					createdAt: new Date(Date.now() - 172800000), // 2 days ago
					errorCount: 2,
					warningCount: 2,
					noticeCount: 1,
					messages: JSON.stringify([
						{
							code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H30.2',
							context: '<a href="http://example.com/"><img src="example1.jpg" alt=""/></a>',
							message: 'Img element is the only content of the link, but is missing alt text. The alt text should describe the purpose of the link.',
							selector: 'html > body > p:nth-child(1) > a',
							type: 'error',
							typeCode: 1
						},
						{
							code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H30.2',
							context: '<a href="http://example.com/"><img src="example2.jpg" alt=""/></a>',
							message: 'Img element is the only content of the link, but is missing alt text. The alt text should describe the purpose of the link.',
							selector: 'html > body > p:nth-child(2) > a',
							type: 'error',
							typeCode: 1
						},
						{
							code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.H49.B',
							context: '<b>Hello World!</b>',
							message: 'Semantic markup should be used to mark emphasised or special text so that it can be programmatically determined.',
							selector: '#content > b:nth-child(4)',
							type: 'warning',
							typeCode: 2
						},
						{
							code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.H49.B',
							context: '<b>This is a result.</b>',
							message: 'Semantic markup should be used to mark emphasised or special text so that it can be programmatically determined.',
							selector: '#content > b:nth-child(5)',
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
				},
				{
					id: 's01p_u01h_r02',
					url: 's01p_u01h',
					site: siteId,
					createdAt: new Date(Date.now() - 86400000), // yesterday
					errorCount: 1,
					warningCount: 1,
					noticeCount: 1,
					messages: JSON.stringify([
						{
							code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H30.2',
							context: '<a href="http://example.com/"><img src="example1.jpg" alt=""/></a>',
							message: 'Img element is the only content of the link, but is missing alt text. The alt text should describe the purpose of the link.',
							selector: 'html > body > p:nth-child(1) > a',
							type: 'error',
							typeCode: 1
						},
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
				},
				{
					id: 's01p_u01h_r03',
					url: 's01p_u01h',
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
				},
				{
					id: 's01p_u03c_r01',
					url: 's01p_u03c',
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
