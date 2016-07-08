/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

// http://pag.forbeslindesay.co.uk/

function readFile(filename, enc)
{
	return new Promise((fulfill, reject) =>
	{
		fs.readFile(filename, enc,(err, res) =>
		{
			if(err)
			{
				reject(err);
			}
			else
			{
				fullfill(res);
			}
		});
	});
}

var readJSON = async(function *(filename)
{
	return JSON.parse(yield readFile(filename, 'utf8'));
});

var get = async(function *()
{
	var left = readJSON('left.json')
	var right = readJSON('right.json')

	return {left: yield left, right: yield right}
})

function async(_generator)
{
	return function ()
	{
		var gen = _generator.apply(this, arguments)

		function handle(_result) // { done: [Boolean], value: [Object] }
		{
			if (_result.done)
			{
				return _result.value
			}

			return _result.value.then
			(
				function (res)
				{
					return handle(gen.next(res))
				},
				function (err)
				{
					return handle(gen.throw(err))
				}
			);
		}

		return handle(gen.next())
	}
}



// Liberally adapted to ES6 from :
// https://blog.jcoglan.com/2013/03/30/callbacks-are-imperative-promises-are-functional-nodes-biggest-missed-opportunity/

/*
In Haskell, the notation foo :: bar means “the value foo is of type bar”.
The notation foo :: Bar -> Qux means “foo is a function that takes a value of type Bar and returns a value of type Qux”.
If the exact types of the input/output are not important, we use single lowercase letters, foo :: a -> b.
If foo takes many arguments we add more arrows, i.e. foo :: a -> b -> c means that foo takes two arguments of types a and b and returns something of type c.
() is Haskell notation for the null type.
*/

// pfunc :: (a -> (Error -> b -> ()) -> ()) -> (a -> Promise b)
// (This is not completely general, but it will work for our purposes.)
var pfunc = function(_ifunc, _receiver)
{
	return function()
	{
		var slice   = Array.prototype.slice;
		var args    = slice.call(arguments, 0, _ifunc.length - 1);
		var promise = new Promise();

		args.push(function()
		{
			var results = slice.call(arguments);
			var error   = results.shift();

			if(error)
			{
				promise.reject(error);
			}
			else
			{
				promise.resolve.apply(promise, results);
			}
		});

		_ifunc.apply(_receiver, args);
		return promise;
	};
};

// whole :: [Promise a] -> Promise [Promise a]
var whole = function(_parray)
{
	// Mix-in Promise to Array
	Object.assign(_parray,new Promise());

	var results = [];
	var done = 0;

	_parray.forEach(function(_promise, _i)
	{
		_promise.then(
			function(_result)
			{
				results[_i] = _result;
				done += 1;
				if(done === _parray.length)
				{
					_parray.resolve(results);
				}
			},
			function(error)
			{
				_parray.reject(error);
			}
		);
	});

	if(_parray.length === 0)
	{
		_parray.resolve(results);
	}

	return _parray;
};

// unit() is simply a function that produces an already-resolved promise to start the chain
// (if you know monads, this is the return function for promises):
// unit :: a -> Promise a
var unit = function(_a)
{
  var promise = new Promise();
  promise.resolve(_a);
  return promise;
};

var sequence = function(_array,_pfunc)
{
	var seq = _array.reduce(
		function(_promise, _item)
		{
			return _promise.then
			(
				function()
				{
					return _pfunc(_item);
				}
			);
		},
		unit()
	);

	return seq.then(
	    function() {},
	    function(error) {}
	);
}

/*

This final example is more verbose than the equivalent async code,
but don’t let that deceive you. The key idea here is that we’re
combining the separate ideas of promise values and list operations
to compose programs, rather than relying on custom control flow
libraries. As we saw earlier, the former approach results in
programs that are easier to think about.

And they are easier to think about precisely because we’ve delegated
part of our thought process to the machine. When using the async
module, our thought process is:

A. The tasks in this program depend on each other like so,
B. Therefore the operations must be ordered like so,
C. Therefore let’s write code to express B.

Using graphs of dependent promises lets you skip step B altogether.
You write code that expresses the task dependencies and let the
computer deal with control flow. To put it another way, callbacks
use explicit control flow to glue many small values together,
whereas promises use explicit value relationships to glue many small
bits of control flow together. Callbacks are imperative, promises
are functional.

*/

class LazyPromise extends Promise
{
	constructor (_factory)
	{
		this.factory = _factory;
	}

	then()
	{
		if(!this.started)
		{
			this.started = true;
			var self = this;

			this.factory(function(error, result)
			{
				if (error) self.reject(error);
				else self.resolve(result);
			});
		}
		return super.then.apply(this, arguments);
	}
}
