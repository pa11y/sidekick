'use strict';

// Demo setting details
exports.seed = async database => {

	// Insert demo settings
	await database('settings').insert([
		{
			id: 'publicReadAccess',
			value: JSON.stringify(true)
		},
		{
			id: 'setupComplete',
			value: JSON.stringify(true)
		}
	]);

};
