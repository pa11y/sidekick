/* eslint max-len: 'off' */
'use strict';

// Note: IDs in here are referenced in the integration
// tests, so should not be changed.
exports.seed = (database, Promise) => {
	return Promise.resolve().then(() => {
		// Add a bunch of users to the site
		return database('users').insert([
			{
				id: 'H1tA5TKkb',
				email: 'admin@example.com',
				// The password for this user is "password"
				password: '$2a$15$EJPlCXi18TnWhgcarpvPYOcFzMOnwdS0sZyNTS8BRbaVpVuNOY15C',
				apiKey: 'mock-admin-api-key',
				allowRead: true,
				allowWrite: true,
				allowDelete: true,
				allowAdmin: true
			},
			{
				id: 'SkWuKxJeZ',
				email: 'readonly@example.com',
				// The password for this user is "password"
				password: '$2a$15$EJPlCXi18TnWhgcarpvPYOcFzMOnwdS0sZyNTS8BRbaVpVuNOY15C',
				apiKey: 'mock-readonly-api-key',
				allowRead: true,
				allowWrite: false,
				allowDelete: false,
				allowAdmin: false
			},
			{
				id: 'ByrOKx1lb',
				email: 'readwrite@example.com',
				// The password for this user is "password"
				password: '$2a$15$EJPlCXi18TnWhgcarpvPYOcFzMOnwdS0sZyNTS8BRbaVpVuNOY15C',
				apiKey: 'mock-readwrite-api-key',
				allowRead: true,
				allowWrite: true,
				allowDelete: false,
				allowAdmin: false
			},
			{
				id: 'HkaOYeyxZ',
				email: 'readwritedelete@example.com',
				// The password for this user is "password"
				password: '$2a$15$EJPlCXi18TnWhgcarpvPYOcFzMOnwdS0sZyNTS8BRbaVpVuNOY15C',
				apiKey: 'mock-readwritedelete-api-key',
				allowRead: true,
				allowWrite: true,
				allowDelete: true,
				allowAdmin: false
			}
		]);
	});
};
