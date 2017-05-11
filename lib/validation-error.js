'use strict';

// TODO the fact that we have this probably means we
// should consider a third-party validation library –
// the models are getting quite complex
module.exports = class ValidationError extends Error {

	constructor(message, validationMessages) {
		super(message);
		this.validationMessages = validationMessages || [];
	}

};
