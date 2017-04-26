'use strict';

const sinon = require('sinon');

const handleErrors = module.exports = {
	html: sinon.stub(),
	json: sinon.stub()
};
const mockHtmlMiddleware = handleErrors.mockHtmlMiddleware = sinon.stub();
const mockJsonMiddleware = handleErrors.mockJsonMiddleware = sinon.stub();

handleErrors.html.returns(mockHtmlMiddleware);
handleErrors.json.returns(mockJsonMiddleware);
