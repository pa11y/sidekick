'use strict';

// Pa11y website details
exports.seed = async database => {

	// Insert demo site: github.com/pa11y/pa11y
	await database('sites').insert([
		{
			id: 'r1BzElDDG',
			name: 'Pa11y GitHub Repo',
			base_url: 'https://github.com/pa11y/pa11y',
			is_runnable: true,
			is_scheduled: false,
			schedule: null,
			pa11y_config: JSON.stringify({})
		}
	]);

};
