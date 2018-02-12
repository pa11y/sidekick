'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/require-permission', () => {
	let Dashboard;
	let httpError;
	let requirePermission;

	beforeEach(() => {

		Dashboard = require('../../mock/dashboard.mock');

		httpError = sinon.spy(require('http-errors'));
		mockery.registerMock('http-errors', httpError);

		requirePermission = require('../../../../lib/middleware/require-permission');
	});

	it('exports a function', () => {
		assert.isFunction(requirePermission);
	});

	describe('requirePermission(level)', () => {
		let middleware;

		beforeEach(() => {
			middleware = requirePermission('mock-level');
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let dashboard;
			let next;
			let request;

			beforeEach(() => {
				dashboard = Dashboard.mockDashboard;
				request = {
					app: {
						dashboard
					},
					permissions: {
						'mock-level': true
					}
				};
				next = sinon.spy();
				return middleware(request, {}, next);
			});

			it('calls `next` with nothing', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

			describe('when the authenticated user does not have the required permission', () => {

				beforeEach(() => {
					request.permissions['mock-level'] = false;
					next.reset();
					return middleware(request, {}, next);
				});

				it('creates a 403 HTTP error', () => {
					assert.calledOnce(httpError);
					assert.calledWithExactly(httpError, 403, 'You are not authorised to perform this action');
				});

				it('calls `next` with the created error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, httpError.firstCall.returnValue);
				});

			});

		});

	});

});
