/* eslint max-len: 'off' */
'use strict';

// Note: IDs in here are referenced in the integration
// tests, so should not be changed.
exports.seed = (database, Promise) => {
	return Promise.resolve().then(() => {
		// Add settings to the site
		return database('settings').insert({
			id: 'ryr3Batkb',
			data: JSON.stringify({
				defaultPermissions: {
					allowRead: false,
					allowWrite: false,
					allowDelete: false,
					allowAdmin: false
				},
				setupComplete: true,
				// See users seed data for this value
				superAdminId: 'H1tA5TKkb'
			})
		});
	});
};
