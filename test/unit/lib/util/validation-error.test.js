'use strict';

const assert = require('proclaim');

describe('lib/util/validation-error', () => {
	let validationError;

	beforeEach(() => {
		validationError = require('../../../../lib/util/validation-error');
	});

	it('exports a function', () => {
		assert.isFunction(validationError);
	});

	describe('validationError(messages)', () => {
		let error;

		beforeEach(() => {
			error = validationError([
				'mock message 1',
				'mock message 2'
			]);
		});

		it('returns an error object', () => {
			assert.isObject(error);
			assert.instanceOf(error, Error);
		});

		describe('.name', () => {

			it('is "ValidationError"', () => {
				assert.strictEqual(error.name, 'ValidationError');
			});

		});

		describe('.message', () => {

			it('is a generic validation message', () => {
				assert.strictEqual(error.message, 'Validation failed');
			});

		});

		describe('.details', () => {

			it('is an array of validation details', () => {
				assert.isArray(error.details);
				assert.deepEqual(error.details, [
					{
						message: 'mock message 1'
					},
					{
						message: 'mock message 2'
					}
				]);
			});

		});

		describe('when `messages` is a string', () => {
			let error;

			beforeEach(() => {
				error = validationError('mock message');
			});

			describe('.details', () => {

				it('is an array of validation details', () => {
					assert.isArray(error.details);
					assert.deepEqual(error.details, [
						{
							message: 'mock message'
						}
					]);
				});

			});

		});

	});

});
