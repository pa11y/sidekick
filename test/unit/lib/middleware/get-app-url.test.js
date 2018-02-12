'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('lib/middleware/get-app-url', () => {
	let getAppUrl;

	beforeEach(() => {
		getAppUrl = require('../../../../lib/middleware/get-app-url');
	});

	it('exports a function', () => {
		assert.isFunction(getAppUrl);
	});

	describe('getAppUrl(configuredHostname)', () => {
		let middleware;

		beforeEach(() => {
			middleware = getAppUrl('https://mock-configured-host/');
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;
			let request;

			beforeEach(() => {
				request = {
					connection: {
						remoteAddress: 'mock-request-remote-address',
						localPort: 'mock-request-local-port'
					},
					headers: {},
					protocol: 'mock-request-protocol',
					hostname: 'mock-request-host'
				};
				next = sinon.spy();
				middleware(request, {}, next);
			});

			it('sets the `request.appUrl` property to the expected URL', () => {
				assert.strictEqual(request.appUrl, 'https://mock-configured-host');
			});

			it('calls `next` with nothing', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

			describe('when `configuredHostname` is not defined', () => {

				beforeEach(() => {
					next.reset();
					delete request.appUrl;
					request.headers = {
						'X-Forwarded-Host': 'mock-request-forwarded-host',
						'X-Forwarded-Port': 'mock-request-forwarded-port',
						'X-Forwarded-Proto': 'mock-request-forwarded-protocol'
					};
					getAppUrl()(request, {}, next);
				});

				it('sets the `request.appUrl` property to the expected URL', () => {
					assert.strictEqual(request.appUrl, 'mock-request-forwarded-protocol://mock-request-forwarded-host:mock-request-forwarded-port');
				});

				it('calls `next` with nothing', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when `configuredHostname` is not defined and X-Forwarded headers are not available', () => {

				beforeEach(() => {
					next.reset();
					delete request.appUrl;
					request.headers = {};
					getAppUrl()(request, {}, next);
				});

				it('sets the `request.appUrl` property to the expected URL', () => {
					assert.strictEqual(request.appUrl, 'mock-request-protocol://mock-request-host');
				});

				it('calls `next` with nothing', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when `configuredHostname` is not defined and no request details are available', () => {

				beforeEach(() => {
					next.reset();
					delete request.appUrl;
					delete request.hostname;
					delete request.protocol;
					request.headers = {};
					getAppUrl()(request, {}, next);
				});

				it('sets the `request.appUrl` property to the expected URL', () => {
					assert.strictEqual(request.appUrl, 'http://localhost');
				});

				it('calls `next` with nothing', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when `configuredHostname` is not defined, no request details are available, and the request host is local', () => {

				beforeEach(() => {
					next.reset();
					delete request.appUrl;
					delete request.hostname;
					delete request.protocol;
					request.connection.remoteAddress = '::1';
					request.headers = {};
					getAppUrl()(request, {}, next);
				});

				it('sets the `request.appUrl` property to the expected URL', () => {
					assert.strictEqual(request.appUrl, 'http://localhost:mock-request-local-port');
				});

				it('calls `next` with nothing', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when `configuredHostname` is missing a protocol', () => {

				beforeEach(() => {
					next.reset();
					delete request.appUrl;
					delete request.hostname;
					delete request.protocol;
					request.connection.remoteAddress = '::1';
					request.headers = {};
					getAppUrl('mock-configured-host')(request, {}, next);
				});

				it('sets the `request.appUrl` property to the expected URL', () => {
					assert.strictEqual(request.appUrl, 'http://mock-configured-host');
				});

				it('calls `next` with nothing', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

		});

	});

});
