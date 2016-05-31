// jscs:disable maximumLineLength
'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('middleware/cors', () => {
	let cors;
	let express;

	beforeEach(() => {
		express = require('../mock/express.mock');
		cors = require('../../../middleware/cors');
	});

	it('exports a function', () => {
		assert.isFunction(cors);
	});

	describe('cors(request, response, next)', () => {
		let next;

		beforeEach(() => {
			next = sinon.spy();
			cors(express.mockRequest, express.mockResponse, next);
		});

		it('sets an Access-Control-Allow-Origin header to allow all origins', () => {
			assert.calledOnce(express.mockResponse.set);
			assert.calledWithExactly(express.mockResponse.set, 'Access-Control-Allow-Origin', '*');
		});

		it('calls `next`', () => {
			assert.calledOnce(next);
			assert.calledWithExactly(next);
		});

	});

});
