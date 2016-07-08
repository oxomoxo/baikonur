/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

const fs = require('fs');
const zlib = require('zlib');

const Log = require('../log.js');
const Mw = require('../middleware.js');
const Sb = require('../streambuff.js');

class CompressionMW extends Mw.Runner
{
	constructor(_title = null)
	{
		super(_title || 'Compression');
	}

	pre(_rt)
	{
		var stream = null;
		var encoding = _rt.req.header('content-encoding');
		if(!encoding || !encoding[0])
		{
			return;
		}
		encoding = encoding[0].split(',');
		encoding = encoding.map(s => s.trim());
		Log.dbgTrace('content-encoding : ',encoding);

		switch (encoding[0])
		{
		case 'gzip':
			stream = zlib.createGunzip();
			_rt.req = _rt.req
				.withBody(_rt.req.body.pipe(stream))
				.setHeader('content-length',stream.length);
			break;
		case 'deflate':
			stream = zlib.createInflate();
			_rt.req = _rt.req
				.withBody(_rt.req.body.pipe(stream))
				.setHeader('content-length',stream.length);
			break;
		}

		if(stream && stream.length)
		{
			_rt.req = _rt.req.setHeader('content-length',stream.length);
		}
	}

	post(_rt)
	{
		var stream = null;
		var encoding = _rt.req.header('accept-encoding');
		if(!encoding || !encoding[0])
		{
			return;
		}
		encoding = encoding[0].split(',');
		encoding = encoding.map(s => s.trim());
		Log.dbgTrace('content-encoding : ',encoding);

		switch (encoding[0])
		{
		case 'gzip':
			stream = zlib.createGzip();
			_rt.res = _rt.res
				.withBody(_rt.res.body.getReadable().pipe(stream))
				.setHeader('content-encoding','gzip');
			break;
		case 'deflate':
			stream = zlib.createDeflate();
			_rt.res = _rt.res
				.withBody(_rt.res.body.getReadable().pipe(stream))
				.setHeader('content-encoding','deflate');
			break;
		}

		if(stream && stream.length)
		{
			_rt.res = _rt.res.setHeader('content-length',stream.length);
		}
	}
}

module.exports = CompressionMW;
