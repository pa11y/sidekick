/* eslint no-underscore-dangle: 'off' */
'use strict';

const bcrypt = require('bcrypt');
const shortid = require('shortid');
const uuid = require('uuid/v4');

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
		getById(id, options) {
			return this._rawGetById(id).then(user => {
				return (user ? this.prepareForOutput(user, options) : user);
			});
		},

		// Get a single user by email and password
		getByEmailAndPassword(email, password, options) {
			return this._rawGetByEmailAndPassword(email, password).then(user => {
				return (user ? this.prepareForOutput(user, options) : user);
			});
		},

		// Get a single user by API key
		getByApiKey(apiKey, options) {
			return this._rawGetByApiKey(apiKey).then(user => {
				return (user ? this.prepareForOutput(user, options) : user);
			});
		},

		// Create a user (resolving with the new ID)
		create(data) {
			return this.cleanInput(data)
				.then(cleanData => {
					return this.hashPassword(cleanData.password).then(hash => {
						cleanData.password = hash;
						return cleanData;
					});
				})
				.then(cleanData => {
					cleanData.id = shortid.generate();
					cleanData.apiKey = uuid();
					cleanData.createdAt = cleanData.updatedAt = new Date();
					return this._rawCreate(cleanData);
				});
		},

		// Regenerate a user's API key by ID
		regenerateApiKey(id) {
			return database(table)
				.where({id})
				.update({
					apiKey: uuid()
				}, 'id')
				.then(ids => {
					return Boolean(ids.length);
				});
		},

		// Hash a user password
		hashPassword(password) {
			const saltRounds = 15;
			return bcrypt.hash(password, saltRounds);
		},

		// Check a user password
		checkPassword(password, hash) {
			return bcrypt.compare(password, hash);
		},

		// Check whether a user has a permission
		hasPermission(user, permission) {
			switch (permission) {
				case 'read':
					return user.allowRead || false;
				case 'write':
					return user.allowWrite || false;
				case 'delete':
					return user.allowDelete || false;
				case 'admin':
					return user.allowAdmin || false;
				default:
					return false;
			}
		},

		// Validate/sanitize user data input
		cleanInput(data) {
			try {
				if (typeof data !== 'object' || Array.isArray(data) || data === null) {
					throw new Error('User should be an object');
				}
				if (data.id) {
					throw new Error('User ID cannot be set manually');
				}
				if (typeof data.email !== 'string' || !/^.+@.+$/.test(data.email)) {
					throw new Error('User email should be a valid email address');
				}

				// TODO ensure it's a good password
				if (typeof data.password !== 'string') {
					throw new Error('User password should be a string');
				}
				if (!data.password.trim()) {
					throw new Error('User password cannot be empty');
				}

				if (data.apiKey) {
					throw new Error('User API key cannot be set manually');
				}
				if (typeof data.allowRead !== 'boolean') {
					throw new Error('User read permission should be a boolean');
				}
				if (typeof data.allowWrite !== 'boolean') {
					throw new Error('User write permission should be a boolean');
				}
				if (typeof data.allowDelete !== 'boolean') {
					throw new Error('User delete permission should be a boolean');
				}
				if (typeof data.allowAdmin !== 'boolean') {
					throw new Error('User admin permission should be a boolean');
				}
			} catch (error) {
				error.isValidationError = true;
				return Promise.reject(error);
			}
			const cleanData = {
				email: data.email.trim(),
				password: data.password.trim(),
				allowRead: data.allowRead,
				allowWrite: data.allowWrite,
				allowDelete: data.allowDelete,
				allowAdmin: data.allowAdmin
			};
			return Promise.resolve(cleanData);
		},

		// Prepare a user object for output
		prepareForOutput(user, options) {
			options = options || {};
			delete user.password;
			if (!options.safe) {
				delete user.apiKey;
			}
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
		},

		_rawGetByApiKey(apiKey) {
			return database
				.select('*')
				.from(table)
				.where({
					apiKey
				})
				.limit(1)
				.then(users => {
					return users[0];
				});
		},

		_rawGetByEmailAndPassword(email, password) {
			const error = new Error('Incorrect email or password');
			error.isValidationError = true;

			return database
				.select('*')
				.from(table)
				.where({
					email
				})
				.limit(1)
				.then(users => {
					return users[0];
				})
				.then(user => {
					if (!user) {
						throw error;
					}
					return this.checkPassword(password, user.password).then(isValid => {
						if (!isValid) {
							throw error;
						}
						return user;
					});
				});
		},

		_rawCreate(data) {
			return database(table)
				.returning('id')
				.insert(data)
				.then(ids => {
					return ids[0];
				});
		}

	};

	return model;
};
