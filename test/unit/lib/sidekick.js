// jscs:disable maximumLineLength
'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const path = require('path');
const sinon = require('sinon');

describe('lib/sidekick', () => {
	let adaro;
	let basePath;
	let defaults;
	let defaultViewData;
	let expectedMigrationConfig;
	let expectedSeedConfig;
	let express;
	let fs;
	let knex;
	let log;
	let resaveBrowserify;
	let resaveSass;
	let sidekick;
	let requireAll;

	beforeEach(() => {

		basePath = path.resolve(`${__dirname}/../../..`);

		defaultViewData = {};
		mockery.registerMock(`${basePath}/view/defaults.json`, defaultViewData);

		adaro = require('../mock/adaro.mock');
		mockery.registerMock('adaro', adaro);

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

		knex = require('../mock/knex.mock');
		mockery.registerMock('knex', knex);

		log = require('../mock/log.mock');

		requireAll = sinon.stub();
		mockery.registerMock('require-all', requireAll);

		resaveBrowserify = require('../mock/resave-browserify.mock');
		mockery.registerMock('resave-browserify', resaveBrowserify);

		resaveSass = require('../mock/resave-sass.mock');
		mockery.registerMock('resave-sass', resaveSass);

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
			assert.strictEqual(defaults.database, 'postgres://localhost:5432/pa11y_sidekick_alpha');
		});

		it('has an `environment` property', () => {
			assert.strictEqual(defaults.environment, 'production');
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

		it('has a `log.warn` method', () => {
			assert.isFunction(defaults.log.warn);
		});

		it('has a `port` property', () => {
			assert.strictEqual(defaults.port, 8080);
		});

		it('has a `start` property', () => {
			assert.isTrue(defaults.start);
		});

	});

	describe('sidekick(options)', () => {
		let controllers;
		let models;
		let returnedPromise;
		let userOptions;
		let viewHelpers;

		beforeEach(() => {

			controllers = {
				foo: sinon.stub(),
				bar: sinon.stub()
			};
			requireAll.withArgs(`${basePath}/controller`).returns(controllers);

			models = {
				foo: sinon.stub().returns({
					fooModel: true
				}),
				bar: sinon.stub().returns({
					barModel: true
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
				port: 1234
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

			it('creates an Knex client with the database option', () => {
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

			it('disables the `X-Powered-By` header', () => {
				assert.calledWithExactly(express.mockApp.disable, 'x-powered-by');
			});

			it('enables strict routing', () => {
				assert.calledWithExactly(express.mockApp.enable, 'strict routing');
			});

			it('enables case sensitive routing', () => {
				assert.calledWithExactly(express.mockApp.enable, 'case sensitive routing');
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

			it('loads all of the controllers and calls them with the resolved object', () => {
				assert.calledWithExactly(requireAll, `${basePath}/controller`);
				assert.calledOnce(controllers.foo);
				assert.calledWithExactly(controllers.foo, dashboard);
				assert.calledOnce(controllers.bar);
				assert.calledWithExactly(controllers.bar, dashboard);
			});

			it('starts the Express application on the port in `options.port`', () => {
				assert.calledOnce(express.mockApp.listen);
				assert.calledWith(express.mockApp.listen, dashboard.options.port);
			});

			it('logs that the application has started', () => {
				assert.calledWithExactly(log.info, 'Pa11y Sidekick started');
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

			});

		});

		describe('when `options.start` is `false`', () => {

			beforeEach(() => {
				userOptions.start = false;
				express.mockApp.listen.reset();
				returnedPromise = sidekick(userOptions);
			});

			describe('.then()', () => {
				let dashboard;

				beforeEach(() => returnedPromise.then(value => {
					dashboard = value;
				}));

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
				let dashboard;

				beforeEach(() => returnedPromise.then(value => {
					dashboard = value;
				}));

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
			let expressError;

			beforeEach(() => {
				expressError = new Error('Express failed to start');
				express.mockApp.listen.yieldsAsync(expressError);
				log.info.reset();
				returnedPromise = sidekick(userOptions);
			});

			describe('.catch()', () => {
				let caughtError;

				beforeEach(done => {
					returnedPromise.then(done).catch(error => {
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
