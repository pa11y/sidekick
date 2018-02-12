'use strict';

const assert = require('proclaim');

describe('lib/util/bind-logger', () => {
	let bindLogger;
	let logger;

	beforeEach(() => {
		logger = require('../../mock/log.mock');
		bindLogger = require('../../../../lib/util/bind-logger');
	});

	it('exports a function', () => {
		assert.isFunction(bindLogger);
	});

	describe('bindLogger(logger, prefix)', () => {
		let returnValue;

		beforeEach(() => {
			returnValue = bindLogger(logger, 'mock-prefix');
		});

		it('returns an object which has `error` and `info` methods', () => {
			assert.isObject(returnValue);
			assert.isFunction(returnValue.error);
			assert.isFunction(returnValue.info);
		});

		describe('.error(message)', () => {

			beforeEach(() => {
				returnValue.error('mock-message');
			});

			it('calls `logger.error` with `prefix` and `message`', () => {
				assert.calledOnce(logger.error);
				assert.calledWithExactly(logger.error, 'mock-prefix', 'mock-message');
			});

		});

		describe('.info(message)', () => {

			beforeEach(() => {
				returnValue.info('mock-message');
			});

			it('calls `logger.info` with `prefix` and `message`', () => {
				assert.calledOnce(logger.info);
				assert.calledWithExactly(logger.info, 'mock-prefix', 'mock-message');
			});

		});

	});

});
