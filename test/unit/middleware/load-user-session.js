/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const sinon = require('sinon');
require('sinon-as-promised');

describe('middleware/load-user-session', () => {
	let express;
	let loadUserFromSession;
	let sidekick;

	beforeEach(() => {
		express = require('../mock/express.mock');
		sidekick = require('../mock/sidekick.mock');
		loadUserFromSession = require('../../../middleware/load-user-session');
	});

	it('exports a function', () => {
		assert.isFunction(loadUserFromSession);
	});

	describe('loadUserFromSession(dashboard)', () => {
		let middleware;

		beforeEach(() => {
			middleware = loadUserFromSession(sidekick.mockDashboard);
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
					getById: sinon.stub().resolves(mockUser)
				};
				express.mockRequest.session.userId = 'mock-session-user-id';

				next = sinon.spy();
				return middleware(express.mockRequest, express.mockResponse, next);
			});

			it('loads the user with the given session ID from the database', () => {
				assert.calledOnce(sidekick.mockDashboard.model.user.getById);
				assert.calledWithExactly(sidekick.mockDashboard.model.user.getById, express.mockRequest.session.userId);
			});

			it('adds an `isLoggedIn` property to the user set to `true`', () => {
				assert.isTrue(mockUser.isLoggedIn);
			});

			it('adds the user to the `request.user` property', () => {
				assert.strictEqual(express.mockRequest.user, mockUser);
			});

			it('adds the user to the `response.locals.user` property', () => {
				assert.strictEqual(express.mockResponse.locals.user, mockUser);
			});

			it('calls `next` with no error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

			describe('when no ID is found in the session', () => {

				beforeEach(() => {
					next.reset();
					delete express.mockRequest.session.userId;
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

				it('adds default user info to the `response.locals.user` property', () => {
					assert.deepEqual(express.mockResponse.locals.user, {
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

			describe('when a user with the given ID cannot be found', () => {

				beforeEach(() => {
					next.reset();
					sidekick.mockDashboard.model.user.getById.resolves(null);
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

				it('adds default user info to the `response.locals.user` property', () => {
					assert.deepEqual(express.mockResponse.locals.user, {
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

			describe('when a user with the given ID cannot be found and no default permissions are set', () => {

				beforeEach(() => {
					next.reset();
					sidekick.mockDashboard.settings = {};
					sidekick.mockDashboard.model.user.getById.resolves(null);
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

				it('adds mock user info to the `response.locals.user` property', () => {
					assert.deepEqual(express.mockResponse.locals.user, {
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

			describe('when fetching the user errors', () => {
				let databaseError;

				beforeEach(() => {
					next.reset();
					databaseError = new Error('database error');
					sidekick.mockDashboard.model.user.getById.rejects(databaseError);
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
