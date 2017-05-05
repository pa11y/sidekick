'use strict';

module.exports = reloadSettings;

// This helper function reloads cached settings on
// a Sidekick instance
function reloadSettings(dashboard) {
	return dashboard.model.settings.get().then(settings => {
		dashboard.settings = settings;
		return dashboard;
	});
}
