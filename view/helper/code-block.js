'use strict';

/**
 * Initialise the code block view helper.
 * @param {Object} dust - a Dust view engine.
 * @returns {undefined} Nothing.
 */
function codeBlock(dust) {
	dust.helpers.codeBlock = (chunk, context, bodies, params) => {
		if (!bodies.block) {
			return chunk;
		}
		const language = (params.language ? ` class="${params.language}"` : '');

		// Capture the code and trim linebreaks
		let code = captureBody(bodies.block, context).replace(/^[\r\n]+|[\s]+$/g, '');

		// Unindent everything by the initial whitespace amount
		const whitespaceMatch = code.match(/^(\s+)/);
		if (whitespaceMatch && whitespaceMatch[1]) {
			const initialWhitespace = new RegExp(`([\\r\\n]|^)${whitespaceMatch[1]}`, 'g');
			code = code.replace(initialWhitespace, '$1');
		}

		// Replace tabs with four spaces, as this displays better in-browser
		code = code.replace(/\t/g, '    ');

		// Write the code block
		chunk.write(`<pre><code${language}>${code}</code></pre>`);
	};
}

/**
 * Capture the text output by a chunk render.
 * @param {Object} block - a Dust block.
 * @param {Object} context - a Dust context.
 * @returns {undefined} Nothing.
 */
function captureBody(block, context) {
	let output = '';
	const chunk = {
		w: string => { // eslint-disable-line id-length
			output += string;
			return chunk;
		},
		f: string => { // eslint-disable-line id-length
			return chunk.w(string);
		}
	};
	block(chunk, context);
	return output;
}

module.exports = codeBlock;
