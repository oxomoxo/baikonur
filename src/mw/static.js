/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

const fs = require('fs');

const Log = require('../log.js');
const Mw = require('../middleware.js');
const Sb = require("../streambuff.js")

class StaticMW extends Mw.Runner
{
	constructor(_root = '.', _title = null)
	{
		super(_title || 'Static Files');

		this.root = _root;
	}

	pre(_rt)
	{
		Log.dbgTrace("============================================================================================================");
		if(_rt.req.uri.path)
		{
			var static_file = this.root + _rt.req.uri.path;
			Log.dbgTrace('Checking access to : ' + static_file);
			return new Promise((_res, _rej) =>
			{
				fs.access(static_file,fs.R_OK,(_err) =>
				{
					if(_err)
					{
						Log.dbgTrace(_err);
						Log.dbgTrace('Forbidden access : ' + static_file);

						if(_err.code == 'EACCES')
						{
							_rt.req = _rt.req.withAttribute('static-denied',static_file);
							_rt.res = _rt.res.withStatus(403,'Access Denied');

							return _rej(_err);
						}

						_rt.req = _rt.req.withAttribute('static-not-found',_err);

						return _res(_err);
					}

					Log.dbgTrace('Delivering : ' + static_file);

					_rt.req = _rt.req.withAttribute('static-found',static_file);
					_rt.res = _rt.res.withBody(new Sb.FileReadable(static_file));

					_res(false); // bypass middleware stack & kernel
				});
			});
		}
	}

	post(_rt) {}
}

module.exports = StaticMW;
