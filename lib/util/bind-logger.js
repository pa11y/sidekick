'use strict';

/**
 * Bind a logger's `log` and `error` methods with a string prefix.
 * @param {Object} logger - The logger to bind methods of
 * @param {Function} logger.error - The logger error method.
 * @param {Function} logger.info - The logger info method.
 * @param {String} prefix - The value to prefix logs with.
 * @returns {Object} An object with new `error` and `info` methods.
 */
function bindLogger(logger, prefix) {
	return {
		error: logger.error.bind(logger.error, prefix),
		info: logger.info.bind(logger.info, prefix)
	};
}

module.exports = bindLogger;
