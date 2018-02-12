'use strict';

/**
 * Initialise the current URL view helper.
 * @param {Object} dust - a Dust view engine.
 * @returns {undefined} Nothing.
 */
function currentUrl(dust) {
	dust.helpers.currentUrl = (chunk, context, bodies, params) => {
		if (!params.test || !bodies.block) {
			return chunk;
		}
		const pattern = params.test
			.replace('*', '.*')
			.replace('/', '\\/')
			.replace(/\/$/, '/?');
		const regExp = new RegExp(`^${pattern}$`);
		if (regExp.test(context.get('requestPath') || '')) {
			return chunk.render(bodies.block, context);
		}
		return chunk;
	};
}

module.exports = currentUrl;
