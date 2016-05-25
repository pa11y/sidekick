//
// Hello there! You've found your way to the core library for
// Pa11y Sidekick, nice one :)
//
// I really hope you're here to contribute, we love seeing new
// people. If there's anything you don't understand then get in
// touch – we're a friendly bunch.
//
// This file is heavily commented to help you understand what's
// going on. If you're updating this file *please* make sure
// you update the comments to reflect the new code.
//
'use strict';

const adaro = require('adaro');
const defaults = require('lodash/defaultsDeep');
const express = require('express');
const fs = require('fs');
const knex = require('knex');
const morgan = require('morgan');
const path = require('path');
const requireAll = require('require-all');
const resaveBrowserify = require('resave-browserify');
const resaveSass = require('resave-sass');
const values = require('lodash/values');

// This is the path config, we're setting these up
// here so the rest of the code isn't littered with
// `path.resolve` calls and string concatenation
const basePath = path.resolve(`${__dirname}/..`);
const paths = {
	controllers: `${basePath}/controller`,
	javascript: `${basePath}/view/script`,
	migrations: `${basePath}/data/migration`,
	models: `${basePath}/model`,
	public: `${basePath}/public`,
	seeds: `${basePath}/data/seed`,
	styles: `${basePath}/view/style`,
	viewHelpers: `${basePath}/view/helper`,
	views: `${basePath}/view`
};

// Used for migrations and seeding
const databaseMigrationConfig = {
	directory: paths.migrations,
	tableName: 'migrations'
};
const databaseSeedConfig = {
	directory: paths.seeds
};

// Just empty functions to use as default
// configuration and arguments
const noop = () => {};
const noopStream = {
	write: noop
};

// Here's the exports. `sidekick` is defined further down the
// file and is the function that actually starts to do things
module.exports = sidekick;

// The default configuration object. This is extended with
// whatever configurations the user passes in from the
// command line
module.exports.defaults = {
	bundles: {
		javascript: {
			'/main.js': 'main.js'
		},
		sass: {
			'/main.css': 'main.scss'
		}
	},
	database: 'postgres://localhost:5432/pa11y_sidekick_alpha',
	environment: 'development',
	log: {
		debug: noop,
		error: noop,
		info: noop,
		request: noopStream,
		verbose: noop,
		warn: noop
	},
	port: 8080,
	requestLogFormat: 'combined',
	start: true
};

// Here we are. This function does all the setup and decides
// whether to start the application. It accepts options in
// the form of an object and returns a Promise
function sidekick(options) {

	// Default the passed in options so we know we've got
	// everything that we need to start up
	options = defaults({}, options, module.exports.defaults);

	// This is the dashboard object. Not much going on yet –
	// it's augmented by more functions below
	const dashboard = {
		address: null,
		environment: options.environment,
		log: options.log,
		options,
		server: null
	};

	// These properties are important, as is the call
	// order. We'll explain the actual functions later
	// on, but they do a lot of the initial set up
	dashboard.database = createKnexDatabase(dashboard);
	dashboard.model = loadModels(dashboard);
	dashboard.app = createExpressApplication(dashboard);

	// These functions don't return anything, and
	// they're named pretty descriptively. We just pass
	// the dashboard object around and make changes to
	// it until we're ready to start up
	configureJavaScript(dashboard);
	configureStyles(dashboard);
	configureViews(dashboard);
	loadControllers(dashboard);

	// This is how we expose the migration methods.
	// Really these are only used by files in the
	// `scripts` folder. Mostly they just kind of proxy
	// Knex migration functions but with a predefined
	// configuration
	dashboard.migrations = {
		create: createMigration.bind(null, dashboard),
		latest: migrateUp.bind(null, dashboard),
		rollback: migrateDown.bind(null, dashboard),
		seed: seedDatabase.bind(null, dashboard)
	};

	// The `start` option defines whether the application
	// should actually start. Normally we want it to
	// start up, but sometimes (for example in the
	// migration scripts) we only want to set it up so
	// we can make changes to the database
	if (options.start) {
		return promiseToStart(dashboard);
	}
	return Promise.resolve(dashboard);
}

// This function creates a Knex database client, which is
// used by the models and migrations. The connection string
// is passed in as an option
function createKnexDatabase(dashboard) {
	return knex({
		client: 'pg',
		connection: dashboard.options.database
	});
}

