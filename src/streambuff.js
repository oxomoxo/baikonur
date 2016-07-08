/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

const fs = require('fs');
const stream = require('stream');

const qb = require('./qb.js');

// TODO : Typical place for introducing mix-ins -> allow common base class Reversible + stream.Readable + stream.Writable

class Readable
{
	getReadable() { return this; }
}
module.exports.Reversible = Readable;

class Writable
{
	getWritable() { return this; }
}
module.exports.Reversible = Writable;

class Reversible
{
	getWritable() { return null; }
	getReadable() { return null; }
}
module.exports.Reversible = Reversible;

class MemReadable extends stream.Readable
{
	constructor(_buffer)
	{
		super();

		this.offset = 0;

		this.buff = _buffer;
		this.size = _buffer.length;
	}

	_read(_size)
	{
		if(this.offset < this.size)
		{
			this.push(
				this.buff.slice(this.offset,this.offset + _size)
			);
			this.offset += _size;
		}
		else(this.offset >= this.size)
		{
			this.push(null);
		}
	}

	rewind()
	{
		this.offset = 0;
	}

	getWritable()
	{
		return new MemWritable(this);
		// return ... // TODO
	}

	getReadable()
	{
		return this;
	}
}
module.exports.MemReadable = MemReadable;

class MemWritable extends stream.Writable
{
	constructor(_buffer = null, _maxsize = 0)
	{
		super();

		this.size = 0;
		this.buff = [];

		this.maxsize = _maxsize;

		if(_buffer instanceof MemReadable)
		{
			this.buff = _buffer.buff;
			this.readable = _buffer;
		}
		else if(_buffer instanceof Buffer)
		{
			this.buff.push(_buffer);
		}
	}

	_write(_chunk,_encoding,_cb) // append chunk
	{
		if(this.maxsize > 0 && this.size + _chunk.length > this.maxsize)
		{
			_cb(new Error("Buffer Full"));
			return;
		}

		this.buff.push(_chunk);
		this.size += _chunk.length;

		_cb();
	}

	getWritable()
	{
		return this;
	}

	getReadable()
	{
		return new MemReadable(Buffer.concat(this.buff));
	}
}
module.exports.MemWritable = MemWritable;

class FileReadable extends fs.ReadStream
{
	constructor(_path)
	{
		super(_path);
	}

	getReadable()
	{
		return this;
	}
}
module.exports.FileReadable = FileReadable;

class FileWritable extends fs.WriteStream
{
	constructor(_path = null)
	{
		super(_path || qb.tempFileName(),{flags:'w+',mode:0o700});
	}

	getReadable()
	{
		return new FileReadable(this.path);
	}
}
module.exports.FileWritable = FileWritable;

class ProxyReadable extends stream.Transform
{
	constructor(_src)
	{
		super();

		_src.pipe(this);
	}

	_transform(_chunk,_encoding,_cb)
	{
		_cb(null,_chunk);
	}

	getReadable()
	{
		return this;
	}
}
module.exports.ProxyReadable = ProxyReadable;

class ProxyWritable extends stream.Transform
{
	constructor(_dst)
	{
		super();

		this.pipe(_dst)
	}

	_transform(_chunk,_encoding,_cb)
	{
		_cb(null,_chunk);
	}

	getReadable()
	{
		return null;
	}
}
module.exports.ProxyWritable = ProxyWritable;

function getWritableBuffer(_size,_cfg,_dst)
{
	var memmax = _cfg('aqnb.streambuf.memmax',1024*256 /* 256 Kib */);
	var filemax = _cfg('aqnb.streambuf.filemax',1024*1024*10 /* 10 Mib */);
	var streammax = _cfg('aqnb.streambuf.streammax',1024*1024*100 /* 100 Mib */);

	var length = _rt.req.header('content-length');
	length = length[0] || 0;

	if(length < memmax)
	{

	}
	else if(length < filemax)
	{

	}
	else if(length < streammax)
	{

	}
}
module.exports.getWritableBuffer = getWritableBuffer;


/* TESTS */

/*

var memw = new MemWritable();
var filew = new FileWritable();
var filep = new FileWritable();
var proxw = new ProxyWritable(process.stdout);

for(let i = 0; i < 100; ++i)
{
	memw.write("MemWritable Stream Test #" + i + "\n");
	filew.write("FileWritable Stream Test #" + i + "\n");
	filep.write("ProxyReadable Stream Test #" + i + "\n");
	proxw.write("ProxyWritable Stream Test #" + i + "\n");
}

memw.getReadable().pipe(process.stdout);
filew.getReadable().pipe(process.stdout);
var proxr = new ProxyReadable(filep.getReadable());
proxr.pipe(process.stdout);

*/
