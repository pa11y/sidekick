'use strict';

const joi = require('joi');
const shortid = require('shortid');

/**
 * Initialise the Site model.
 * @param {Dashboard} dashboard - A dashboard instance.
 * @returns {Model} A Bookshelf model.
 */
function initSiteModel(dashboard) {

	// Model validation schema
	const schema = joi.object().keys({
		name: joi.string().min(1).required(),
		base_url: joi.string().uri({
			scheme: [
				'http',
				'https'
			]
		}).required(),
		is_runnable: joi.boolean().required(),
		is_scheduled: joi.boolean().required(),
		schedule: [joi.string().min(1), null],
		pa11y_config: joi.object()
	});

	// Model prototypal methods
	const Site = dashboard.database.Model.extend({
		tableName: 'sites',

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

				// Encode the Pa11y config if it's changed
				if (this.hasChanged('pa11y_config')) {
					this.attributes.pa11y_config = JSON.stringify(this.attributes.pa11y_config);
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
				}, error => {
					if (error) {
						return reject(error);
					}
					resolve();
				});
			});
		},

		// Update the site with user-provided data
		async update(data) {
			if (data.name !== undefined) {
				this.set('name', data.name);
			}
			if (data.base_url !== undefined) {
				this.set('base_url', data.base_url);
			}
			if (data.is_runnable !== undefined) {
				this.set('is_runnable', Boolean(data.is_runnable));
			}
			if (data.is_scheduled !== undefined) {
				this.set('is_scheduled', Boolean(data.is_scheduled));
			}
			if (data.schedule !== undefined) {
				this.set('schedule', data.schedule);
			}
			if (data.pa11y_config !== undefined) {
				this.set('pa11y_config', data.pa11y_config);
			}
			await this.save();
			return this;
		},

		// Override default serialization so we can control output
		serialize() {
			return {
				id: this.get('id'),
				name: this.get('name'),
				baseUrl: this.get('base_url'),
				isRunnable: this.get('is_runnable'),
				isScheduled: this.get('is_scheduled'),
				schedule: this.get('schedule'),
				pa11yConfig: this.get('pa11y_config'),
				meta: {
					dateCreated: this.get('created_at'),
					dateUpdated: this.get('updated_at')
				}
			};
		}

	// Model static methods
	}, {

		// Create a site with user-provided data
		async create(data) {
			const site = new Site({
				name: data.name,
				base_url: data.base_url,
				is_runnable: Boolean(data.is_runnable),
				is_scheduled: Boolean(data.is_scheduled),
				schedule: data.schedule || null,
				pa11y_config: data.pa11y_config
			});
			await site.save();
			return site;
		},

		// Fetch all sites
		fetchAll() {
			return Site.collection().query(qb => {
				qb.orderBy('name', 'asc');
				qb.orderBy('created_at', 'asc');
			}).fetch();
		},

		// Fetch a site by id
		fetchOneById(siteId) {
			return Site.collection().query(qb => {
				qb.where('id', siteId);
			}).fetchOne();
		}

	});

	return Site;
}

module.exports = initSiteModel;
