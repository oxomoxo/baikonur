/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

const Log = require('./log.js');

class Clonable
{
	constructor(_props = {})
	{
		this.data = {};
		this.addProps(_props);
		this.factory = new.target;
	}

	addProps(_props = {})
	{
		for(let prop in _props)
		{
			this.addProp(prop,_props[prop]);
		}
	}

	addProp(_prop = '',_value = null)
	{
		if(!this.hasOwnProperty(_prop))
		{
			Object.defineProperty(this,_prop,{
				enumerable: true,
				get: () => {return this.data[_prop];},
				set: (_v) => {/* READ ONLY */},
			});
		}

		this.data[_prop] = _value;
	}

	toJSON(_tab)
	{
		return this.data;
	}

	clone()
	{
		var clone = new this.factory();
		clone.addProps(this.data);
		return clone;
	}
}

module.exports = Clonable;
