'use strict';

// Test setting details
exports.seed = async database => {

	// Insert test settings
	await database('settings').insert([
		{
			id: 'publicReadAccess',
			value: JSON.stringify(false)
		},
		{
			id: 'setupComplete',
			value: JSON.stringify(true)
		}
	]);

};
