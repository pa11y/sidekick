'use strict';

// Pa11y website details
exports.seed = async database => {

	// Insert demo site: pa11y.org
	await database('sites').insert([
		{
			id: 'ByXMzeDwf',
			name: 'Pa11y Website',
			base_url: 'http://pa11y.org/',
			is_runnable: true,
			is_scheduled: false,
			schedule: null,
			pa11y_config: JSON.stringify({
				timeout: 20000
			})
		}
	]);
	await database('urls').insert([
		{
			id: 'SkOx3Fiwf',
			site_id: 'ByXMzeDwf',
			name: 'Home',
			address: '/',
			pa11y_config: JSON.stringify({})
		},
		{
			id: 'SkDV2KjDG',
			site_id: 'ByXMzeDwf',
			name: 'News',
			address: '/news',
			pa11y_config: JSON.stringify({})
		},
		{
			id: 'HysE2YjDM',
			site_id: 'ByXMzeDwf',
			name: 'Contributing',
			address: '/contributing',
			pa11y_config: JSON.stringify({})
		},
		{
			id: 'SylT-M2PM',
			site_id: 'ByXMzeDwf',
			name: 'Home (strict)',
			address: '/',
			pa11y_config: JSON.stringify({
				standard: 'WCAG2AAA'
			})
		}
	]);

};
