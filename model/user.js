// jscs:disable disallowDanglingUnderscores
'use strict';

module.exports = dashboard => {
	const database = dashboard.database;
	const table = 'users';

	const model = {

		// Get all users
		getAll() {
			return this._rawGetAll().then(users => {
				return users.map(this.prepareForOutput);
			});
		},

		// Get a single user by ID
		getById(id) {
			return this._rawGetById(id).then(user => {
				return (user ? this.prepareForOutput(user) : user);
			});
		},

		// Prepare a user object for output
		prepareForOutput(user) {
			delete user.password;
			delete user.apiKey;
			user.paths = {
				api: `/api/v1/users/${user.id}`
			};
			return user;
		},

		// "Raw" methods used to get data that's not
		// prepared for output to the user

		_rawGetAll() {
			return database
				.select('*')
				.from(table)
				.orderBy('username');
		},

		_rawGetById(id) {
			return database
				.select('*')
				.from(table)
				.where({
					id
				})
				.limit(1)
				.then(users => {
					return users[0];
				});
		}

	};

	return model;
};
