'use strict';

module.exports = {
	html: handleErrorsHtml,
	json: handleErrorsJson
};

// This middleware is mounted after everything else as
// an error handler. This responds with HTML errors
function handleErrorsHtml(dashboard) {
	return (error, request, response, next) => {
		/* eslint no-unused-vars: 'off' */
		const renderContext = buildRenderContext(dashboard, error);

		// First attempt to render the "error" view, which
		// can be found in view/error.dust
		response.render('error', renderContext, (renderError, html) => {

			// If the render fails, we build some simple
			// backup HTML instead. Otherwise we send the
			// rendered HTML
			if (renderError) {
				html = buildBackupHtml(dashboard, {
					error,
					renderContext,
					renderError
				});
			}
			response.status(renderContext.error.status).send(html);
		});

		// Output server errors in the logs – we need
		// to know about these
		if (renderContext.error.status >= 500) {
			dashboard.log.error(error.stack);
		}
	};
}

// This middleware is mounted after everything else as
// an error handler. This responds with JSON errors
function handleErrorsJson(dashboard) {
	return (error, request, response, next) => {
		/* eslint no-unused-vars: 'off' */
		const renderContext = buildRenderContext(dashboard, error);

		response.status(renderContext.error.status).send(renderContext);

		if (renderContext.error.status >= 500) {
			dashboard.log.error(error.stack);
		}
	};
}

// This method builds the render context for an error
// page, or error JSON
function buildRenderContext(dashboard, error) {
	const statusCode = (error.status && error.status >= 400 ? error.status : 500);
	return {
		error: {
			status: statusCode,
			message: error.message,
			stack: (dashboard.environment === 'development' ? error.stack : undefined)
		}
	};
}

// This function builds backup HTML for if Dust rendering
// breaks for some reason. We output both the original
// error and the error that occurred during rendering
function buildBackupHtml(dashboard, data) {
	let errorStack;
	let renderErrorStack;
	if (dashboard.environment === 'development') {
		errorStack = `<pre>${data.error.stack}</pre>`;
		renderErrorStack = `<pre>${data.renderError.stack}</pre>`;
	}
	return `
		<p>
			Error ${data.renderContext.error.status}:
			${data.renderContext.error.message}
		</p>
		${errorStack}
		<p>Additionally the error template could not be rendered.</p>
		${renderErrorStack}
	`;
}
