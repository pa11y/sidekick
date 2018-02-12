'use strict';

const bcrypt = require('bcrypt');

// Test authentication details
exports.seed = async database => {

	// Insert test users
	await database('users').insert([
		{
			id: 'mock-owner-id',
			email: 'owner@example.com',
			password: await bcrypt.hash('password', 10),
			is_owner: true,
			allow_read: true,
			allow_write: true,
			allow_delete: true,
			allow_admin: true
		},
		{
			id: 'mock-user-id',
			email: 'user@example.com',
			password: await bcrypt.hash('password', 10)
		}
	]);

	// Insert test API keys
	await database('keys').insert([
		{
			id: 'mock-key',
			secret: await bcrypt.hash('mock-secret', 5),
			user_id: 'mock-user-id',
			description: 'Example key'
		}
	]);

};
