/* eslint max-len: 'off' */
'use strict';

// Note: IDs in here are referenced in the integration
// tests, so should not be changed.
exports.seed = (database, Promise) => {
	return Promise.resolve().then(() => {
		// Add a bunch of users to the site
		return database('users').insert([
			{
				id: 'user_01',
				username: 'admin',
				password: 'user_01_pw',
				apiKey: 'user_01_key',
				allowRead: true,
				allowWrite: true,
				allowDelete: true,
				allowAdmin: true
			},
			{
				id: 'user_02',
				username: 'default',
				password: '',
				apiKey: '',
				allowRead: true,
				allowWrite: false,
				allowDelete: false,
				allowAdmin: false
			},
			{
				id: 'user_03',
				username: 'write',
				password: 'user_03_pw',
				apiKey: 'user_03_key',
				allowRead: true,
				allowWrite: true,
				allowDelete: false,
				allowAdmin: false
			},
			{
				id: 'user_04',
				username: 'delete',
				password: 'user_04_pw',
				apiKey: 'user_04_key',
				allowRead: true,
				allowWrite: true,
				allowDelete: true,
				allowAdmin: false
			}
		]);
	});
};
