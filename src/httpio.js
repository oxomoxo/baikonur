/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
"use strict";

const http = require('http');

const qb = require('./qb.js');
const Clonable = require('./clonable.js');

/*
	Adapted from :
	http://www.php-fig.org/psr/psr-7/
*/

class Message extends Clonable
{
	constructor(_headers = {}, _body = null, _version = '1.1')
	{
		super({
			version: _version,
			headers: _headers,
			body: _body
		});
	}

	withVersion(_version)
	{
		var clone = this.clone();
		this.data.version = _version;
		return clone;
	}

	withBody(/* Stream */ _body)
	{
		var clone = this.clone();
		clone.data.body = _body;
		return clone;
	}

	header(_name)
	{
		// Case Insensitive Match /!\
		_name = new RegExp(_name,'i');
		for(var _h in this.data.headers)
		{
			if(_h.match(_name) != null)
			{
				return this.data.headers[_h];
			}
		}
		return [];
	}

	headerLine(_name)
	{
		var header = this.header(_name);
		if(header.length)
		{
			return header.join(', ');
		}
		return '';
	}

	isHeader(_name)
	{
		var header = this.header(_name);
		if(header.length)
		{
			return true;
		}
		return false;
	}

	setHeader(_name, _value)
	{
		if(!qb.isArray(_value))
		{
			_value = [_value];
		}
		var clone = this.clone();
		// Case Insensitive Match /!\
		_name = new RegExp(_name,'i');
		for(var _h in clone.data.headers)
		{
			if(_h.match(_name) != null)
			{
				// header found : update
				clone.data.headers[_h] = _value;
				return clone;
			}
		}
		// header not found : create
		clone.data.headers[_name.source] = _value;
		return clone;
	}

	addHeader(_name, _value)
	{
		var clone = this.clone();
		// Case Insensitive Match /!\
		_name = new RegExp(_name,'i');
		for(var _h in clone.data.headers)
		{
			if(_h.match(_name) != null)
			{
				// header found : add
				if(qb.isArray(_value))
				{
					clone.data.headers[_h].concat(_value);
				}
				else
				{
					clone.data.headers[_h].push(_value);
				}
				return clone;
			}
		}
		// header not found : create
		if(!qb.isArray(_value))
		{
			_value = [_value];
		}
		clone.data.headers[_name.source] = _value;
		return clone;
	}

	delHeader(_name)
	{
		// Case Insensitive Match /!\
		_name = new RegExp(_name,'i');
		for(var _h in this.data.headers)
		{
			if(_h.match(_name) != null)
			{
				// header found : push
				var clone = this.clone();
				delete clone.data.headers[_h];
				return clone;
			}
		}
		// header not found : return this
		return this;
	}
}


class Request extends Message
{
	constructor(_method = 'GET', _uri = '', _headers = {}, _body = null, _version = '1.1', _target = 'origin')
	{
		super(_headers,_body,_version);
		this.addProps({
			method: _method,
			target: _target,
			uri: new Uri(_uri)
		});
	}

	withTarget(_target)
	{
		var clone = this.clone();
		clone.data.target = _target;
		return clone;
	}

	withMethod(_method)
	{
		var clone = this.clone();
		clone.data.method = _method;
		return clone;
	}

	withUri(/* Uri */ _uri, _preserveHost = false)
	{
		var clone = this.clone();
		if(_preserveHost && clone.data.uri.host)
		{
			var host = clone.data.uri.host;
			_uri = _uri.withHost(clone.data.uri.host);
		}
		clone.data.uri = _uri;
		return clone;
	}

	get uriTarget() {return this.data.uri.composeTarget(this.data.target);}
	get isXHR() {return this.data.headers['X-Requested-With'] == 'XMLHttpRequest';}
}


class ServerRequest extends Request
{
	constructor(_method = 'GET', _uri = '', _server = null, _cookies = {}, _headers = {}, _body = null, _version = '1.1', _target = 'origin')
	{
		// Server.parseBody(_headers,_body)
		super(_method, _uri, _headers, _body, _version, _target);
		this.addProps({
			server: _server,
			cookies:_cookies,
			attributes: {}
		})
	}

	withCookie(/* Object */ _cookies)
	{
		var clone = this.clone();
		clone.data.cookies = _cookies;
		return clone;
	}

	withQuery(/* Object */ _query)
	{
		var clone = this.clone();
		clone.data.uri = clone.data.uri.withQuery();
		return clone;
	}

	withFiles(/* File Interface */ _files)
	{
		var clone = this.clone();
		clone.data.files = _files;
		return clone;
	}

/*
JSON requests are converted into objects with JSON.parse(_body).
URL-encoded requests are converted into objects with Server.parseQuery(_body).
Multipart requests are converted into objects with Server.parseMultipart(_body).
// XML requests are converted into a SimpleXMLElement with simplexml_load_string(_body).
*/

	withBody(/* Object */ _body)
	{
		var clone = this.clone();
		clone.data.body = _body;
		return clone;
	}

	withRawBody(/* Object */ _rawBody)
	{
		var clone = this.clone();
		clone.data.rawBody = _rawBody;
		return clone;
	}

