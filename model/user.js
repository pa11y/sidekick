'use strict';

const bcrypt = require('bcrypt');
const joi = require('joi');
const shortid = require('shortid');
const uuid = require('uuid/v4');

module.exports = initModel;

function initModel(dashboard, models) {

	// Model validation schema
	const schema = joi.object().keys({
		email: joi.string().email().required(),
		password: joi.string().min(6).required(),
		allowRead: joi.boolean().required(),
		allowWrite: joi.boolean().required(),
		allowDelete: joi.boolean().required(),
		allowAdmin: joi.boolean().required()
	});

	// Model prototypal methods
	const User = models.User = dashboard.database.Model.extend({
		tableName: 'users',
		hidden: ['password'],

		// Model initialization
		initialize() {

			// Simple flags for checking login status
			this.isLoggedIn = false;
			this.isDefaultUser = false;

			// When a model is created...
			this.on('creating', () => {
				// Fill out automatic fields
				this.attributes.id = shortid.generate();
				this.attributes.apiKey = uuid();
				this.attributes.createdAt = new Date();
			});

			// When a model is saved...
			this.on('saving', () => {
				// Fill out automatic fields
				this.attributes.updatedAt = new Date();
				// Validate the model
				return this.validateSave().then(() => {
					// Hash the password if it's changed
					if (this.hasChanged('password')) {
						return User.hashPassword(this.attributes.password).then(hashedPassword => {
							this.attributes.password = hashedPassword;
						});
					}
					return this;
				});
			});

		},

		// Validate the model before saving
		validateSave() {
			return new Promise((resolve, reject) => {
				joi.validate(this.attributes, schema, {
					abortEarly: false,
					allowUnknown: true
				}, (error) => {
					if (error) {
						return reject(error);
					}
					resolve();
				});
			});
		},

		// Check whether the user has a permission
		hasPermission(permission) {
			switch (permission) {
				case 'read':
					return this.get('allowRead') || false;
				case 'write':
					return this.get('allowWrite') || false;
				case 'delete':
					return this.get('allowDelete') || false;
				case 'admin':
					return this.get('allowAdmin') || false;
				default:
					return false;
			}
		},

		// Regenerate the user's API key (does not save)
		regenerateApiKey() {
			return this.set('apiKey', uuid());
		}

	// Model static methods
	}, {

		// Hash a password
		hashPassword(password) {
			const saltRounds = 15;
			return bcrypt.hash(password, saltRounds);
		},

		// Check a password against a hashed password
		checkPassword(password, hash) {
			return bcrypt.compare(password, hash);
		},

		// Get a mock user representing the system defaults
		getDefault() {
			const defaultPermissions = dashboard.settings.defaultPermissions;
			const defaultUser = new User({
				allowRead: (defaultPermissions ? defaultPermissions.allowRead : false),
				allowWrite: (defaultPermissions ? defaultPermissions.allowWrite : false),
				allowDelete: (defaultPermissions ? defaultPermissions.allowDelete : false),
				allowAdmin: (defaultPermissions ? defaultPermissions.allowAdmin : false)
			});
			defaultUser.isDefaultUser = true;
			defaultUser.save = () => {};
			return defaultUser;
		}

	});

}
