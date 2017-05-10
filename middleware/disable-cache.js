'use strict';

module.exports = disableCache;

// This middleware disables the browser cache.
function disableCache() {
	return (request, response, next) => {
		response.set({
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			Pragma: 'no-cache',
			Expires: '0'
		});
		next();
	};
}
