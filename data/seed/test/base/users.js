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
				password: '$2a$15$SPCXYRKHbjGp9n.j2C.0AuetTTKmZktbfYIk6fdEET6HfhrcFKqaa',
				apiKey: 'c1e35c4d-8165-4133-a557-d323515e6f45',
				allowRead: true,
				allowWrite: true,
				allowDelete: true,
				allowAdmin: true
			}
		]);
	});
};
