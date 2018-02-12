'use strict';

/**
 * Class representing a flash messenger.
 */
class FlashMessenger {

	/**
	 * Create a flash messenger.
	 * @param {Object} request - An Express or Connect request object.
	 */
	constructor(request) {
		this.request = request;
		this.messages = {};
		if (this.request.session.flash) {
			this.messages = this.request.session.flash;
			delete this.request.session.flash;
		}
	}

	/**
	 * Set a flash message.
	 * @param {String} key - The key to store the message under.
	 * @param {*} value - The value of the message.
	 * @returns {undefined} Nothing.
	 */
	set(key, value) {
		if (!this.request.session.flash) {
			this.request.session.flash = {};
		}
		this.request.session.flash[key] = value;
	}

	/**
	 * Get a flash message.
	 * @param {String} key - The key to fetch the message for.
	 * @returns {*} The message stored at the key.
	 */
	get(key) {
		return this.messages[key];
	}

}

/**
 * Create a middleware function which adds flash messaging.
 * @returns {Function} A middleware function.
 */
function flash() {
	return (request, response, next) => {
		request.flash = new flash.FlashMessenger(request);
		next();
	};
}

module.exports = flash;
module.exports.FlashMessenger = FlashMessenger;
