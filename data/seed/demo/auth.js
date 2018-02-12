'use strict';

const bcrypt = require('bcrypt');

// Demo authentication details
exports.seed = async database => {

	// Insert demo users
	await database('users').insert([
		{
			id: 'BkT_N7xgM',
			email: 'admin@example.com',
			password: await bcrypt.hash('password', 10),
			is_owner: true,
			allow_read: true,
			allow_write: true,
			allow_delete: true,
			allow_admin: true
		},
		{
			id: 'Sk3yJbq8G',
			email: 'user1@example.com',
			password: await bcrypt.hash('password', 10),
			allow_read: true,
			allow_write: true,
			allow_delete: true,
			allow_admin: false
		},
		{
			id: 'H1lgJb5LM',
			email: 'user2@example.com',
			password: await bcrypt.hash('password', 10),
			allow_read: true,
			allow_write: false,
			allow_delete: false,
			allow_admin: false
		}
	]);

	// Insert demo API keys
	await database('keys').insert([
		{
			id: '1e861691c81ee30a3dc0d22a41cd29f7cd250d02',
			secret: await bcrypt.hash('25087d5ae4166302494f23e303064a0591b13816', 5),
			user_id: 'BkT_N7xgM',
			description: 'Admin access key'
		}
	]);

};
