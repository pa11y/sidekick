'use strict';

/**
 * Create a validation error which matches Joi's.
 * @param {(Array<String>|String)} messages - The validation message(s) to add to the validation error.
 * @returns {Error} An error object with the validation details.
 */
function validationError(messages) {
	const error = new Error('Validation failed');
	error.name = 'ValidationError';
	if (typeof messages === 'string') {
		messages = [messages];
	}
	error.details = messages.map(message => {
		return {message};
	});
	return error;
}

module.exports = validationError;
