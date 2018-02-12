'use strict';

// Load all view helpers, this needs to be exported
// as an array which includes the built-in ones
module.exports = [
	require('./code-block'),
	require('./current-year'),
	require('./current-url'),
	'dustjs-helpers'
];
