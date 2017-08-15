/* eslint no-underscore-dangle: 'off' */
'use strict';

const shortid = require('shortid');

module.exports = initModel;

function initModel(dashboard, models) {

	// Model prototypal methods
	const Settings = models.Settings = dashboard.database.Model.extend({
		tableName: 'settings',

		// Model initialization
		initialize() {

			// When a model is created...
			this.on('creating', () => {
				// Fill out automatic fields
				this.attributes.id = shortid.generate();
			});

		}

	});

}
