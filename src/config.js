/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

const fs = require('fs');
const qb = require('./qb.js');

class Config
{
	constructor(_file)
	{
		this.file = _file;
		this.changed = false;

		this.load();
	}

	load(_file = null)
	{
		_file = _file || this.file;

		fs.readFile(_file,'utf8',(_err,_data) =>
		{
			if(!_err && _data && _data.length)
			{
				this.root = JSON.parse(_data.toString());
			}
			else this.root = Object.create(null);

			this.changed = false;
		});
	}

	save(_file = null)
	{
		if(this.changed == false) return;

		_file = _file || this.file;

		fs.open(_file,'w',0o666,(_err,_fd) =>
		{
			if(_err) return;

			fs.write(_fd,this.dump(),0,'utf8',(_err,_count,_str) =>
			{
				this.changed = false;
				fs.close(_fd);
			});
		});
	}

	get(_place,_default)
	{
		if(qb.isString(_place))
		{
			_place = _place.split('.');
		}

		var obj = this.root;
		var l = _place.length;

		for(var i = 0; i < l; ++i)
		{
			var prop = _place[i];
			if(!qb.isSet(obj[prop]))
			{
				return this.set(_place,_default);
			}
			obj = obj[prop];
		}

		return obj;
	}

	set(_place,_value)
	{
		if(qb.isString(_place))
		{
			_place = _place.split('.');
		}

		var obj = this.root;
		var l = _place.length - 1;

		for(var i = 0; i < l; ++i)
		{
			var prop = _place[i];
			if(!qb.isObject(obj[prop]))
			{
				obj[prop] = Object.create(null);
			}
			obj = obj[prop];
		}

		this.changed = true;
		return obj[_place[i]] = _value;
	}

	dump()
	{
		var map = [];
		var ret = JSON.stringify(this.root,function(key, value)
		{
			if (typeof value === 'object' && value !== null)
			{
				if (map.indexOf(value) !== -1)
				{
					// Circular reference found, discard key
					return "[@]";
				}
				// Store value in our collection
				map.push(value);
			}
			return value;
		},"  ");
		return ret + "\n";
	}
}

module.exports = Config;

/*

// TESTS

const Log = require('./log.js').init();
const rw = require('./randomwords.js');

var conf = new Config('./test.conf');
Log.out(conf.dump());

// var path = [];

// for(let i = 0; i < 100; ++i)
// {
// 	var word = rw.word();
// 	path.unshift(rw.object(rw.rnd(5,2)));

// 	Log.out(path[0],word);

// 	conf.set(path[0],word);
// }

// Log.out(conf.dump());

// for(let i = 0; i < 100; ++i)
// {
// 	Log.out(path[i],conf.get(path[i]));
// }

// conf.save();

*/
