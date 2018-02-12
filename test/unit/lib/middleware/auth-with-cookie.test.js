'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/auth-with-cookie', () => {
	let authWithCookie;
	let Dashboard;
	let httpError;

	beforeEach(() => {

		Dashboard = require('../../mock/dashboard.mock');

		httpError = sinon.spy(require('http-errors'));
		mockery.registerMock('http-errors', httpError);

		authWithCookie = require('../../../../lib/middleware/auth-with-cookie');
	});

	it('exports a function', () => {
		assert.isFunction(authWithCookie);
	});

	describe('authWithCookie()', () => {
		let dashboard;
		let middleware;

		beforeEach(() => {
			dashboard = Dashboard.mockDashboard;
			middleware = authWithCookie();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let callbackError;
			let request;

			beforeEach(done => {
				request = {
					app: {
						dashboard
					},
					session: {
						userId: 'mock-user-id'
					}
				};
				middleware(request, {}, error => {
					callbackError = error;
					done();
				});
			});

			it('fetches a user with the ID given in the session', () => {
				assert.calledOnce(dashboard.model.User.fetchOneById);
				assert.calledWithExactly(dashboard.model.User.fetchOneById, 'mock-user-id');
			});

			it('sets the request `authUser` property to a serialized copy of the loaded user', () => {
				assert.calledOnce(dashboard.model.User.mockUser.serialize);
				assert.strictEqual(request.authUser, dashboard.model.User.mockSerializedUser);
			});

			it('sets the request `permissions` property to the loaded user\'s permissions', () => {
				assert.strictEqual(request.permissions, dashboard.model.User.mockSerializedUser.permissions);
			});

			it('calls `next` with nothing', () => {
				assert.isUndefined(callbackError);
			});

			describe('when the user ID is invalid', () => {

				beforeEach(done => {
					dashboard.model.User.fetchOneById.resolves();
					middleware(request, {}, error => {
						callbackError = error;
						done();
					});
				});

				it('deletes the user session', () => {
					assert.isUndefined(request.session);
				});

				it('creates a 401 HTTP error', () => {
					assert.calledOnce(httpError);
					assert.calledWithExactly(httpError, 401, 'Invalid credentials');
				});

				it('calls `next` with the created error', () => {
					assert.strictEqual(callbackError, httpError.firstCall.returnValue);
				});

			});

			describe('when no user is authenticated', () => {

				beforeEach(done => {
					dashboard.model.Setting.get.withArgs('publicReadAccess').resolves(true);
					delete request.session;
					delete request.permissions;
					middleware(request, {}, error => {
						callbackError = error;
						done();
					});
				});

				it('sets the request `permissions` property to the default permissions', () => {
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
					delete request.session;
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
					dashboard.model.User.fetchOneById.rejects(modelError);
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
					delete request.session;
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
