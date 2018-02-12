'use strict';

const bcrypt = require('bcrypt');
const joi = require('joi');
const shortid = require('shortid');
const validationError = require('../lib/util/validation-error');

/**
 * Initialise the User model.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @returns {Model} A Bookshelf model.
 */
function initUserModel(dashboard) {

	// Model validation schema
	const schema = joi.object().keys({
		email: joi.string().email().required(),
		password: joi.string().min(6).required(),
		is_owner: joi.boolean().required(),
		allow_read: joi.boolean().required(),
		allow_write: joi.boolean().required(),
		allow_delete: joi.boolean().required(),
		allow_admin: joi.boolean().required()
	});

	// Model prototypal methods
	const User = dashboard.database.Model.extend({
		tableName: 'users',

		// Model initialization
		initialize() {

			// When a model is created...
			this.on('creating', () => {

				// Fill out automatic fields
				this.attributes.id = shortid.generate();
				this.attributes.created_at = new Date();

			});

			// When a model is saved...
			this.on('saving', async () => {

				// Fill out automatic fields
				this.attributes.updated_at = new Date();

				// Validate the model
				await this.validateSave();

				// Hash the password if it's changed
				if (this.hasChanged('password')) {
					this.attributes.password = await User.hashPassword(this.attributes.password);
				}

			});

		},

		// Validate the model before saving
		validateSave() {
			return new Promise((resolve, reject) => {
				// Validate against the schema
				joi.validate(this.attributes, schema, {
					abortEarly: false,
					allowUnknown: true
				}, async error => {
					if (error) {
						return reject(error);
					}

					// Ensure that email is unique
					if (this.hasChanged('email') && await User.existsByEmail(this.attributes.email)) {
						return reject(validationError('"email" must be unique'));
					}

					resolve();

				});
			});
		},

		// Update the user with user-provided data
		async update(data) {
			if (data.email !== undefined) {
				this.set('email', data.email);
			}
			if (data.password !== undefined) {
				this.set('password', data.password);
			}
			if (data.allow_read !== undefined) {
				this.set('allow_read', Boolean(data.allow_read));
			}
			if (data.allow_write !== undefined) {
				this.set('allow_write', Boolean(data.allow_write));
			}
			if (data.allow_delete !== undefined) {
				this.set('allow_delete', Boolean(data.allow_delete));
			}
			if (data.allow_admin !== undefined) {
				this.set('allow_admin', Boolean(data.allow_admin));
			}
			await this.save();
			return this;
		},

		// Change the user's password
		async changePassword({current, next, confirm}) {
			if (!await User.checkPassword(current, this.get('password'))) {
				throw validationError('current password was incorrect');
			}
			if (next !== confirm) {
				throw validationError('new and confirmed passwords do not match');
			}
			return this.update({
				password: next
			});
		},

		// Override default serialization so we can control output
		serialize() {
			return {
				id: this.get('id'),
				email: this.get('email'),
				isOwner: this.get('is_owner'),
				permissions: {
					read: this.get('allow_read'),
					write: this.get('allow_write'),
					delete: this.get('allow_delete'),
					admin: this.get('allow_admin')
				},
				meta: {
					dateCreated: this.get('created_at'),
					dateUpdated: this.get('updated_at')
				}
			};
		},

		// Key relationship
		keys() {
			return this.hasMany(dashboard.model.Key);
		}


	// Model static methods
	}, {

		// Hash a password
		hashPassword(password) {
			const saltRounds = 10;
			return bcrypt.hash(password, saltRounds);
		},

		// Check a password against a hashed password
		checkPassword(password, hash) {
			return bcrypt.compare(password, hash);
		},

		// Create a user with user-provided data
		async create(data) {
			const user = new User({
				email: data.email,
				password: data.password,
				is_owner: Boolean(data.is_owner),
				allow_read: Boolean(data.allow_read),
				allow_write: Boolean(data.allow_write),
				allow_delete: Boolean(data.allow_delete),
				allow_admin: Boolean(data.allow_admin)
			});
			await user.save();
			return user;
		},

		// Fetch all users
		fetchAll() {
			return User.collection().query(qb => {
				qb.orderBy('is_owner', 'desc');
				qb.orderBy('email', 'asc');
			}).fetch();
		},

		// Fetch a user by id
		fetchOneById(userId) {
			return User.collection().query(qb => {
				qb.where('id', userId);
			}).fetchOne();
		},

		// Fetch a user by email
		fetchOneByEmail(email) {
			return User.collection().query(qb => {
				qb.where('email', email);
			}).fetchOne();
		},

		// Check whether a user with a given ID exists
		async existsById(userId) {
			const count = await User.collection().query(qb => {
				qb.where('id', userId);
			}).count();
			return (count > 0);
		},

		// Check whether a user with a given email exists
		async existsByEmail(email) {
			const count = await User.collection().query(qb => {
				qb.where('email', email);
			}).count();
			return (count > 0);
		}

	});

	return User;
}

module.exports = initUserModel;
