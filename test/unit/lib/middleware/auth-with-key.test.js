'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/auth-with-key', () => {
	let authWithKey;
	let Dashboard;
	let httpError;

	beforeEach(() => {

		Dashboard = require('../../mock/dashboard.mock');

		httpError = sinon.spy(require('http-errors'));
		mockery.registerMock('http-errors', httpError);

		authWithKey = require('../../../../lib/middleware/auth-with-key');
	});

	it('exports a function', () => {
		assert.isFunction(authWithKey);
	});

	describe('authWithKey()', () => {
		let dashboard;
		let middleware;

		beforeEach(() => {
			dashboard = Dashboard.mockDashboard;
			middleware = authWithKey();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let callbackError;
			let request;

			beforeEach(done => {
				dashboard.model.Key.mockKey.get.withArgs('secret').returns('mock-secret');
				dashboard.model.Key.mockKey.get.withArgs('user_id').returns('mock-user-id');

				request = {
					app: {
						dashboard
					},
					headers: {
						'x-api-key': 'mock-api-key',
						'x-api-secret': 'mock-api-secret'
					}
				};
				middleware(request, {}, error => {
					callbackError = error;
					done();
				});
			});

			it('fetches a key with the given ID', () => {
				assert.calledOnce(dashboard.model.Key.fetchOneById);
				assert.calledWithExactly(dashboard.model.Key.fetchOneById, 'mock-api-key');
			});

			it('checks that the given secret matches the key secret', () => {
				assert.calledOnce(dashboard.model.Key.checkSecret);
				assert.calledWithExactly(dashboard.model.Key.checkSecret, 'mock-api-secret', 'mock-secret');
			});

			it('fetches the user that the key belongs to', () => {
				assert.calledOnce(dashboard.model.User.fetchOneById);
				assert.calledWithExactly(dashboard.model.User.fetchOneById, 'mock-user-id');
			});

			it('sets the request `authUser` property to a serialized copy of the loaded user', () => {
				assert.calledOnce(dashboard.model.User.mockUser.serialize);
				assert.strictEqual(request.authUser, dashboard.model.User.mockSerializedUser);
			});

			it('sets the request `authKey` property to a serialized copy of the loaded key', () => {
				assert.calledOnce(dashboard.model.Key.mockKey.serialize);
				assert.strictEqual(request.authKey, dashboard.model.Key.mockSerializedKey);
			});

			it('sets the request `permissions` property to the loaded user\'s permissions', () => {
				assert.strictEqual(request.permissions, dashboard.model.User.mockSerializedUser.permissions);
			});

			it('calls `next` with nothing', () => {
				assert.isUndefined(callbackError);
			});

			describe('when the API key is invalid', () => {

				beforeEach(done => {
					dashboard.model.User.fetchOneById.reset();
					dashboard.model.Key.fetchOneById.resolves();
					middleware(request, {}, error => {
						callbackError = error;
						done();
					});
				});

				it('does not fetch a user', () => {
					assert.notCalled(dashboard.model.User.fetchOneById);
				});

				it('creates a 401 HTTP error', () => {
					assert.calledOnce(httpError);
					assert.calledWithExactly(httpError, 401, 'Invalid credentials');
				});

				it('calls `next` with the created error', () => {
					assert.strictEqual(callbackError, httpError.firstCall.returnValue);
				});

			});

			describe('when the API secret is invalid', () => {

				beforeEach(done => {
					dashboard.model.User.fetchOneById.reset();
					dashboard.model.Key.checkSecret.resolves(false);
					middleware(request, {}, error => {
						callbackError = error;
						done();
					});
				});

				it('does not fetch a user', () => {
					assert.notCalled(dashboard.model.User.fetchOneById);
				});

				it('creates a 401 HTTP error', () => {
					assert.calledOnce(httpError);
					assert.calledWithExactly(httpError, 401, 'Invalid credentials');
				});

				it('calls `next` with the created error', () => {
					assert.strictEqual(callbackError, httpError.firstCall.returnValue);
				});

			});

			describe('when no API key is sent with the request', () => {

				beforeEach(done => {
					dashboard.model.Key.fetchOneById.resetHistory();
					delete request.headers['x-api-key'];
					middleware(request, {}, error => {
						callbackError = error;
						done();
					});
				});

				it('does not fetch a key', () => {
					assert.notCalled(dashboard.model.Key.fetchOneById);
				});

				it('calls `next` with nothing', () => {
					assert.isUndefined(callbackError);
				});

			});

			describe('when no API secret is sent with the request', () => {

				beforeEach(done => {
					dashboard.model.Key.fetchOneById.resetHistory();
					delete request.headers['x-api-secret'];
					middleware(request, {}, error => {
						callbackError = error;
						done();
					});
				});

				it('does not fetch a key', () => {
					assert.notCalled(dashboard.model.Key.fetchOneById);
				});

				it('calls `next` with nothing', () => {
					assert.isUndefined(callbackError);
				});

			});

			describe('when no user is authenticated', () => {

				beforeEach(done => {
					dashboard.model.Setting.get.withArgs('publicReadAccess').resolves(true);
					delete request.headers['x-api-key'];
					delete request.permissions;
					middleware(request, {}, error => {
						callbackError = error;
						done();
					});
				});

				it('sets the request `permissions` property to a default permission set', () => {
					assert.calledOnce(dashboard.model.Setting.get);
					assert.calledWithExactly(dashboard.model.Setting.get, 'publicReadAccess');
					assert.deepEqual(request.permissions, {
						read: true
					});
				});

				it('calls `next` with nothing', () => {
					assert.isUndefined(callbackError);
				});

			});

			describe('when no user is authenticated and public read access is disabled', () => {

				beforeEach(done => {
					dashboard.model.Setting.get.withArgs('publicReadAccess').resolves(false);
					delete request.headers['x-api-key'];
					delete request.permissions;
					middleware(request, {}, error => {
						callbackError = error;
						done();
					});
				});

				it('sets the request `permissions` property to an empty object', () => {
					assert.deepEqual(request.permissions, {
						read: false
					});
				});

				it('calls `next` with nothing', () => {
					assert.isUndefined(callbackError);
				});

			});

			describe('when one of the model methods errors', () => {
				let modelError;

				beforeEach(done => {
					modelError = new Error('mock model error');
					dashboard.model.Key.fetchOneById.rejects(modelError);
					middleware(request, {}, error => {
						callbackError = error;
						done();
					});
				});

				it('calls `next` with the error', () => {
					assert.strictEqual(callbackError, modelError);
				});

			});

			describe('when loading the settings errors', () => {
				let settingsError;

				beforeEach(done => {
					delete request.headers['x-api-key'];
					delete request.permissions;
					settingsError = new Error('mock settings error');
					dashboard.model.Setting.get.rejects(settingsError);
					middleware(request, {}, error => {
						callbackError = error;
						done();
					});
				});

				it('sets the request `permissions` property to an empty object', () => {
					assert.deepEqual(request.permissions, {});
				});

				it('calls `next` with nothing', () => {
					assert.isUndefined(callbackError);
				});

			});

		});

	});

});
