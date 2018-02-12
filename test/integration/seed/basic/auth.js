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
			id: 'mock-admin-id',
			email: 'admin@example.com',
			password: await bcrypt.hash('password', 10),
			allow_read: true,
			allow_write: true,
			allow_delete: true,
			allow_admin: true
		},
		{
			id: 'mock-delete-id',
			email: 'delete@example.com',
			password: await bcrypt.hash('password', 10),
			allow_read: true,
			allow_write: true,
			allow_delete: true,
			allow_admin: false
		},
		{
			id: 'mock-write-id',
			email: 'write@example.com',
			password: await bcrypt.hash('password', 10),
			allow_read: true,
			allow_write: true,
			allow_delete: false,
			allow_admin: false
		},
		{
			id: 'mock-read-id',
			email: 'read@example.com',
			password: await bcrypt.hash('password', 10),
			allow_read: true,
			allow_write: false,
			allow_delete: false,
			allow_admin: false
		},
		{
			id: 'mock-noaccess-id',
			email: 'noaccess@example.com',
			password: await bcrypt.hash('password', 10),
			allow_read: false,
			allow_write: false,
			allow_delete: false,
			allow_admin: false
		},
		{
			id: 'mock-nokeys-id',
			email: 'nokeys@example.com',
			password: await bcrypt.hash('password', 10),
			allow_read: false,
			allow_write: false,
			allow_delete: false,
			allow_admin: false
		}
	]);

	// Insert test API keys
	await database('keys').insert([
		{
			id: 'mock-owner-key',
			secret: await bcrypt.hash('mock-owner-secret', 5),
			user_id: 'mock-owner-id',
			description: 'Key with admin permissions belonging to an owner'
		},
		{
			id: 'mock-admin-key',
			secret: await bcrypt.hash('mock-admin-secret', 5),
			user_id: 'mock-admin-id',
			description: 'Key with admin permissions'
		},
		{
			id: 'mock-delete-key',
			secret: await bcrypt.hash('mock-delete-secret', 5),
			user_id: 'mock-delete-id',
			description: 'Key with delete permissions'
		},
		{
			id: 'mock-write-key',
			secret: await bcrypt.hash('mock-write-secret', 5),
			user_id: 'mock-write-id',
			description: 'Key with write permissions'
		},
		{
			id: 'mock-read-key',
			secret: await bcrypt.hash('mock-read-secret', 5),
			user_id: 'mock-read-id',
			description: 'Key with read permissions'
		},
		{
			id: 'mock-read-key-2',
			secret: await bcrypt.hash('mock-read-secret', 5),
			user_id: 'mock-read-id',
			description: 'Key with read permissions again'
		},
		{
			id: 'mock-noaccess-key',
			secret: await bcrypt.hash('mock-noaccess-secret', 5),
			user_id: 'mock-noaccess-id',
			description: 'Key with no permissions'
		}
	]);

};
