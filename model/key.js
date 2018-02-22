'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const joi = require('joi');

/**
 * Initialise the Key model.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @returns {Model} A Bookshelf model.
 */
function initKeyModel(dashboard) {

	// Model validation schema
	const schema = joi.object().keys({
		user_id: joi.string().required(),
		secret: joi.string().min(20).required(),
		description: joi.string().required()
	});

	// Model prototypal methods
	const Key = dashboard.database.Model.extend({
		tableName: 'keys',

		// Model initialization
		initialize() {

			// When a model is created...
			this.on('creating', () => {

				// Fill out automatic fields
				this.attributes.id = Key.generateSecret();
				this.attributes.created_at = new Date();

			});

			// When a model is saved...
			this.on('saving', async () => {

				// Fill out automatic fields
				this.attributes.updated_at = new Date();

				// Trim the description if it's changed
				if (typeof this.attributes.description === 'string' && this.hasChanged('description')) {
					this.attributes.description = this.attributes.description.trim();
				}

				// Validate the model
				await this.validateSave();

				// Hash the secret if it's changed
				if (this.hasChanged('secret')) {
					this.attributes.secret = await Key.hashSecret(this.attributes.secret);
				}

			});

		},

		// Validate the model before saving
		validateSave() {
			// Validate against the schema
			return new Promise((resolve, reject) => {
				joi.validate(this.attributes, schema, {
					abortEarly: false,
					allowUnknown: true
				}, error => {
					if (error) {
						return reject(error);
					}
					resolve();
				});
			});
		},

		// Update the key with user-provided data
		async update(data) {
			if (data.description !== undefined) {
				this.set('description', data.description);
			}
			await this.save();
			return this;
		},

		// Override default serialization so we can control output
		serialize() {
			return {
				id: this.get('id'),
				user: this.get('user_id'),
				description: this.get('description'),
				meta: {
					dateCreated: this.get('created_at'),
					dateUpdated: this.get('updated_at')
				}
			};
		},

		// User relationship
		user() {
			return this.belongsTo(dashboard.model.User);
		}

	// Model static methods
	}, {

		// Generate a secret
		generateSecret() {
			return crypto.randomBytes(20).toString('hex');
		},

		// Hash a secret
		hashSecret(secret) {
			const saltRounds = 5;
			return bcrypt.hash(secret, saltRounds);
		},

		// Check a secret against a hashed secret
		checkSecret(secret, hash) {
			return bcrypt.compare(secret, hash);
		},

		// Create a key with user-provided data
		async create(data) {
			const key = new Key({
				user_id: data.user_id,
				description: data.description,
				secret: data.secret
			});
			await key.save();
			return key;
		},

		// Fetch a key by ID
		fetchOneById(keyId) {
			return Key.collection().query(qb => {
				qb.where('id', keyId);
			}).fetchOne();
		},

		// Fetch a key by ID and user ID
		fetchOneByIdAndUserId(keyId, userId) {
			return Key.collection().query(qb => {
				qb.where('id', keyId);
				qb.where('user_id', userId);
			}).fetchOne({
				withRelated: ['user']
			});
		},

		// Fetch keys by user ID
		fetchByUserId(userId) {
			return Key.collection().query(qb => {
				qb.where('user_id', userId);
				qb.orderBy('description', 'asc');
			}).fetch({
				withRelated: ['user']
			});
		}

	});

	return Key;
}

module.exports = initKeyModel;
