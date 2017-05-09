/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('middleware/require-permission', () => {
	let express;
	let requirePermission;
	let sidekick;

	beforeEach(() => {
		express = require('../mock/express.mock');
		sidekick = require('../mock/sidekick.mock');
		requirePermission = require('../../../middleware/require-permission');
	});

	it('exports a function', () => {
		assert.isFunction(requirePermission);
	});

	describe('requirePermission(permission)', () => {
		let middleware;

		beforeEach(() => {
			middleware = requirePermission('read');
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;

			beforeEach(() => {
				express.mockRequest.user = {
					id: 'mock-id',
					email: 'mock-email'
				};
				express.mockApp.dashboard = sidekick.mockDashboard;
				sidekick.mockDashboard.model.user = {
					hasPermission: sinon.stub().returns(true)
				};
				next = sinon.spy();
				return middleware(express.mockRequest, express.mockResponse, next);
			});

			it('checks whether the current user has the specified permission', () => {
				assert.calledOnce(sidekick.mockDashboard.model.user.hasPermission);
				assert.calledWithExactly(sidekick.mockDashboard.model.user.hasPermission, express.mockRequest.user, 'read');
			});

			it('calls `next` with no error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

			describe('when the user does not have the specified permission', () => {

				beforeEach(() => {
					next.reset();
					sidekick.mockDashboard.model.user.hasPermission.returns(false);
					return middleware(express.mockRequest, express.mockResponse, next);
				});

				it('calls `next` with a 403 error', () => {
					assert.calledOnce(next);
					assert.instanceOf(next.firstCall.args[0], Error);
					assert.strictEqual(next.firstCall.args[0].status, 403);
					assert.strictEqual(next.firstCall.args[0].message, 'You do not have permission to do this');
				});

			});

		});

	});

});
