'use strict';

module.exports = reloadSettings;

// This helper function reloads cached settings on
// a Sidekick instance
function reloadSettings(dashboard) {
	return dashboard.model.Settings.query('limit', 1).fetch().then(settings => {
		dashboard.settings = settings || new dashboard.model.Settings({
			data: {}
		});
		return dashboard
	});
}
