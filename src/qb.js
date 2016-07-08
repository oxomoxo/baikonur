/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

const crypto = require('crypto');

// qb:qube
// dp:dope

class qb
{
	static bootStrap(_root,_place)
	// _place : [in:string] a dot separated list of nodes "qb.Components.Etc."
	// returns : the (valid) last object of the list
	// Usage : qb.Bootstrap("qb.Components").NewComponent = { /* Define New Component Here */ };
	{
		if(!qb.isString(_place))
		{
			return null;
		}

	// 	qb.Out.Log('Bootstrapping : ',_place);

		var ret = _root;

		_place = _place.split('.');

		for(var i = 0; i < _place.length; ++i)
		{
			var o = _place[i];
			if(o)
			{
				if(!qb.isObject(ret[o]))
				{
					ret[o] = new Object;
				}

				ret = ret[o];
			}
		}

		return ret;
	}

	static argsToArray(_args)
	{
		return (_args.length === 1 ? [_args[0]] : Array.apply(null, _args));
	}

	static isFunction(a)
	{
		return typeof(a) == "function";
	}

	static isString(a)
	{
		return typeof(a) == "string";
	}

	static isNumber(a)
	{
		return typeof(a) == "number";
	}

	static isInt(a)
	{
		if(qb.isUndefined(a))
		{
			return false;
		}
		return Math.round(a) === a;

		// var intg = parseInt(a.toString());
		// return !isNaN(intg) && intg.toString() == a.toString();
	}

	static isFloat(a)
	{
		if(qb.isUndefined(a))
		{
			return false;
		}
		return !isNaN(parseFloat(a.toString()));
	}

	static isSet(a)
	{
		return !qb.isNull(a) && !qb.isUndefined(a);
	}

	static isNull(a)
	{
		return a === null;
	}

	static isUndefined(a)
	{
		return typeof(a) == "undefined";
	}

	static isObject(a)
	{
		return a !== null && typeof(a) == 'object';
	}

	static isArray(a)
	{
		return qb.isObject(a) && a instanceof Array;
	}

	static isDomNode(_o)
	{
		return (
			(qb.isObject(Node) && _o instanceof Node) ||
			(qb.isObject(_o) && qb.isNumber(_o.nodeType) && qb.isString(_o.nodeName))
		);
	}

	static isParentElement(_o,_p)
	{
		while(_o.parentElement)
		{
			if(_o.parentElement === _p)
			{
				return true;
			}
			_o = _o.parentElement;
		}
		return false;
	}

	static isDomElement(_o)
	{
		return (
			(qb.isObject(HTMLElement) && _o instanceof HTMLElement) || //DOM2
			(qb.isObject(_o) && _o.nodeType === 1 && qb.isString(_o.nodeName))
		);
	}

	static implement(obj, extension, override)
	{
		var prop;
		if (override === false)
		{
			for (var prop in extension)
			{
				if (!(prop in obj) || typeof(obj[prop]) == 'undefined')
				{
					obj[prop] = extension[prop];
				}
			}
		}
		else
		{
			for (var prop in extension)
			{
				obj[prop] = extension[prop];
			}
			if (extension.toString !== Object.prototype.toString)
			{
				obj.toString = extension.toString;
			}
		}
		return obj;
	}

	static prettyString(_item,_tab = '.   ')
	{
		var map = [];
		var ret = JSON.stringify(_item,function(_key, _value)
		{
			if(typeof _value === 'object' && _value !== null)
			{
				if (map.indexOf(_value) !== -1)
				{
					// Circular reference found, discard _key
					return "[@]";
				}
				// Store _value in our collection
				map.push(_value);
			}
			// if(qb.isSet(_value) && qb.isSet(_value.toJSON))
			// {
			// 	return _value.toJSON(_tab);
			// }
			return _value;
		},_tab);
		return ret;
	}

	static tempFileName(_salt = "wrviqbqvliubsvçp_qp'fiubla")
	{
		return '/tmp/butterfish-' + crypto
			.createHmac('sha256',
				new Date().getMilliseconds().toString() +
				crypto.randomBytes(24).toString('hex'))
			.update(_salt)
			.digest('hex');
	}

	static prettyLog(_item)
	{
		console.log(qb.prettyString(_item));
	}
}

module.exports = qb;

// Some potentially needed polyfills

if(!Function.prototype.bind) Function.prototype.bind = function bind(_this)
{
	if(!_this && arguments.length < 2)
	{
		return this;
	}
	var __method = this, args = Array.prototype.slice.call(arguments,1);
	return function bind(){return __method.apply(_this,args.concat(Array.prototype.slice.call(arguments)));}
}

