/* eslint max-len: 'off' */
'use strict';

exports.seed = (database, Promise) => {
	return Promise.resolve().then(() => {
		return database('settings').insert({
			id: 'rkvFLhY1W',
			data: JSON.stringify({
				defaultPermissions: {
					allowRead: true,
					allowWrite: true,
					allowDelete: false,
					allowAdmin: false
				},
				setupComplete: true,
				// See users seed data for this value
				superAdminId: 'rk7rS2F1b'
			})
		});
	});
};
