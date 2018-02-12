'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/require-auth', () => {
	let httpError;
	let requireAuth;

	beforeEach(() => {

		httpError = sinon.spy(require('http-errors'));
		mockery.registerMock('http-errors', httpError);

		requireAuth = require('../../../../lib/middleware/require-auth');
	});

	it('exports a function', () => {
		assert.isFunction(requireAuth);
	});

	describe('requireAuth()', () => {
		let middleware;

		beforeEach(() => {
			middleware = requireAuth();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;
			let request;

			beforeEach(() => {
				request = {
					authUser: {}
				};
				next = sinon.spy();
				middleware(request, {}, next);
			});

			it('calls `next` with nothing', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

			describe('when no user is authenticated', () => {

				beforeEach(() => {
					delete request.authUser;
					next.reset();
					middleware(request, {}, next);
				});

				it('creates a 401 HTTP error', () => {
					assert.calledOnce(httpError);
					assert.calledWithExactly(httpError, 401, 'You must authenticate to perform this action');
				});

				it('calls `next` with the created error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next, httpError.firstCall.returnValue);
				});

			});

		});

	});

});
