/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana © 2016
	https://github.com/oxomoxo

*/
// @flow
"use strict";

const Log = require('../log.js');
const Mw = require('../middleware.js');

class BodySizeMW extends Mw.Runner
{
	constructor()
	{
		super('BodySizeMW');
	}

	pre(_rt)
	{
		var memmax = _rt.cfg.get('mw.bodysize.memmax',1024*256 /* 256 Kib */);
		var filemax = _rt.cfg.get('mw.bodysize.filemax',1024*1024*10 /* 10 Mib */);
		var streammax = _rt.cfg.get('mw.bodysize.streammax',1024*1024*100 /* 100 Mib */);

		var length = _rt.req.header('content-length');
		length = length[0] || 0;

		if(length < memmax)
		{
			var membuf = [];
			_rt.req.body
			.on('data',(_chunk) =>
			{
				membuf.push(_chunk);
			})
			.on('end',()=>
			{
				membuf = Buffer.concat(membuf);
				// body = httpio.Uri.parseQuery(body);
				_rt.req = _rt.req
					.withAttribute('body-method','memory')
					.withBody(new MemoryStream(membuf));

				var ret = _next(_rt);
			})
		}
		else if(length < filemax)
		{
			var file = qb.tempFileName();
		}
		else if(length < streammax)
		{

		}
	}
}
