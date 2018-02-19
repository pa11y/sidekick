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
			pa11y_config: JSON.stringify({})
		},
		{
			id: 'mock-site-id-2',
			name: 'Mock Site 2',
			base_url: 'http://mock-site-2/',
			is_runnable: true,
			is_scheduled: true,
			schedule: 'mock-schedule',
			pa11y_config: JSON.stringify({})
		}
	]);

};
