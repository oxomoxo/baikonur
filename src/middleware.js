/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana © 2016
	https://github.com/oxomoxo

*/
// @flow
"use strict";

const Log = require("./log.js");

class Runner
{
	constructor(_title, _pre = null, _post = null)
	{
		this.title = _title + ' - Middleware';
		this.pre = _pre || this.pre;
		this.post = _post || this.post;
	}

	pre(_rt)
	{
		// Log.out('[' + this.title + '] => pre');
		// returning false bypasses the rest of the stack
		return true;
	}

	post(_rt)
	{
		// Log.out('[' + this.title + '] => post');
		return true;
	}
}
module.exports.Runner = Runner;

class Host
{
	constructor()
	{
		this.stack = [];
	}

	use(_runner)
	{
		var rc = _runner.constructor;
		// Allow direct insertion if _runner is a GeneratorFunction
		if(
			rc.name != 'GeneratorFunction' &&
			rc.displayName != 'GeneratorFunction'
		){
			_runner = Host.runnerGen(_runner);
		}
		this.stack.push(_runner);
	}

	main(_rt)
	{
		var self = this;

		var c = Host.chainGen(this.stack);
		var w = Host.wrapGen(c);

		var done = () =>
			self.done(_rt);

		var error = (_err) =>
			self.error(_rt, _err);

		process.nextTick(() =>
			w.call(_rt) // _rt becomes the 'this' object in the middleware stack
				.then(done)
				.catch(error)
		);
	}

	// to override
	done(_rt) { }
	error(_rt, _err) { }

	static runnerGen(_runner)
	{
		return function* (_next)
		{
			// Log.out('Running:', _runner.title);
			if(_runner.pre)
			{
				var ret = _runner.pre(this);

				if(ret === false) return false; // bypass rest of stack

				while(ret && typeof ret.then == 'function')
				{
					// Log.out('Yielding:Promise');
					ret = yield ret; // Forward Promise

					if(ret === false) return false; // bypass rest of stack
				}
			}

			// Log.out('Yielding:_next');
			yield _next;

			if(_runner.post) _runner.post(this);
		}
	}

	static wrapGen(_gen)
	{
		return function ()
		{
			return Host.promiseGen(_gen.apply(this, arguments));
		}
	}

	static chainGen(_mw)
	{
		return function* (_next)
		{
			if(!_next) _next = noop();

			// var i = _mw.length;
			// while(i--)
			// {
			// 	_next = _mw[i].call(this, _next);
			// }

			var i = 0;
			while(i < _mw.length)
			{
				_next = _mw[i].call(this, _next);
				++i;
			}

			var ret;
			while((ret = yield *_next) && typeof ret.next == 'function');
		}

		function* noop() { };
	}

	static promiseGen(_gen)
	{
		return new Promise((_res, _rej) =>
		{
			if(!_gen || typeof _gen.next != 'function') // only manage generators
			{
				process.nextTick(() => { _rej(_gen); }); // asynchronous abort
				return null;
			}

			process.nextTick(() => { resolve(); }); // asynchronous start

			function resolve(_val)
			{
				var ret;
				try { ret = _gen.next(_val); }
				catch(e) { return _rej(e); }
				next(ret);
			}

			function reject(_err)
			{
				var ret;
				try { ret = _gen.throw(_err); }
				catch(e) { return _rej(e); }
				next(ret);
			}

			function next(_ret)
			{
				if(_ret.done)
				{
					process.nextTick(() => { _res(_ret.value); }); // asynchronous finish
					return;
				}

				var value = _ret.value;
				if(typeof value.then != 'function') // Not a Promise -> wrap.
				{
					value = Host.promiseGen(_ret.value);
					if(!value || typeof value.then != 'function') // Wrap Failed -> not a generator.
					{
						return reject(new TypeError('Wrong yield type : "' + String(_ret.value) + '"'));
					}
				}

				value.then(resolve, reject);
			}
		});
	}
}
module.exports.Host = Host;


/* TESTS */

/*

var host = new Host();

host.use(new Runner('KERNEL'));
host.use(new Runner('First : 1'));
host.use(new Runner('Second : 2'));
host.use(new Runner('Third : 3'));
host.use(function *(_next)
{
	Log.out('Fourth : 4',_next);

	yield _next;

	Log.out('Fourth : 4');
});

host.main('ctx');

/*
*/
