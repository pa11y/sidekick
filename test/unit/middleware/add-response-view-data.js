/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const sinon = require('sinon');
require('sinon-as-promised');

describe('middleware/add-response-view-data', () => {
	let express;
	let addResponseViewData;
	let sidekick;

	beforeEach(() => {
		express = require('../mock/express.mock');
		sidekick = require('../mock/sidekick.mock');
		addResponseViewData = require('../../../middleware/add-response-view-data');
	});

	it('exports a function', () => {
		assert.isFunction(addResponseViewData);
	});

	describe('addResponseViewData(dashboard)', () => {
		let middleware;

		beforeEach(() => {
			middleware = addResponseViewData(sidekick.mockDashboard);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;

			beforeEach(() => {
				next = sinon.spy();
				return middleware(express.mockRequest, express.mockResponse, next);
			});

			it('adds the sidekick settings to `response.locals.settings`', () => {
				assert.strictEqual(express.mockResponse.locals.settings, sidekick.mockDashboard.settings);
			});

			it('calls `next` with no error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

		});

	});

});
