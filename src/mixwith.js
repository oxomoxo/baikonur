/*

This code is part of the aqnb project :
https://github.com/oxomoxo/aqnb

Author: Justin Fagnani
https://github.com/justinfagnani/mixwith.js/blob/master/src/mixwith.js

*/
// @flow
"use strict";

_mixinRef = Symbol('_mixinRef');
module.export._mixinRef = _mixinRef;

_originalMixin = Symbol('_originalMixin');
module.export._originalMixin = _originalMixin;

_cachedApplicationRef = Symbol('_cachedApplicationRef');
module.export._cachedApplicationRef = _cachedApplicationRef;

/**
 * Sets the prototype of mixin to wrapper so that properties set on mixin are
 * inherited by the wrapper.
 *
 * This is needed in order to implement @@hasInstance as a decorator function.

function Wrap(_mixin, _wrapper)
{
	Object.setPrototypeOf(_wrapper, _mixin);

	if(!_mixin[_originalMixin])
	{
		_mixin[_originalMixin] = _mixin;
	}

	return _wrapper;
};

 */

Wrap = (_mixin, _wrapper) =>
{
	Object.setPrototypeOf(_wrapper, _mixin);

	if(!_mixin[_originalMixin])
	{
		_mixin[_originalMixin] = _mixin;
	}

	return _wrapper;
};
module.export.Wrap = Wrap;

/**
 * Decorates mixin so that it caches its applications. When applied multiple
 * times to the same superclass, mixin will only create one subclass and
 * memorize it.

function Cached(_mixin)
{
	Wrap(_mixin, function(_superclass)
	{
		// Get or create a symbol used to look up a previous application of mixin
		// to the class. This symbol is unique per mixin definition, so a class will have N
		// applicationRefs if it has had N mixins applied to it. A mixin will have
		// exactly one _cachedApplicationRef used to store its applications.

		let applicationRef = _mixin[_cachedApplicationRef];

		if(!applicationRef)
		{
			applicationRef = _mixin[_cachedApplicationRef] = Symbol(_mixin.name);
		}

		// Look up an existing application of `mixin` to `c`, return it if found.
		if(_superclass.hasOwnProperty(applicationRef))
		{
			return _superclass[applicationRef];
		}

		// Apply the mixin
		let application = _mixin(_superclass);

		// Cache the mixin application on the superclass
		_superclass[applicationRef] = application;

		return application;
	});
}

 */

Cached = (_mixin) => Wrap(_mixin, (_superclass) =>
{
	// Get or create a symbol used to look up a previous application of mixin
	// to the class. This symbol is unique per mixin definition, so a class will have N
	// applicationRefs if it has had N mixins applied to it. A mixin will have
	// exactly one _cachedApplicationRef used to store its applications.

	let applicationRef = _mixin[_cachedApplicationRef];

	if(!applicationRef)
	{
		applicationRef = _mixin[_cachedApplicationRef] = Symbol(_mixin.name);
	}

	// Look up an existing application of `mixin` to `c`, return it if found.
	if(_superclass.hasOwnProperty(applicationRef))
	{
		return _superclass[applicationRef];
	}

	// Apply the mixin
	let application = _mixin(_superclass);

	// Cache the mixin application on the superclass
	_superclass[applicationRef] = application;

	return application;
});
module.export.Cached = Cached;

/**
 * Adds @@hasInstance (ES2015 instanceof support) to mixin.
 * Note: @@hasInstance is not supported in any browsers yet.

function HasInstance(_mixin)
{
	if(Symbol.hasInstance && !_mixin.hasOwnProperty(Symbol.hasInstance))
	{
		Object.defineProperty(_mixin, Symbol.hasInstance,
		{
			value: function(_obj)
			{
				const originalMixin = this[_originalMixin];

				while(_obj != null)
				{
					if(_obj.hasOwnProperty(_mixinRef) && _obj[_mixinRef] === originalMixin)
					{
						return true;
					}

					_obj = Object.getPrototypeOf(_obj);
				}

				return false;
			}

		});
	}

	return _mixin;
};

 */

HasInstance = (_mixin) =>
{
	if(Symbol.hasInstance && !_mixin.hasOwnProperty(Symbol.hasInstance))
	{
		Object.defineProperty(_mixin, Symbol.hasInstance,
		{
			value: function(_obj)
			{
				const originalMixin = this[_originalMixin];

				while (_obj != null)
				{
					if(_obj.hasOwnProperty(_mixinRef) && _obj[_mixinRef] === originalMixin)
					{
						return true;
					}

					_obj = Object.getPrototypeOf(_obj);
				}

				return false;
			}

		});
	}

	return _mixin;
};
module.export.HasInstance = HasInstance;

/**
 * A basic mixin decorator that sets up a reference from mixin applications
 * to the mixin defintion for use by other mixin decorators.

function BareMixin(_mixin)
{
	Wrap(_mixin, function(_superclass)
	{
		// Apply the mixin
		let application = _mixin(_superclass);

		// Attach a reference from mixin applition to wrapped mixin for RTTI
		// mixin[@@hasInstance] should use this.
		application.prototype[_mixinRef] = _mixin[_originalMixin];

		return application;
	});
}

 */

BareMixin = (_mixin) => Wrap(_mixin, (_superclass) =>
{
	// Apply the mixin
	let application = _mixin(_superclass);

	// Attach a reference from mixin applition to wrapped mixin for RTTI
	// mixin[@@hasInstance] should use this.
	application.prototype[_mixinRef] = _mixin[_originalMixin];

	return application;
});
module.export.BareMixin = BareMixin;

/**
 * Decorates a mixin function to add application caching and instanceof
 * support.

var CalculatorMixin = function (Base)
{
	return class extends Base
	{
		calc() { }
	};
}

 */

Mixin = (_mixin) => Cached(HasInstance(BareMixin(_mixin)));

mix = (_superclass) => new MixinBuilder(_superclass);

class MixinBuilder
{
	constructor(_superclass)
	{
		this.superclass = _superclass;
	}

	with()
	{
		return Array.from(arguments).reduce((_class, _mixin) => _mixin(_class), this.superclass);
	}
}

module.export.Mixin = Mixin;
module.export.mix = mix;
