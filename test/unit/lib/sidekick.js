/* eslint max-len: 'off' */
/* eslint max-statements: 'off' */
'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const path = require('path');
const sinon = require('sinon');

describe('lib/sidekick', () => {
	let adaro;
	let basePath;
	let compression;
	let cors;
	let defaults;
	let defaultViewData;
	let expectedMigrationConfig;
	let expectedSeedConfig;
	let express;
	let fs;
	let handleErrors;
	let knex;
	let log;
	let morgan;
	let notFound;
	let requireAll;
	let requireHeader;
	let resaveBrowserify;
	let resaveSass;
	let session;
	let sessionStore;
	let sidekick;
	let uuid;

	beforeEach(() => {

		basePath = path.resolve(`${__dirname}/../../..`);

		defaultViewData = {};
		mockery.registerMock(`${basePath}/view/defaults.json`, defaultViewData);

		adaro = require('../mock/adaro.mock');
		mockery.registerMock('adaro', adaro);

		compression = require('../mock/compression.mock');
		mockery.registerMock('compression', compression);

		cors = require('../mock/cors.mock');
		mockery.registerMock('../middleware/cors', cors);

		defaults = sinon.spy(require('lodash/defaultsDeep'));
		mockery.registerMock('lodash/defaultsDeep', defaults);

		express = require('../mock/express.mock');
		mockery.registerMock('express', express);

		expectedMigrationConfig = {
			directory: `${basePath}/data/migration`,
			tableName: 'migrations'
		};
		expectedSeedConfig = {
			directory: `${basePath}/data/seed`
		};

		fs = require('../mock/fs.mock');
		mockery.registerMock('fs', fs);

		handleErrors = require('../mock/handle-errors.mock');
		mockery.registerMock('../middleware/handle-errors', handleErrors);

		knex = require('../mock/knex.mock');
		mockery.registerMock('knex', knex);

		log = require('../mock/log.mock');

		morgan = require('../mock/morgan.mock');
		mockery.registerMock('morgan', morgan);

		notFound = require('../mock/not-found.mock');
		mockery.registerMock('../middleware/not-found', notFound);

		requireAll = sinon.stub();
		mockery.registerMock('require-all', requireAll);

		requireHeader = sinon.stub();
		requireHeader = require('../mock/require-header.mock');
		mockery.registerMock('require-header', requireHeader);

		resaveBrowserify = require('../mock/resave-browserify.mock');
		mockery.registerMock('resave-browserify', resaveBrowserify);

		resaveSass = require('../mock/resave-sass.mock');
		mockery.registerMock('resave-sass', resaveSass);

		session = require('../mock/express-session.mock');
		mockery.registerMock('express-session', session);

		sessionStore = require('../mock/connect-session-knex.mock');
		mockery.registerMock('connect-session-knex', sessionStore);

		uuid = sinon.stub().returns('mock-uuid');
		mockery.registerMock('uuid/v4', uuid);

		sidekick = require(basePath);
	});

	it('exports a function', () => {
		assert.isFunction(sidekick);
	});

	it('has a `defaults` property', () => {
		assert.isObject(sidekick.defaults);
	});

	describe('.defaults', () => {
		let defaults;

		beforeEach(() => {
			defaults = sidekick.defaults;
		});

		it('has a `bundles` property', () => {
			assert.isObject(defaults.bundles);
		});

		it('has a `bundles.javascript` property', () => {
			assert.isObject(defaults.bundles.javascript);
		});

		it('has a `bundles.sass` property', () => {
			assert.isObject(defaults.bundles.sass);
		});

		it('has a `database` property', () => {
			assert.strictEqual(defaults.database, 'postgres://localhost:5432/pa11y_sidekick');
		});

		it('has an `environment` property', () => {
			assert.strictEqual(defaults.environment, 'development');
		});

		it('has a `log` property', () => {
			assert.isObject(defaults.log);
		});

		it('has a `log.debug` method', () => {
			assert.isFunction(defaults.log.debug);
		});

		it('has a `log.error` method', () => {
			assert.isFunction(defaults.log.error);
		});

		it('has a `log.info` method', () => {
			assert.isFunction(defaults.log.info);
		});

		it('has a `log.request` stream', () => {
			assert.isObject(defaults.log.request);
			assert.isFunction(defaults.log.request.write);
		});

		it('has a `log.verbose` method', () => {
			assert.isFunction(defaults.log.verbose);
		});

		it('has a `log.warn` method', () => {
			assert.isFunction(defaults.log.warn);
		});

		it('has a `port` property', () => {
			assert.strictEqual(defaults.port, 8080);
		});

		it('has a `requestLogFormat` property', () => {
			assert.strictEqual(defaults.requestLogFormat, 'combined');
		});

		it('has a `sessionSecret` property', () => {
			assert.isNull(defaults.sessionSecret);
		});

		it('has a `start` property', () => {
			assert.isTrue(defaults.start);
		});

	});

	describe('sidekick(options)', () => {
		let apiControllers;
		let frontEndControllers;
		let models;
		let returnedPromise;
		let userOptions;
		let mockSettings;
		let viewHelpers;

		beforeEach(() => {

			apiControllers = {
				foo: sinon.stub(),
				bar: sinon.stub()
			};
			requireAll.withArgs(`${basePath}/controller/api`).returns(apiControllers);

			frontEndControllers = {
				foo: sinon.stub(),
				bar: sinon.stub()
			};
			requireAll.withArgs(`${basePath}/controller/front-end`).returns(frontEndControllers);

			mockSettings = {
				example: 'mock-setting'
			};

			models = {
				foo: sinon.stub().returns({
					fooModel: true
				}),
				bar: sinon.stub().returns({
					barModel: true
				}),
				settings: sinon.stub().returns({
					get: sinon.stub().resolves(mockSettings)
				})
			};
			requireAll.withArgs(`${basePath}/model`).returns(models);

			viewHelpers = {
				foo: () => {},
				bar: () => {}
			};
			requireAll.withArgs(`${basePath}/view/helper`).returns(viewHelpers);

			userOptions = {
				database: 'postgres://localhost:1234/foo',
				environment: 'test',
				log: log,
				port: 1234,
				requestLogFormat: 'rlf',
				sessionSecret: 'mock-secret'
			};
			returnedPromise = sidekick(userOptions);
		});

		it('returns a promise', () => {
			assert.instanceOf(returnedPromise, Promise);
		});

		describe('.then()', () => {
			let dashboard;

			beforeEach(() => returnedPromise.then(value => {
				dashboard = value;
			}));

			it('defaults the options using `sidekick.defaults`', () => {
				assert.isObject(defaults.firstCall.args[0]);
				assert.strictEqual(defaults.firstCall.args[1], userOptions);
				assert.strictEqual(defaults.firstCall.args[2], sidekick.defaults);
			});

			it('creates a Knex client with the database option', () => {
				assert.calledOnce(knex);
				assert.isObject(knex.firstCall.args[0]);
				assert.strictEqual(knex.firstCall.args[0].client, 'pg');
				assert.strictEqual(knex.firstCall.args[0].connection, userOptions.database);
			});

			it('loads all of the models', () => {
				assert.calledWithExactly(requireAll, `${basePath}/model`);
			});

			it('creates an Express application', () => {
				assert.calledOnce(express);
			});

			it('sets the Express application `env` to the environment option', () => {
				assert.calledWithExactly(express.mockApp.set, 'env', userOptions.environment);
			});

			it('sets the Express application `json spaces` configuration', () => {
				assert.calledWithExactly(express.mockApp.set, 'json spaces', 4);
			});

			it('disables the `X-Powered-By` header', () => {
				assert.calledWithExactly(express.mockApp.disable, 'x-powered-by');
			});

			it('enables strict routing', () => {
				assert.calledWithExactly(express.mockApp.enable, 'strict routing');
			});

			it('enables case sensitive routing', () => {
				assert.calledWithExactly(express.mockApp.enable, 'case sensitive routing');
			});

			it('creates a Knex session store, passing in the created Knex client', () => {
				assert.calledOnce(sessionStore.MockKnexSessionStore);
				assert.calledWithNew(sessionStore.MockKnexSessionStore);
				assert.calledWith(sessionStore.MockKnexSessionStore, {
					knex: knex.mockDatabase
				});
			});

			it('creates and mounts a session middleware with the Knex session store', () => {
				assert.calledOnce(session);
				assert.calledWith(session, {
					cookie: {
						maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
					},
					name: 'sidekick.sid',
					resave: false,
					saveUninitialized: false,
					secret: userOptions.sessionSecret,
					store: sessionStore.mockSessionStore
				});
				assert.calledWithExactly(express.mockApp.use, session.mockMiddleware);
			});

			it('creates and mounts a morgan request logger', () => {
				assert.calledOnce(morgan);
				assert.calledWithExactly(morgan, userOptions.requestLogFormat, {
					stream: log.request
				});
				assert.calledWithExactly(express.mockApp.use, morgan.mockMiddleware);
			});

			it('creates and mounts a CORS middleware', () => {
				assert.calledOnce(cors);
				assert.calledWithExactly(express.mockApp.use, cors.mockMiddleware);
			});

			it('creates and mounts a compression middleware', () => {
				assert.calledOnce(compression);
				assert.calledWithExactly(compression);
				assert.calledWithExactly(express.mockApp.use, compression.mockMiddleware);
			});

			it('creates and mounts a static file serving middleware', () => {
				assert.calledOnce(express.static);
				assert.calledWith(express.static, `${basePath}/public`, {
					maxAge: 0
				});
				assert.calledWithExactly(express.mockApp.use, express.mockStaticMiddleware);
			});

			it('extends the view locals with default values', () => {
				assert.strictEqual(defaults.secondCall.args[0], express.mockApp.locals);
				assert.strictEqual(defaults.secondCall.args[1], defaultViewData);
			});

			it('deletes any existing compiled JavaScript bundles', () => {
				assert.calledWithExactly(fs.unlinkSync, `${basePath}/public/main.js`);
			});

			it('creates and mounts a Resave Browserify middleware with the expected options', () => {
				assert.calledOnce(resaveBrowserify);
				assert.isObject(resaveBrowserify.firstCall.args[0]);
				const resaveOptions = resaveBrowserify.firstCall.args[0];
				assert.strictEqual(resaveOptions.basePath, `${basePath}/view/script`);
				assert.deepEqual(resaveOptions.bundles, sidekick.defaults.bundles.javascript);
				assert.isNull(resaveOptions.savePath);
				assert.calledWithExactly(express.mockApp.use, resaveBrowserify.mockResaver);
			});

			it('deletes any existing compiled Sass bundles', () => {
				assert.calledWithExactly(fs.unlinkSync, `${basePath}/public/main.css`);
			});

			it('creates and mounts a Resave Sass middleware with the expected options', () => {
				assert.calledOnce(resaveSass);
				assert.isObject(resaveSass.firstCall.args[0]);
				const resaveOptions = resaveSass.firstCall.args[0];
				assert.strictEqual(resaveOptions.basePath, `${basePath}/view/style`);
				assert.deepEqual(resaveOptions.bundles, sidekick.defaults.bundles.sass);
				assert.isNull(resaveOptions.savePath);
				assert.calledWithExactly(express.mockApp.use, resaveSass.mockResaver);
			});

			it('sets the `views` path', () => {
				assert.calledWithExactly(express.mockApp.set, 'views', `${basePath}/view`);
			});

			it('loads all view helpers', () => {
				assert.calledWithExactly(requireAll, `${basePath}/view/helper`);
			});

			it('creates an Adaro dust renderer with the loaded view helpers', () => {
				assert.calledOnce(adaro.dust);
				assert.isObject(adaro.dust.firstCall.args[0]);
				assert.isArray(adaro.dust.firstCall.args[0].helpers);
				assert.strictEqual(adaro.dust.firstCall.args[0].helpers[0], viewHelpers.foo);
				assert.strictEqual(adaro.dust.firstCall.args[0].helpers[1], viewHelpers.bar);
			});

			it('sets the "dust" view renderer to the created Adaro renderer', () => {
				assert.calledWithExactly(express.mockApp.engine, 'dust', adaro.mockRenderer);
			});

			it('sets the default view engine to "dust"', () => {
				assert.calledWithExactly(express.mockApp.set, 'view engine', 'dust');
			});

			it('creates and mounts require-header middleware for the `/api` route', () => {
				assert.calledOnce(requireHeader);
				assert.calledWithExactly(requireHeader, 'User-Agent');
				assert.calledWithExactly(express.mockApp.use, '/api', requireHeader.mockMiddleware);
			});

			it('loads all of the API controllers and calls them with the resolved object', () => {
				assert.calledWithExactly(requireAll, `${basePath}/controller/api`);
				assert.calledOnce(apiControllers.foo);
				assert.calledWithExactly(apiControllers.foo, dashboard);
				assert.calledOnce(apiControllers.bar);
				assert.calledWithExactly(apiControllers.bar, dashboard);
			});

			it('creates and mounts not-found middleware for the `/api` route', () => {
				assert.called(notFound);
				assert.calledWithExactly(express.mockApp.use, '/api', notFound.mockMiddleware);
			});

			it('creates and mounts JSON handle-errors middleware for the `/api` route', () => {
				assert.calledOnce(handleErrors.json);
				assert.calledWithExactly(handleErrors.json, dashboard);
				assert.calledWithExactly(express.mockApp.use, '/api', handleErrors.mockJsonMiddleware);
			});

			it('loads all of the front end controllers and calls them with the resolved object', () => {
				assert.calledWithExactly(requireAll, `${basePath}/controller/front-end`);
				assert.calledOnce(frontEndControllers.foo);
				assert.calledWithExactly(frontEndControllers.foo, dashboard);
				assert.calledOnce(frontEndControllers.bar);
				assert.calledWithExactly(frontEndControllers.bar, dashboard);
			});

			it('creates and mounts not-found middleware for the default route', () => {
				assert.called(notFound);
				assert.calledWithExactly(express.mockApp.use, notFound.mockMiddleware);
			});

			it('creates and mounts HTML handle-errors middleware for the default route', () => {
				assert.calledOnce(handleErrors.html);
				assert.calledWithExactly(handleErrors.html, dashboard);
				assert.calledWithExactly(express.mockApp.use, handleErrors.mockHtmlMiddleware);
			});

			it('mounts middleware and controllers in the correct order', () => {
				assert.callOrder(
					express.mockApp.use.withArgs(morgan.mockMiddleware).named('morgan'),
					express.mockApp.use.withArgs(cors.mockMiddleware).named('cors'),
					express.mockApp.use.withArgs(compression.mockMiddleware).named('compression'),
					express.mockApp.use.withArgs(express.mockStaticMiddleware).named('static'),
					express.mockApp.use.withArgs(session.mockMiddleware).named('session'),
					express.mockApp.use.withArgs(resaveBrowserify.mockResaver).named('browserify'),
					express.mockApp.use.withArgs(resaveSass.mockResaver).named('sass'),
					express.mockApp.use.withArgs('/api', requireHeader.mockMiddleware).named('apiRequireHeader'),
					express.mockApp.use.withArgs('/api', notFound.mockMiddleware).named('apiNotFound'),
					express.mockApp.use.withArgs('/api', handleErrors.mockJsonMiddleware).named('apiErrorHandler'),
					express.mockApp.use.withArgs(notFound.mockMiddleware).named('frontEndNotFound'),
					express.mockApp.use.withArgs(handleErrors.mockHtmlMiddleware).named('frontEndErrorHandler')
				);
			});

			it('loads application settings from the database', () => {
				const settingsModel = models.settings.firstCall.returnValue;
				assert.calledOnce(settingsModel.get);
				assert.calledWith(settingsModel.get);
			});

			it('starts the Express application on the port in `options.port`', () => {
				assert.calledOnce(express.mockApp.listen);
				assert.calledWith(express.mockApp.listen, dashboard.options.port);
			});

			it('logs that the application has started', () => {
				assert.calledWithExactly(log.info, 'Pa11y Sidekick started', {
					port: express.mockAddress.port
				});
			});

			it('resolves with an object', () => {
				assert.isObject(dashboard);
			});

			describe('resolved object', () => {

				it('has an `address` property set to the address of the created Express server', () => {
					assert.isDefined(dashboard.address);
					assert.strictEqual(dashboard.address, `http://localhost:${express.mockAddress.port}`);
				});

				it('has an `options` property set to the defaulted options', () => {
					assert.strictEqual(dashboard.options, defaults.firstCall.returnValue);
				});

				it('has an `environment` property set to the environment option', () => {
					assert.strictEqual(dashboard.environment, dashboard.options.environment);
				});

				it('has a `log` property set to the log option', () => {
					assert.strictEqual(dashboard.log, dashboard.options.log);
				});

				it('has a `database` property set to the created Knex client', () => {
					assert.isDefined(dashboard.database);
					assert.strictEqual(dashboard.database, knex.mockDatabase);
				});

				it('has a `model` property set to a map of the loaded models', () => {
					assert.isObject(dashboard.model);
					assert.strictEqual(dashboard.model.foo, models.foo.firstCall.returnValue);
					assert.strictEqual(dashboard.model.bar, models.bar.firstCall.returnValue);
				});

				it('has a `migrations` property', () => {
					assert.isObject(dashboard.migrations);
				});

				it('has a `migrations.create` method', () => {
					assert.isFunction(dashboard.migrations.create);
				});

				describe('.migrations.create(name)', () => {
					let migrationMakeValue;
					let returnedPromise;

					beforeEach(() => {
						migrationMakeValue = {};
						dashboard.database.migrate.make.resolves(migrationMakeValue);
						returnedPromise = dashboard.migrations.create('foo');
					});

					it('returns a promise', () => {
						assert.isObject(returnedPromise);
						assert.isFunction(returnedPromise.then);
					});

					describe('.then()', () => {
						let resolvedValue;

						beforeEach(() => returnedPromise.then(value => {
							resolvedValue = value;
						}));

						it('creates a migration with the expected options', () => {
							assert.calledOnce(dashboard.database.migrate.make);
							assert.calledWith(dashboard.database.migrate.make, 'foo');
							assert.deepEqual(dashboard.database.migrate.make.firstCall.args[1], expectedMigrationConfig);
						});

						it('resolves with the result of the migration creation', () => {
							assert.strictEqual(resolvedValue, migrationMakeValue);
						});

					});

				});

				it('has a `migrations.latest` method', () => {
					assert.isFunction(dashboard.migrations.latest);
				});

				describe('.migrations.latest()', () => {
					let migrationLatestValue;
					let returnedPromise;

					beforeEach(() => {
						migrationLatestValue = {};
						dashboard.database.migrate.latest.resolves(migrationLatestValue);
						returnedPromise = dashboard.migrations.latest();
					});

					it('returns a promise', () => {
						assert.isObject(returnedPromise);
						assert.isFunction(returnedPromise.then);
					});

					describe('.then()', () => {
						let resolvedValue;

						beforeEach(() => returnedPromise.then(value => {
							resolvedValue = value;
						}));

						it('migrates to the latest version with the expected options', () => {
							assert.calledOnce(dashboard.database.migrate.latest);
							assert.deepEqual(dashboard.database.migrate.latest.firstCall.args[0], expectedMigrationConfig);
						});

						it('resolves with the result of the migration', () => {
							assert.strictEqual(resolvedValue, migrationLatestValue);
						});

					});

				});

				it('has a `migrations.rollback` method', () => {
					assert.isFunction(dashboard.migrations.rollback);
				});

				describe('.migrations.rollback()', () => {
					let migrationRollbackValue;
					let returnedPromise;

					beforeEach(() => {
						migrationRollbackValue = {};
						dashboard.database.migrate.rollback.resolves(migrationRollbackValue);
						returnedPromise = dashboard.migrations.rollback();
					});

					it('returns a promise', () => {
						assert.isObject(returnedPromise);
						assert.isFunction(returnedPromise.then);
					});

					describe('.then()', () => {
						let resolvedValue;

						beforeEach(() => returnedPromise.then(value => {
							resolvedValue = value;
						}));

						it('rolls back the last migration with the expected options', () => {
							assert.calledOnce(dashboard.database.migrate.rollback);
							assert.deepEqual(dashboard.database.migrate.rollback.firstCall.args[0], expectedMigrationConfig);
						});

						it('resolves with the result of the rollback', () => {
							assert.strictEqual(resolvedValue, migrationRollbackValue);
						});

					});

				});

				it('has a `migrations.seed` method', () => {
					assert.isFunction(dashboard.migrations.seed);
				});

				describe('.migrations.seed()', () => {
					let returnedPromise;
					let seedRunValue;

					beforeEach(() => {
						seedRunValue = {};
						dashboard.database.seed.run.resolves(seedRunValue);
						returnedPromise = dashboard.migrations.seed();
					});

					it('returns a promise', () => {
						assert.isObject(returnedPromise);
						assert.isFunction(returnedPromise.then);
					});

					describe('.then()', () => {
						let resolvedValue;

						beforeEach(() => returnedPromise.then(value => {
							resolvedValue = value;
						}));

						it('seeds the database with the expected options', () => {
							assert.calledOnce(dashboard.database.seed.run);
							assert.deepEqual(dashboard.database.seed.run.firstCall.args[0], expectedSeedConfig);
						});

						it('resolves with the result of the seed', () => {
							assert.strictEqual(resolvedValue, seedRunValue);
						});

					});

				});

				it('has an `app` property set to the created Express application', () => {
					assert.isDefined(dashboard.app);
					assert.strictEqual(dashboard.app, express.mockApp);
				});

				it('has a `server` property set to the created Express server', () => {
					assert.isDefined(dashboard.server);
					assert.strictEqual(dashboard.server, express.mockApp.listen.firstCall.returnValue);
				});

				it('has a `settings` property set to the loaded settings object', () => {
					assert.strictEqual(dashboard.settings, mockSettings);
				});

			});

		});

		describe('when `options.sessionSecret` is not set', () => {

			beforeEach(() => {
				delete userOptions.sessionSecret;
				session.reset();
				returnedPromise = sidekick(userOptions);
			});

			it('creates and mounts a session middleware with a UUID as a secret', () => {
				assert.calledOnce(session);
				assert.strictEqual(session.firstCall.args[0].secret, 'mock-uuid');
			});

		});

		describe('when `options.start` is `false`', () => {

			beforeEach(() => {
				userOptions.start = false;
				models.settings.firstCall.returnValue.get.reset();
				models.settings.reset();
				express.mockApp.listen.reset();
				returnedPromise = sidekick(userOptions);
			});

			describe('.then()', () => {
				let dashboard;

				beforeEach(() => returnedPromise.then(value => {
					dashboard = value;
				}));

				it('does not load application settings from the database', () => {
					const settingsModel = models.settings.firstCall.returnValue;
					assert.notCalled(settingsModel.get);
				});

				it('does not start the Express application', () => {
					assert.notCalled(express.mockApp.listen);
				});

				describe('resolved object', () => {

					it('has an `address` property set to `null`', () => {
						assert.isNull(dashboard.address);
					});

					it('has a `server` property set to `null`', () => {
						assert.isNull(dashboard.server);
					});

				});

			});

		});

		describe('when `options.environment` is "production"', () => {

			beforeEach(() => {
				userOptions.environment = 'production';
				resaveBrowserify.reset();
				resaveSass.reset();
				returnedPromise = sidekick(userOptions);
			});

			describe('.then()', () => {

				beforeEach(() => returnedPromise.then());

				it('creates the Resave Browserify middleware with a save path', () => {
					const resaveOptions = resaveBrowserify.firstCall.args[0];
					assert.strictEqual(resaveOptions.savePath, `${basePath}/public`);
				});

				it('creates the Resave Sass middleware with a save path', () => {
					const resaveOptions = resaveSass.firstCall.args[0];
					assert.strictEqual(resaveOptions.savePath, `${basePath}/public`);
				});

				it('creates and mounts a static file serving middleware with caching', () => {
					assert.calledWith(express.static, `${basePath}/public`, {
						maxAge: 604800000
					});
				});

			});

		});

		describe('when the Express application errors on startup', () => {

			describe('.catch()', () => {
				let caughtError;
				let expressError;

				beforeEach(done => {
					expressError = new Error('Express failed to start');
					express.mockApp.listen.yieldsAsync(expressError);
					log.info.reset();
					sidekick(userOptions).then(done).catch(error => {
						caughtError = error;
						done();
					});
				});

				it('fails with the Express error', () => {
					assert.strictEqual(caughtError, expressError);
				});

				it('does not log that the application has started', () => {
					assert.neverCalledWith(log.info, 'Pa11y Sidekick started');
				});

				it('logs the error', () => {
					assert.calledWithExactly(log.error, caughtError.stack);
				});

			});

		});

	});

});
