'use strict';

const url = require('url');

/**
 * Create a middleware function which adds hostname information to the request object.
 * @returns {Function} A middleware function.
 */
function getAppUrl(configuredHostname) {
	if (configuredHostname && !/^https?:\/\//i.test(configuredHostname)) {
		configuredHostname = `http://${configuredHostname}`;
	}
	const parsed = url.parse(configuredHostname || '');
	parsed.protocol = (parsed.protocol ? parsed.protocol.replace(':', '') : null);
	return (request, response, next) => {
		const isLocal = (!parsed.hostname && request.connection.remoteAddress === '::1');
		const protocol = parsed.protocol || request.headers['X-Forwarded-Proto'] || request.protocol || 'http';
		const host = parsed.hostname || request.headers['X-Forwarded-Host'] || request.hostname || 'localhost';
		let port = parsed.port || request.headers['X-Forwarded-Port'] || (isLocal ? request.connection.localPort : null);
		port = (port ? `:${port}` : '');
		request.appUrl = `${protocol}://${host}${port}`;
		next();
	};
}

module.exports = getAppUrl;
