/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

const os = require('os');
const http = require('http');

const Readable = require('stream').Readable;

const Log = require('./log.js');
const io = require('./httpio.js');
const sb = require('./streambuff.js');

class Runtime
{
	constructor(_srv,_req, _res,_headers,_cookie)
	{
		this.src = _req;
		this.dst = _res;
		this.srv = _srv;
		this.app = _srv.app;
		this.cfg = _srv.app.config;

		this.server = {

			hostname: os.hostname(),
			homedir: os.homedir(),
			tmpdir: os.tmpdir(),

			host: {
				platform: os.platform(),
				type: os.type(),
				release: os.release(),
				arch: os.arch(),
				eol: os.EOL,
				endianness: os.endianness()
			},

			runtime: {
				pid: global.process.pid,
				env: global.process.env,
				argv: global.process.argv,
				execArgv: global.process.execArgv,
				versions: global.process.versions,
				features: global.process.features,
				debugPort: global.process.debugPort
			},

			hardware: {
				loadavg: os.loadavg(),
				uptime: os.uptime(),
				freemem: os.freemem(),
				totalmem: os.totalmem(),
				cpus: os.cpus()//,
				// network: os.networkInterfaces()
			}
		};

		this.req = new io.ServerRequest(

			_req.method,
			_req.url,
			this.server,
			_cookie,
			_headers,
			new sb.ProxyReadable(_req), // request body
			_req.httpVersion
		);

		this.res = new io.ServerResponse(
			new sb.MemWritable() // response body
		);
	}
}

class Server
{
	constructor(_app)
	{
		this.app = _app;
	}

	listen(_port)
	{
		this.nodesrv = http.createServer(this.main.bind(this)).listen(_port);
	}

	main(_req,_res)
	{
		var rt = new Runtime(this,
			_req,
			_res,
			this.parseHeaders(_req.rawHeaders),
			this.parseCookies(_req.headers.cookie)
		);

		this.app.main(rt,this.kick.bind(this));
	}

	kick(_rt)
	{
		Log.dbgInfo('kicking !');

		var evt = '';
		var src = null;
		var dst = _rt.dst;

		if(_rt.res.status < 300 && _rt.res.body)
		{
			var body = _rt.res.body;
			if(body.getReadable)
			{
				evt = 'end';
				src = _rt.res.body.getReadable();
			}
			else if (body instanceof Readable)
			{
				evt = 'close';
				src = body;
			}
		}

		dst.writeHead(_rt.res.status,_rt.res.headers);
		Log.dbgInfo('headers sent');
		Log.dbgInfo('response : ',_rt.res.status);
		if(src)
		{
			// Log.out('sending body',evt);
			src.on('end', () =>
			{
				// Log.out('body sent',evt);
				// Log.dbgInfo('body source EOF');
				dst.end('',null,()=>
				{
					var e = 'todelete';
				});
			});
			src.pipe(dst);
		}
		else dst.end();

		return _rt;
	}

	parseHeaders(_headers)
	{
		var _prevent = ['user-agent'];
		var l = _headers.length;
		var headers = Object.create(null);

		for(let i=0; i < l; i+=2)
		{
			let n = _headers[i];
			let h = _headers[i+1];

			if (_prevent.indexOf(n.toLowerCase()) == -1)
			{
				h = h.split(';');
				h = h.map(s => s.trim());
			}
			else h = [h];

			headers[n] = h;
		}

		return headers;
	}

	parseCookies(_cookies)
	{
		if(!_cookies) return {};

		var cookies = {};

		_cookies = _cookies.split(';');
		_cookies.forEach(_c => _c.trim());

		for(let cookie of _cookies)
		{
			cookie = cookie.split('=');
			cookies[cookie[0]] = cookie[1];
		}

		return cookies;
	}
}

module.exports = Server;
module.exports.Runtime = Runtime;

