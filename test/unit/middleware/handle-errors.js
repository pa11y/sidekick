// jscs:disable maximumLineLength
'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('middleware/handle-errors', () => {
	let dashboard;
	let express;
	let handleErrors;
	let sidekick;

	beforeEach(() => {
		express = require('../mock/express.mock');
		sidekick = require('../mock/sidekick.mock');
		handleErrors = require('../../../middleware/handle-errors');

		return sidekick().then(value => {
			dashboard = value;
		});
	});

	it('exports an object', () => {
		assert.isObject(handleErrors);
	});

	it('has an `html` method', () => {
		assert.isFunction(handleErrors.html);
	});

	describe('.html(dashboard)', () => {
		let middleware;

		beforeEach(() => {
			middleware = handleErrors.html(dashboard);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(error, request, response, next)', () => {
			let error;
			let next;

			beforeEach(() => {
				error = new Error('foo error');
				error.status = 456;
				next = sinon.spy();
				express.mockResponse.render.yields(null, 'rendered-html');
				middleware(error, express.mockRequest, express.mockResponse, next);
			});

			it('renders the error template with the error information', () => {
				assert.calledOnce(express.mockResponse.render);
				assert.calledWith(express.mockResponse.render, 'error', {
					error: {
						message: error.message,
						status: error.status,
						stack: undefined
					}
				});
			});

			it('sets the response status to the error status', () => {
				assert.calledOnce(express.mockResponse.status);
				assert.calledWithExactly(express.mockResponse.status, 456);
			});

			it('sets the response body to the rendered HTML', () => {
				assert.calledOnce(express.mockResponse.send);
				assert.calledWithExactly(express.mockResponse.send, 'rendered-html');
			});

			describe('with a 4xx error', () => {

				beforeEach(() => {
					error.status = 400;
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('does not log the error stack', () => {
					assert.neverCalledWith(dashboard.log.error, error.stack);
				});

			});

			describe('with a 5xx error', () => {

				beforeEach(() => {
					error.status = 500;
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('logs the error stack', () => {
					assert.calledWithExactly(dashboard.log.error, error.stack);
				});

			});

			describe('when the dashboard environment is "development"', () => {

				beforeEach(() => {
					dashboard.environment = 'development';
					express.mockResponse.render.reset();
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('includes the error stack when rendering the error template', () => {
					assert.calledOnce(express.mockResponse.render);
					assert.calledWith(express.mockResponse.render, 'error', {
						error: {
							message: error.message,
							status: error.status,
							stack: error.stack
						}
					});
				});

			});

			describe('when the error has no `status` property', () => {

				beforeEach(() => {
					delete error.status;
					express.mockResponse.status.reset();
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('sets the response status to 500', () => {
					assert.calledOnce(express.mockResponse.status);
					assert.calledWithExactly(express.mockResponse.status, 500);
				});

			});

			describe('when the error has a numeric `status` property lower than 400', () => {

				beforeEach(() => {
					error.status = 1;
					express.mockResponse.status.reset();
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('sets the response status to 500', () => {
					assert.calledOnce(express.mockResponse.status);
					assert.calledWithExactly(express.mockResponse.status, 500);
				});

			});

			describe('when the error template fails to render', () => {
				let renderError;

				beforeEach(() => {
					renderError = new Error('render error');
					express.mockResponse.render.yields(renderError);
					express.mockResponse.send.reset();
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('sets the response body to a backup HTML string', () => {
					assert.calledOnce(express.mockResponse.send);
					assert.match(express.mockResponse.send.firstCall.args[0], /foo error/i);
					assert.match(express.mockResponse.send.firstCall.args[0], /error template/i);
					assert.notInclude(express.mockResponse.send.firstCall.args[0], error.stack);
					assert.notInclude(express.mockResponse.send.firstCall.args[0], renderError.stack);
				});

				describe('when the dashboard environment is "development"', () => {

					beforeEach(() => {
						dashboard.environment = 'development';
						express.mockResponse.send.reset();
						middleware(error, express.mockRequest, express.mockResponse, next);
					});

					it('includes the error stack in the backup HTML string', () => {
						assert.calledOnce(express.mockResponse.send);
						assert.include(express.mockResponse.send.firstCall.args[0], error.stack);
						assert.include(express.mockResponse.send.firstCall.args[0], renderError.stack);
					});

				});

			});

		});

	});

	it('has a `json` method', () => {
		assert.isFunction(handleErrors.json);
	});

	describe('.json(dashboard)', () => {
		let middleware;

		beforeEach(() => {
			middleware = handleErrors.json(dashboard);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(error, request, response, next)', () => {
			let error;
			let next;

			beforeEach(() => {
				error = new Error('foo');
				error.status = 456;
				next = sinon.spy();
				middleware(error, express.mockRequest, express.mockResponse, next);
			});

			it('sets the response status to the error status', () => {
				assert.calledOnce(express.mockResponse.status);
				assert.calledWithExactly(express.mockResponse.status, 456);
			});

			it('sets the response body to the expected JSON body', () => {
				assert.calledOnce(express.mockResponse.send);
				assert.calledWithExactly(express.mockResponse.send, {
					error: {
						message: error.message,
						status: error.status,
						stack: undefined
					}
				});
			});

			describe('with a 4xx error', () => {

				beforeEach(() => {
					error.status = 456;
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('does not log the error stack', () => {
					assert.neverCalledWith(dashboard.log.error, error.stack);
				});

			});

			describe('with a 5xx error', () => {

				beforeEach(() => {
					error.status = 567;
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('logs the error stack', () => {
					assert.calledWithExactly(dashboard.log.error, error.stack);
				});

			});

			describe('when the dashboard environment is "development"', () => {

				beforeEach(() => {
					dashboard.environment = 'development';
					express.mockResponse.send.reset();
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('includes the error stack in the JSON body', () => {
					assert.calledOnce(express.mockResponse.send);
					assert.calledWithExactly(express.mockResponse.send, {
						error: {
							message: error.message,
							status: error.status,
							stack: error.stack
						}
					});
				});

			});

			describe('when the error has no `status` property', () => {

				beforeEach(() => {
					delete error.status;
					express.mockResponse.status.reset();
					middleware(error, express.mockRequest, express.mockResponse, next);
				});

				it('sets the response status to 500', () => {
					assert.calledOnce(express.mockResponse.status);
					assert.calledWithExactly(express.mockResponse.status, 500);
				});

			});

		});

	});

});
