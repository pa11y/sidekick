'use strict';

/**
 * Initialise the Setting model.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @returns {Model} A Bookshelf model.
 */
function initSettingModel(dashboard) {

	// Storage point for in-memory settings
	let inMemorySettings;

	// Model prototypal methods
	const Setting = dashboard.database.Model.extend({
		tableName: 'settings',

		// Model initialization
		initialize() {

			// When a model is created...
			this.on('creating', () => {
				// Fill out automatic fields
				this.attributes.created_at = new Date();
			});

			// When a model is saved...
			this.on('saving', () => {
				// Fill out automatic fields
				this.attributes.updated_at = new Date();
			});

		},

		// Override default serialization so we can control output
		serialize() {
			return {
				id: this.get('id'),
				value: this.get('value'),
				meta: {
					dateCreated: this.get('created_at'),
					dateUpdated: this.get('updated_at')
				}
			};
		}

	// Model static methods
	}, {

		// Fetch all settings as an object with key/value pairs
		async fetchAsObject(forceRefresh = false) {
			if (!inMemorySettings || forceRefresh) {
				const settings = {};
				(await Setting.fetchAll()).toArray().forEach(setting => {
					settings[setting.get('id')] = setting;
				});
				inMemorySettings = settings;
			}
			return inMemorySettings;
		},

		// Clear the in-memory settings cache
		clearInMemoryCache() {
			inMemorySettings = undefined;
		},

		// Get the value of a single setting
		async get(settingId) {
			const setting = (await Setting.fetchAsObject())[settingId];
			return (setting ? setting.get('value') : undefined);
		},

		// Set a setting
		async set(settingId, value) {
			let setting = (await Setting.fetchAsObject())[settingId];
			value = JSON.stringify(value);

			// The setting already exists, update it
			if (setting) {
				setting.set('value', value);
				await setting.save();

			// The setting doesn't exist, create it
			} else {
				setting = new Setting({
					id: settingId,
					value
				});
				await setting.save(null, {
					method: 'insert',
					updated_at: new Date()
				}
				);
			}

			// Clear the in-memory cache
			this.clearInMemoryCache();
		}

	});

	return Setting;
}

module.exports = initSettingModel;
