/* eslint max-len: 'off' */
'use strict';

exports.seed = (database, Promise) => {
	return Promise.resolve().then(() => {
		// Add settings to the site
		return database('settings').insert({
			id: 'xxxxxx',
			data: {
				// nothing here yet
			}
		});
	});
};
