/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

const Log = require('./log.js');

const Config = require('./config.js');
const Server = require('./server.js');
const Router = require('./router.js');
const HttpIO = require('./httpio.js');

const Middleware = require('./middleware.js');

class App extends Middleware.Host
{
	constructor(_config)
	{
		super();

		this.stack.unshift(this.kernel);

		this.config = new Config(_config);
		this.server = new Server(this);
		this.router = new Router();
	}

	// Server Proxy
	listen(_port)
	{
		this.server.listen(_port);
	}

	// Config Proxy
	getConfig(_name,_default)
	{
		return this.config.get(_name,_default);
	}
	setConfig(_name,_value)
	{
		return this.config.set(_name,_value);
	}

	// Router Proxy
	routeGet(_pattern,_target)
	{
		return this.route(['get'],_pattern,_target);
	}
	routePost(_pattern,_target)
	{
		return this.route(['post'],_pattern,_target);
	}
	routePut(_pattern,_target)
	{
		return this.route(['put'],_pattern,_target);
	}
	routePatch(_pattern,_target)
	{
		return this.route(['patch'],_pattern,_target);
	}
	routeDelete(_pattern,_target)
	{
		return this.route(['delete'],_pattern,_target);
	}
	routeOptions(_pattern,_target)
	{
		return this.route(['options'],_pattern,_target);
	}
	route(_methods,_pattern,_target)
	{
		var route = new Router.Route(_methods,_pattern,_target);
		this.router.addRoute(route);
		return this;
	}

	done(_rt)
	{
		this.server.kick(_rt);
		// save any modifications
		// and default values
		this.config.save();
	}

	error(_rt,_err)
	{
		Log.error('App.error:',_err);
		this.server.kick(_rt);
		// save any modifications
		// and default values
		this.config.save();
	}

	*kernel(_next)
	{
		Log.dbgTrace('[KERNEL] => pre');

		// Check if a middleware has triggered an error
		if(this.res.status < 300)
		{
			// Dispatch Request & run Target
			var ret = this.app.router.dispatch(this);
		}

		Log.dbgTrace('[KERNEL] => post');
	}
}
module.exports = App;
