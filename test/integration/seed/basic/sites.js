'use strict';

// Test site details
exports.seed = async database => {

	// Insert test sites
	await database('sites').insert([
		{
			id: 'mock-site-id-1',
			name: 'Mock Site 1',
			base_url: 'http://mock-site-1/',
			is_runnable: true,
			is_scheduled: true,
			schedule: 'mock-schedule',
			pa11y_config: JSON.stringify({
				standard: 'WCAG2AAA'
			})
		},
		{
			id: 'mock-site-id-2',
			name: 'Mock Site 2 (no URLs)',
			base_url: 'http://mock-site-2/',
			is_runnable: true,
			is_scheduled: true,
			schedule: 'mock-schedule',
			pa11y_config: JSON.stringify({})
		}
	]);
	await database('urls').insert([
		{
			id: 'mock-url-id-1',
			site_id: 'mock-site-id-1',
			name: 'Mock URL 1',
			address: '/',
			pa11y_config: JSON.stringify({
				timeout: 500
			})
		},
		{
			id: 'mock-url-id-2',
			site_id: 'mock-site-id-1',
			name: 'Mock URL 2',
			address: '/example',
			pa11y_config: JSON.stringify({})
		},
		{
			id: 'mock-url-id-3',
			site_id: 'mock-site-id-1',
			name: 'Mock URL 3',
			address: 'http://mock-url-3/example',
			pa11y_config: JSON.stringify({})
		}
	]);

};
