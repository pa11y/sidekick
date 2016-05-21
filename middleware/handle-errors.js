'use strict';

module.exports = {
	html: handleErrorsHtml,
	json: handleErrorsJson
};

function handleErrorsHtml(dashboard) {
	return (error, request, response, next) => {
		// jshint unused:false
		const renderContext = buildRenderContext(dashboard, error);

		response.render('error', renderContext, (renderError, html) => {
			if (renderError) {
				html = buildBackupHtml(dashboard, {
					error,
					renderContext,
					renderError
				});
			}
			response.status(renderContext.error.status).send(html);
		});

		if (renderContext.error.status >= 500) {
			dashboard.log.error(error.stack);
		}
	};
}

function handleErrorsJson(dashboard) {
	return (error, request, response, next) => {
		// jshint unused:false
		const renderContext = buildRenderContext(dashboard, error);

		response.status(renderContext.error.status).send(renderContext);

		if (renderContext.error.status >= 500) {
			dashboard.log.error(error.stack);
		}
	};
}

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
