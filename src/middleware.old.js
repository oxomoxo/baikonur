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
	constructor(_title,_pre = null,_post = null)
	{
		this.title = _title;
		this.pre = _pre || this.pre;
		this.post = _post || this.post;
	}

	pre(_rt)
	{
		Log.dbgTrace('[' + this.title + '] => pre');
		// returning false bypasses the rest of the stack
		return true;
	}

	post(_rt)
	{
		Log.dbgTrace('[' + this.title + '] => post');
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

		var c = Host.composeGen(this.stack);
		var w = Host.wrapGen(c);

		var done = () =>
			self.done(_rt);

		var error = (_err) =>
			self.error(_rt,_err);

		process.nextTick(() =>
			w.call(_rt) // _rt becomes the 'this' object in the middleware stack
			 .then(done)
			 .catch(error)
		);
	}

	// to override
	done(_rt) {}
	error(_rt,_err) {}

	static runnerGen(_runner)
	{
		return function *(_next)
		{
			Log.out('Running:',_runner.title);
			if(_runner.pre)
			{
				var ret = _runner.pre(this);
				if(ret === false)
				{
					return false; // bypass rest of stack
				}

				if(typeof ret.then == 'function') // Forward Promise
				{
					var cont = (_cont) =>
					{
						Log.out('Continue:',_cont);
						if(_cont === false) return;
						_next.next(_cont);
					};

					ret.then(cont,cont)
					   .catch((_err) =>
						{
							Log.out('Throwing:_next');
							_next.throw(_err);
						});

					Log.out('Yielding:ret');
					yield ret;
				}
				else
				{
					Log.out('Yielding:_next 1');
					yield _next;
				}
			}
			else
			{
				Log.out('Yielding:_next 2');
				yield _next;
			}

			if(_runner.post)
			{
				return _runner.post(this);
			}
		}
	}

	static composeGen(_mw)
	{
		return function *(next)
		{
			if(!next)
			{
				next = noop();
			}

			// var i = _mw.length;
			// while(i--)
			// {
			// 	next = _mw[i].call(this, next);
			// }

			var i = 0;
			while(i < _mw.length)
			{
				next = _mw[i].call(this, next);
				++i;
			}

			return yield *next;
		}

		function *noop(){};
	}

	static wrapGen(_gen)
	{
		return function ()
		{
			return Host.promiseGen(_gen.apply(this, arguments));
		}
	}

	static promiseGen(_gen)
	{
		return new Promise((_res, _rej) =>
		{
			if(!_gen || typeof _gen.next != 'function') // only manage generators
			{
				process.nextTick(() => { _res(_gen); }); // asynchronous stop
				return null;
			}

			process.nextTick(() => { resolve(); }); // asynchronous start

			function resolve(_val)
			{
				var ret;
				try { ret = _gen.next(_val); }
				catch (e) { return _rej(e); }
				next(ret);
			}

			function reject(_err)
			{
				var ret;
				try { ret = _gen.throw(_err); }
				catch (e) { return _rej(e); }
				next(ret);
			}

			function next(_ret)
			{
				if(_ret.done)
				{
					process.nextTick(() => { _res(_ret.value); });
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

				return value.then(resolve,reject);
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
	Log.dbgTrace('Fourth : 4',_next);

	yield _next;

	Log.dbgTrace('Fourth : 4');
});

host.main('ctx');

/*
*/
