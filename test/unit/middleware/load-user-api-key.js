/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const sinon = require('sinon');
require('sinon-as-promised');

describe('middleware/load-user-api-key', () => {
	let express;
	let loadUserFromApiKey;
	let sidekick;

	beforeEach(() => {
		express = require('../mock/express.mock');
		sidekick = require('../mock/sidekick.mock');
		loadUserFromApiKey = require('../../../middleware/load-user-api-key');
	});

	it('exports a function', () => {
		assert.isFunction(loadUserFromApiKey);
	});

	describe('loadUserFromApiKey(dashboard)', () => {
		let middleware;

		beforeEach(() => {
			middleware = loadUserFromApiKey(sidekick.mockDashboard);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let mockUser;
			let next;

			beforeEach(() => {
				mockUser = {
					id: 'mock-id',
					email: 'mock-email'
				};
				sidekick.mockDashboard.model.user = {
					getByApiKey: sinon.stub().resolves(mockUser)
				};
				express.mockRequest.headers['x-api-key'] = 'mock-api-key';

				next = sinon.spy();
				return middleware(express.mockRequest, express.mockResponse, next);
			});

			it('loads the user with the given API key from the database', () => {
				assert.calledOnce(sidekick.mockDashboard.model.user.getByApiKey);
				assert.calledWith(sidekick.mockDashboard.model.user.getByApiKey, express.mockRequest.headers['x-api-key'], {
					safe: true
				});
			});

			it('adds an `isLoggedIn` property to the user set to `true`', () => {
				assert.isTrue(mockUser.isLoggedIn);
			});

			it('adds the user to the `request.user` property', () => {
				assert.strictEqual(express.mockRequest.user, mockUser);
			});

			it('calls `next` with no error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

			describe('when no X-Api-Key header is found in the request', () => {

				beforeEach(() => {
					next.reset();
					delete express.mockRequest.headers['x-api-key'];
					return middleware(express.mockRequest, express.mockResponse, next);
				});

				it('adds default user info to the `request.user` property', () => {
					assert.deepEqual(express.mockRequest.user, {
						isLoggedIn: false,
						allowRead: true,
						allowWrite: true,
						allowDelete: true,
						allowAdmin: true
					});
				});

				it('calls `next` with no error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when no X-Api-Key header is found in the request and no default permissions are set', () => {

				beforeEach(() => {
					next.reset();
					sidekick.mockDashboard.settings = {};
					delete express.mockRequest.headers['x-api-key'];
					return middleware(express.mockRequest, express.mockResponse, next);
				});

				it('adds mock user info to the `request.user` property', () => {
					assert.deepEqual(express.mockRequest.user, {
						isLoggedIn: false,
						allowRead: false,
						allowWrite: false,
						allowDelete: false,
						allowAdmin: false
					});
				});

				it('calls `next` with no error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when a user with the given API key cannot be found', () => {

				beforeEach(() => {
					next.reset();
					sidekick.mockDashboard.model.user.getByApiKey.resolves(null);
					return middleware(express.mockRequest, express.mockResponse, next);
				});

				it('calls `next` with a 401 HTTP error', () => {
					assert.calledOnce(next);
					assert.instanceOf(next.firstCall.args[0], Error);
					assert.strictEqual(next.firstCall.args[0].status, 401);
					assert.strictEqual(next.firstCall.args[0].message, 'Invalid API credentials');
				});

			});

			describe('when fetching the user errors', () => {
				let databaseError;

				beforeEach(() => {
					next.reset();
					databaseError = new Error('database error');
					sidekick.mockDashboard.model.user.getByApiKey.rejects(databaseError);
					return middleware(express.mockRequest, express.mockResponse, next);
				});

				it('calls `next` with the error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, databaseError);
				});

			});

		});

	});

});
