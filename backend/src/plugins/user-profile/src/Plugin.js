const BasePlugin = require('../../BasePlugin');
const { createActions } = require('./actions');
const meta = require('./meta');
const swagger = require('./swagger.js');

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = meta;
		this._swagger = swagger;
	}

	init(context) {
		const { router } = context;

		router.get('/api/profile',
			// we need this wrapper becuse in some plugins like application-tokens we are going to redefine context.security.isLoggedIn, so we need it to be resolved dynamically via a wrapper
			(request, response, next) => context.security.isLoggedIn(request, response, next),
			(request, response) => {
				if (this.isLoaded()) {
					const result = request.user;
					delete result.password;
					response.json(result);
				} else {
					this.sendResponsePluginNotEnabled(response);
				}
			}
		);

	}

	get meta() {
		return this._meta;
	}
}