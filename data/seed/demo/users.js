/* eslint max-len: 'off' */
'use strict';

exports.seed = (database, Promise) => {
	return Promise.resolve().then(() => {
		return database('users').insert([
			{
				// Do not modify this ID – it's referenced in
				// the seed data for settings
				id: 'rk7rS2F1b',
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
