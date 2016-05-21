'use strict';

module.exports = dust => {
	dust.helpers.currentYear = chunk => {
		const year = (new Date()).getFullYear();
		return chunk.write(year);
	};
};
