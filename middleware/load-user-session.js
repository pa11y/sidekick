'use strict';

module.exports = loadUserFromSession;

// This middleware loads the current user and populates
// request and view variables
function loadUserFromSession(dashboard) {
	const model = dashboard.model;
	return (request, response, next) => {
		return Promise.resolve()
			.then(() => {
				if (!request.session.userId) {
					return null;
				}
				return model.user.getById(request.session.userId, {
					safe: true
				});
			})
			.then(user => {
				if (user) {
					user.isLoggedIn = true;
				} else {
					const defaultPermissions = dashboard.settings.defaultPermissions;
					user = {
						isLoggedIn: false,
						allowRead: (defaultPermissions ? defaultPermissions.allowRead : false),
						allowWrite: (defaultPermissions ? defaultPermissions.allowWrite : false),
						allowDelete: (defaultPermissions ? defaultPermissions.allowDelete : false),
						allowAdmin: (defaultPermissions ? defaultPermissions.allowAdmin : false)
					};
				}
				request.user = response.locals.user = user;
				next();
			})
			.catch(next);
	};
}