// if(window && !qb.isFunction(window.requestAnimationFrame))
// {
// 	window.requestAnimationFrame =
// 		window.webkitRequestAnimationFrame ||
// 		window.mozRequestAnimationFrame ||
// 		window.oRequestAnimationFrame ||
// 		window.msRequestAnimationFrame ||
// 		(function (_callback, _element) {
// 			window.setTimeout(_callback, 1000 / 60); // 60 FPS
// 		}).bind(window);
// }

if(!String.prototype.repeat) String.prototype.repeat = function(n)
{
	 var s = "", t = this.toString();
	 while(--n >= 0){s += t;}
	 return s;
};

qb.DEG2RAD = Math.PI / 180.0;
qb.RAD2DEG = 180.0 / Math.PI;

if(!Math.sinh) Math.sinh = function sinh(_rad)
{
	// example : sinh(-0.9834330348825909);
	// returns : -1.1497971402636502
	return (Math.exp(_rad) - Math.exp(-_rad)) / 2;
}

if(!Math.cosh) Math.cosh = function cosh(_rad)
{
	// example : cosh(-0.18127180117607017);
	// returns : 1.0164747716114113
	return (Math.exp(_rad) + Math.exp(-_rad)) / 2;
}

if(!Math.tanh) Math.tanh = function tanh(_rad)
{
	// example : tanh(5.4251848798444815);
	// returns : 0.9999612058841574
	var e = Math.exp(2 * _rad);
	return (e - 1) / (e + 1);
}

if(!Math.asinh) Math.asinh = function asinh(_rad)
{
	// example : asinh(8723321.4);
	// returns : 16.67465779841863
	return Math.log(_rad + Math.sqrt(_rad * _rad + 1));
}

if(!Math.acosh) Math.acosh = function acosh(_rad)
{
	// example : acosh(8723321.4);
	// returns : 16.674657798418625
	return Math.log(_rad + Math.sqrt(_rad * _rad - 1));
}

if(!Math.atanh) Math.atanh = function atanh(_rad)
{
	// example : atanh(0.3);
	// returns : 0.3095196042031118
	return 0.5 * Math.log((1 + _rad) / (1 - _rad));
}

/* TO PORT v

String.prototype.repeat = function(n)
{
	 var s = "", t = this.toString();
	 while(--n >= 0){s += t;}
	 return s;
};

He.ToString = function(a)
{
	var s = '';

	if(arguments.length < 1)
	{
		return new String('');
	}

	if(arguments.length > 1)
	{
		var n = arguments.length;
		for(var i = 0; i < n; ++i)
		{
			s += He.ToString(arguments[i]);
		}
	}
	else
	{
		if(a === null)
		{
			a = 'null';
		}

		if(He.isArray(a))
		{
			s += "(array)\n" + He.ToString.t + "[\n";
			He.ToString.push();
			for(var n = 0; n < a.length; ++n)
			{
				s += He.ToString.ObjArr(n,a[n]);
			}
			He.ToString.pop();
			s += He.ToString.t + "]\n";
		}
		else if(He.isObject(a))
		{
			s += "(object)\n" + He.ToString.t + "{\n";
			He.ToString.push();
			for(var n in a)
			{
				s += He.ToString.ObjArr(n,a[n]);
			}
			He.ToString.pop();
			s += He.ToString.t + "}\n";
		}
		else
		{
			s += new String(a);//.toString();
		}
	}

	return s;
};
//-- He.ToString sub infos and routines --------------------------------
He.ToString.inc = 0;
He.ToString.t = '';
He.ToString.push = function()
{
	++He.ToString.inc;
	He.ToString.t = ". ".repeat(He.ToString.inc);
};
He.ToString.pop = function()
{
	He.ToString.inc = Math.max(0,He.ToString.inc - 1);
	He.ToString.t = ". ".repeat(He.ToString.inc);
};
He.ToString.ObjArr = function(n,v)
{
	var s = '';
	if(v === null)
	{
		v = 'null';
	}
	// ... recurse only when we can avoid loops
	if( (He.isObject(v) &&
		He.isUndefined(v.childNodes) // do not recurse DOM
		) || He.isArray(v))
	{
		s += He.ToString.t + '[' + n + '] : ' + He.ToString(v);
	}
	else
	{
		s += He.ToString.t + '[' + n + '] : ' + new String(v) + "\n";
	}
	return s;
};

*/
