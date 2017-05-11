/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');

describe('lib/validation-error', () => {
	let ValidationError;

	beforeEach(() => {
		ValidationError = require('../../../lib/validation-error');
	});

	it('exports a function', () => {
		assert.isFunction(ValidationError);
	});

	describe('new ValidationError(message)', () => {
		let instance;

		beforeEach(() => {
			instance = new ValidationError('mock-message');
		});

		it('extends Error', () => {
			assert.instanceOf(instance, Error);
		});

		it('has a `message` property set to `message`', () => {
			assert.strictEqual(instance.message, 'mock-message');
		});

		it('has a `validationMessages` property set to an empty array', () => {
			assert.deepEqual(instance.validationMessages, []);
		});

	});

	describe('new ValidationError(message, validationMessages)', () => {
		let instance;

		beforeEach(() => {
			instance = new ValidationError('mock-message', [
				'mock-validation-message'
			]);
		});

		it('extends Error', () => {
			assert.instanceOf(instance, Error);
		});

		it('has a `message` property set to `message`', () => {
			assert.strictEqual(instance.message, 'mock-message');
		});

		it('has a `validationMessages` property set to `validationMessages`', () => {
			assert.deepEqual(instance.validationMessages, [
				'mock-validation-message'
			]);
		});

	});

});
