// jscs:disable maximumLineLength
'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('middleware/allow', () => {
	let allow;
	let allowMethods;

	beforeEach(() => {

		allowMethods = sinon.spy(require('allow-methods'));
		mockery.registerMock('allow-methods', allowMethods);

		allow = require('../../../middleware/allow');
	});

	it('exports an object', () => {
		assert.isObject(allow);
	});

	it('has a `get` method', () => {
		assert.isFunction(allow.get);
	});

	describe('.get', () => {

		it('is an allow-methods middleware that allows only HEAD and GET requests', () => {
			assert.strictEqual(
				allow.get,
				allowMethods.withArgs(['GET', 'HEAD']).firstCall.returnValue
			);
		});

	});

	it('has a `post` method', () => {
		assert.isFunction(allow.post);
	});

	describe('.post', () => {

		it('is an allow-methods middleware that allows only POST requests', () => {
			assert.strictEqual(
				allow.post,
				allowMethods.withArgs(['POST']).firstCall.returnValue
			);
		});

	});

	it('has a `getAndPost` method', () => {
		assert.isFunction(allow.getAndPost);
	});

	describe('.getAndPost', () => {

		it('is an allow-methods middleware that allows only HEAD, GET, and POST requests', () => {
			assert.strictEqual(
				allow.getAndPost,
				allowMethods.withArgs(['GET', 'HEAD', 'POST']).firstCall.returnValue
			);
		});

	});

});