	oneAttribute(_name, _default = null)
	{
		if(this.data.attributes.hasOwnProperty(_name))
		{
			return this.data.attributes[_name];
		}
		return _default;
	}

	withAttributes(_attribs)
	{
		var clone = this.clone();
		for(let attrib in _attribs)
		{
			clone.data.attributes[attrib] = _attribs[attrib];
		}
		return clone;
	}

	withAttribute(_name, _value)
	{
		var clone = this.clone();
		clone.data.attributes[_name] = _value;
		return clone;
	}

	delAttribute(_name)
	{
		var clone = this.clone();
		delete clone.data.attributes[_name];
		return clone;
	}
}


class ServerResponse extends Message
{
	constructor(_body = null, _headers = {}, _status = 200, _reason = 'OK', _version = '1.1')
	{
		super(_headers,_body,_version);
		this.addProps({
			status: _status,
			reason: _reason
		});
	}

	withStatus(_status, _reason = '')
	{
		var clone = this.clone();
		clone.data.status = _status;
		clone.data.reason = _reason;
		return clone;
	}
}


class Uri extends Clonable
{
	constructor(_uri, _scheme = '', _user = '', _pass = '', _host = '', _port = '', _path = '', _query = '', _fragment = '')
	{
		super(Uri.parse(_uri));
	}

	get scheme() {return this.data.scheme || '';}
	withScheme(_scheme)
	{
		var clone = this.clone();
		clone.data.scheme = _scheme;
		return clone;
	}

	get authority() {
		var auth = this.data.host + this.data.port ? ':' + this.data.port : '';
		return this.user_info ? this.user_info + '@' + auth : auth;
	}

	get userInfo() {return this.data.pass ? this.data.user + ':' + this.data.pass : this.data.user;}
	withUserInfo(_user, _pass = null)
	{
		var clone = this.clone();
		clone.data.user = _user;
		clone.data.pass = _pass;
		return clone;
	}

	withHost(_host)
	{
		var clone = this.clone();
		clone.data.host = _host;
		return clone;
	}

	withPort(_port)
	{
		var clone = this.clone();
		clone.data.port = _port;
		return clone;
	}

	withPath(_path)
	{
		var clone = this.clone();
		clone.data.path = _path;
		return clone;
	}

	withQuery(_query)
	{
		var clone = this.clone();
		clone.data.query = _query;
		return clone;
	}

	withFragment(_fragment)
	{
		var clone = this.clone();
		clone.data.fragment = _fragment;
		return clone;
	}

	toString()
	{
		return '' +
			(this.data.scheme ? this.data.scheme + '://' : '') +
			(this.data.user ? this.data.user + (this.data.path ? ':' + this.data.path : '') + '@' : '') +
			this.data.host +
			(this.data.port ? ':' + this.data.port : '') +
			this.data.path +
			(this.data.query ? '?' + this.data.query : '') +
			(this.data.fragment ? '#' + this.data.fragment : '');/**/
	}

	composeTarget(_mode)
	{
		switch(_mode)
		{
		case 'origin':
			return this.data.path +
					(this.data.query ? '?' + this.data.query : '') +
					(this.data.fragment ? '#' + this.data.fragment : '');
		case 'absolute':
			return this.toString();
		case 'authority':
			return (this.data.user ? this.data.user + (this.data.path ? ':' + this.data.path : '') + '@' : '') +
					this.data.host +
					(this.data.port ? ':' + this.data.port : '');
		case '*':
			return '*';
		}
		return '/';
	}

	static parseQuery(_query)
	{
		var params = {};
		const query_parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
		_query.replace(query_parser, (match, name, value) => {
			if (name) {
				value = decodeURIComponent(value);
				params[name] = parseFloat(value) || value;
			}
		});
		return params;
	}

	static parse(_href)
	{
		const uri_parser = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;

		const keys = [
			'href','scheme','authority','userInfo','user','password','host',
			'port','relative','path','directory','file','query','fragment'
		];

		let res = uri_parser.exec(_href);
		let uridata = {};

		keys.forEach((key, idx) => {
			uridata[key] = res[idx] || ""
		})

		if(uridata.query)
		{
			uridata.params = Uri.parseQuery(uridata.query);
		}

		return uridata;
	}
}


class File extends Clonable
{
	constructor(_stream)
	{
		super({
			stream: _stream,
			size: 0,
			error: null,
			filename: '',
			type: ''
		});
	}

	moveTo(_targetPath)
	{

	}
}

module.exports.Message = Message;
module.exports.Request = Request;
module.exports.ServerRequest = ServerRequest;
module.exports.ServerResponse = ServerResponse;
module.exports.Uri = Uri;
module.exports.File = File;

/* TESTS */

/*

qb.prettyLog(new Message());
qb.prettyLog(new Request('GET','https://www.google.com/search?channel=fs&q=node&ie=utf-8&oe=utf-8&pws=0&gl=us&gws_rd=cr'));
qb.prettyLog(new ServerRequest({},{},'POST','https://www.google.com/search?channel=fs&q=node&ie=utf-8&oe=utf-8&pws=0&gl=us&gws_rd=cr').withMethod('GET'));
qb.prettyLog(new Response(200,'Ok'));

*/
