/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

const qb = require('./qb.js');
const Log = require('./log.js').init();

class Branch
{
	constructor(_place,_parent = null)
	{
		this.factory = new.target;

		this.element = _place;
		this.parent = _parent;

		this.childs = Object.create(null); // no prototype

		this.leaf = null;
	}

	gettle(_place)
	{
		if(qb.isString(_place))
		{
			_place = _place.split(_place[0]);
		}

		if(_place.length == 0) // Leaf !
		{
			return this.leaf;
		}

		var child = _place.shift();

		if(this.childs[child])
		{
			return this.childs[child].getVal(_place);
		}
	}

	settle(_place,_leaf)
	{
		Log.dbgTrace('Settling : ', _place);
		if(qb.isString(_place))
		{
			_place = _place.split(_place[0]);
		}

		if(_place.length == 0) // Leaf !
		{
			Log.dbgTrace('Leaf Reached : ',this.element);
			this.leaf = _leaf;

			return this;
		}

		var child = _place.shift();

		if(!this.childs[child])
		{
			this.childs[child] = new this.factory(child,this);
		}

		return this.childs[child].settle(_place,_leaf);
	}

	dump(_tab = "    ",_depth = 0)
	{
		var tabs = _tab.repeat(_depth);
		var ret = tabs + '"' + this.element + "\" {\n";

		var moretabs = tabs + _tab;

		if(qb.isSet(this.leaf))
		{
			var leaf = qb.prettyString(this.leaf,_tab).replace(/[\n]/g,"\n" + moretabs);
			ret += moretabs + '"leaf": ' + leaf + "\n";
		}

		for(let branch in this.childs)
		{
			ret += this.childs[branch].dump(_tab,_depth+1)
		}

		return ret + tabs + "}\n";
	}
}

module.exports = Branch;