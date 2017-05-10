/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('middleware/disable-cache', () => {
	let disableCache;
	let express;

	beforeEach(() => {
		express = require('../mock/express.mock');
		disableCache = require('../../../middleware/disable-cache');
	});

	it('exports a function', () => {
		assert.isFunction(disableCache);
	});

	describe('disableCache()', () => {
		let middleware;

		beforeEach(() => {
			middleware = disableCache();
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;

			beforeEach(() => {
				next = sinon.spy();
				middleware(express.mockRequest, express.mockResponse, next);
			});

			it('sets cache control headers on the response', () => {
				assert.calledOnce(express.mockResponse.set);
				assert.calledWith(express.mockResponse.set, {
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					Pragma: 'no-cache',
					Expires: '0'
				});
			});

			it('calls `next` with no error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

		});

	});

});
