// jscs:disable maximumLineLength
'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('middleware/require-user-agent', () => {
	let requireHeader;
	let requireUserAgent;

	beforeEach(() => {

		requireHeader = sinon.spy(require('require-header'));
		mockery.registerMock('require-header', requireHeader);

		requireUserAgent = require('../../../middleware/require-user-agent');
	});

	it('exports a function', () => {
		assert.isFunction(requireUserAgent);
	});

	describe('requireUserAgent()', () => {

		it('is a require-header middleware that requires a User-Agent header', () => {
			assert.strictEqual(
				requireUserAgent,
				requireHeader.withArgs('User-Agent').firstCall.returnValue
			);
		});

	});

});
