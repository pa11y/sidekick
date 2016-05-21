// jscs:disable maximumLineLength
'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('middleware/not-found', () => {
	let notFound;
	let httpError;

	beforeEach(() => {

		httpError = sinon.spy(require('http-errors'));
		mockery.registerMock('http-errors', httpError);

		notFound = require('../../../middleware/not-found');
	});

	it('exports a function', () => {
		assert.isFunction(notFound);
	});

	describe('notFound(request, response, next)', () => {
		let next;

		beforeEach(() => {
			next = sinon.spy();
			notFound({}, {}, next);
		});

		it('creates a 404 HTTP error', () => {
			assert.calledOnce(httpError);
			assert.calledWithExactly(httpError, 404);
		});

		it('calls `next` with the created error', () => {
			assert.calledOnce(next);
			assert.calledWithExactly(next, httpError.firstCall.returnValue);
		});

	});

});