// This function loads all of the models in the `model`
// folder. The reason it looks complicated is because it has
// to build a key/value map of the models and call each of
// them with the dashboard to initialise them
function loadModels(dashboard) {
	const modelModules = requireAll(paths.models);
	const models = {};
	Object.keys(modelModules).map(modelName => {
		models[modelName] = modelModules[modelName](dashboard);
	});
	return models;
}

// This function creates our Express application and applies
// some of the basic configurations. It also sets up the static
// middleware early on in the start up
function createExpressApplication(dashboard) {
	const app = express();

	app.set('env', dashboard.environment);
	app.disable('x-powered-by');
	app.enable('strict routing');
	app.enable('case sensitive routing');

	// Set up a morgan request logger. This outputs request
	// information, useful for debugging
	app.use(morgan(dashboard.options.requestLogFormat, {
		stream: dashboard.log.request
	}));

	// Set up an Express static middleware for serving files
	app.use(express.static(paths.public, {
		maxAge: (dashboard.environment === 'production' ? 604800000 : 0)
	}));

	return app;
}

// This function configures the Express application's view
// engine as well as loading in the default view data. We use
// Adaro for rendering Dust templates as it allows us to load
// custom helpers easily
function configureViews(dashboard) {
	const app = dashboard.app;
	defaults(app.locals, require(`${paths.views}/defaults.json`));
	app.set('views', paths.views);
	app.engine('dust', adaro.dust({
		helpers: values(requireAll(paths.viewHelpers)).concat('dustjs-helpers')
	}));
	app.set('view engine', 'dust');
}

// This function configures the client-side JavaScript
// compilation. We use Browserify (through Resave Browserify)
// for this. If you're interested in how it works, it's best
// to read the Resave Browserify docs.
//
// We also remove any existing bundles that might have got
// left in the public folder. Without this, the JavaScript
// may not update
function configureJavaScript(dashboard) {
	removeFile(`${paths.public}/main.js`);
	dashboard.app.use(resaveBrowserify({
		basePath: paths.javascript,
		bundles: dashboard.options.bundles.javascript,
		savePath: (dashboard.environment === 'production' ? paths.public : null)
	}));
}

// This function configures the site's Sass compilation. If
// you're interested in how it works, it's best to read the
// Resave Sass docs.
//
// We also remove any existing bundles that might have got
// left in the public folder. Without this, the styles may
// not update
function configureStyles(dashboard) {
	removeFile(`${paths.public}/main.css`);
	dashboard.app.use(resaveSass({
		basePath: paths.styles,
		bundles: dashboard.options.bundles.sass,
		savePath: (dashboard.environment === 'production' ? paths.public : null)
	}));
}

// This is a utility function used in the JavaScript/Sass
// compilation functions. It just prevents `fs.unlinkSync`
// from throwing – we don't care if it fails
function removeFile(filePath) {
	try {
		fs.unlinkSync(filePath);
	} catch (error) {}
}

// This function loads all of the controllers and initialises
// them by passing in the dashboard object
function loadControllers(dashboard) {
	values(requireAll(paths.controllers)).forEach(initController => initController(dashboard));
}

// A simple proxy function to create a Knex migration with
// our migration config passed in. Returns a Promise
function createMigration(dashboard, name) {
	return dashboard.database.migrate.make(name, databaseMigrationConfig);
}

// A simple proxy function to run Knex migrations with our
// migration config passed in. Returns a Promise
function migrateUp(dashboard) {
	return dashboard.database.migrate.latest(databaseMigrationConfig);
}

// A simple proxy function to rollback a Knex migration with
// our migration config passed in. Returns a Promise
function migrateDown(dashboard) {
	return dashboard.database.migrate.rollback(databaseMigrationConfig);
}

// A simple proxy function to seed the database with Knex and
// our seed config passed in. Returns a Promise
function seedDatabase(dashboard) {
	return dashboard.database.seed.run(databaseSeedConfig);
}

// This function starts the Express application and is
// mostly a convenient promise-based wrapper around
// `express.listen`. Returns a Promise
function promiseToStart(dashboard) {
	return new Promise((resolve, reject) => {

		// Start the Express application and capture the
		// server object that it returns
		dashboard.server = dashboard.app.listen(dashboard.options.port, error => {

			if (error) {
				dashboard.log.error(error.stack);
				return reject(error);
			}

			// We have to get the port here because sometimes
			// the port in the options is `null`. If that's
			// the case then a random port is assigned and we
			// want to tell the user what it is
			const port = dashboard.server.address().port;
			dashboard.address = `http://localhost:${port}`;
			dashboard.log.info('Pa11y Sidekick started', {
				port: port
			});

			resolve(dashboard);

		});

	});
}
