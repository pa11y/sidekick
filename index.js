//
// Hiya. You've found the main entry-point for Pa11y Sidekick.
// This isn't where all the magic happens, though – this file
// just takes environment variables and sends it on through
// to `lib/sidekick.js`.
//
'use strict';

const sidekick = require('./lib/sidekick');
const config = require('./config.js');

sidekick(config).catch(() => {
	process.exit(1);
});
