'use strict';

/**
 * Initialise the current year view helper.
 * @param {Object} dust - a Dust view engine.
 * @returns {undefined} Nothing.
 */
function initCurrentYearHelper(dust) {
	dust.helpers.currentYear = chunk => {
		const year = (new Date()).getFullYear();
		return chunk.write(year);
	};
}

module.exports = initCurrentYearHelper;
