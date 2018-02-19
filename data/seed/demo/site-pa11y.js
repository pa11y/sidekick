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
			pa11y_config: JSON.stringify({})
		}
	]);

};
