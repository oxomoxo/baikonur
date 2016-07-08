/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

class Console
{
	log () {};
	dbg () {};
	error () {};
	push () {};
	pop () {};
	time () {};
	timeEnd () {};
	clear () {};
}


class DefConsole extends Console
{
	log () {console.log.apply(console,arguments)};
	dbg () {console.log.apply(console,arguments)};
	error () {console.error.apply(console,arguments)};
	time () {console.time.apply(console,arguments)};
	timeEnd () {console.timeEnd.apply(console,arguments)};
}


class Log
{
	static init(_primary = new DefConsole())
	{
		// Log.dbgflags = -1;
		Log.dbgflags = 0;

		Log.channels = [_primary];
		Log.channels.concat(Array.from(arguments));

		let n = 0;
		for(let i of Log.channels)
		{
			i.channel = n++;
		}

		return Log;
	}

	static dbgFlags(_channels)
	{
		Log.dbgflags = _channels;

		return Log;
	}

	static addChannel(_console)
	{
		if(!Log.channels) Log.init();

		_console.channel = Log.channels.length;
		Log.channels.push(_console);

		return Log;
	}

	static removeChannel(_channel)
	{
		if(!Log.channels) Log.init();

		Log.channels.splice(_channel,1);

		return Log;
	}

	static dispatch(_method,_arguments)
	{
		if(!Log.channels) Log.init();

		for(let channel of Log.channels)
		{
			channel[_method].apply(null,_arguments);
		}

		return Log;
	}

	static dbg(_channel,_arguments)
	{
		if(!Log.channels) Log.init();

		if((Log.dbgflags & _channel) == 0) return;

		return Log.dispatch('dbg',_arguments);
	}

	static dbgChannel(_channel) // zero based
	{
		_channel = Log.DBG_CHANNEL << _channel;
		if(Log.dbgflags & _channel == 0) return;

		var args = Array.prototype.slice.call(arguments,1);
		return Log.dbg(_channel,args);
	}

	static out() {Log.dispatch('log',arguments);}
	static error() {Log.dispatch('error',arguments);}
	static push() {Log.dispatch('push',arguments);}
	static pop() {Log.dispatch('pop',arguments);}
	static time() {Log.dispatch('time',arguments);}
	static timeEnd() {Log.dispatch('timeEnd',arguments);}
	static clear() {Log.dispatch('clear',arguments);}

	static dbgTrace() {Log.dbg(Log.DBG_TRACE,arguments);}
	static dbgInfo() {Log.dbg(Log.DBG_INFO,arguments);}
	static dbgWarning() {Log.dbg(Log.DBG_WARNING,arguments);}
	static dbgError() {Log.dbg(Log.DBG_ERROR,arguments);}
	static dbgFatal() {Log.dbg(Log.DBG_FATAL,arguments);}
}

Log.DBG_FATAL		= 0x0001;	// Standard debug channels are incremental
Log.DBG_ERROR		= 0x0003;	// higher channels include lower ones :
Log.DBG_WARNING		= 0x0007;	// WARNING includes ERROR includes FATAL etc.
Log.DBG_INFO		= 0x000F;
Log.DBG_TRACE		= 0x001F;	// TRACE could generate a shitload of ... traces
Log.DBG_CHANNEL		= 0x10000;	// Bits up from here are 'custom channels'

module.exports = Log;
module.exports.Console = Console;
module.exports.DefConsole = DefConsole;

/* TESTS */

/*
Log.out('dbgTest');
Log.dbgInfo('dbgInfo');
Log.dbgWarning('dbgWarning');
Log.dbgError('dbgError');
Log.dbgFail('dbgFail');
Log.dbgChannel(1,'DBG_CHANNEL01');

/*
qb.log = function(){};
qb.error = function(){};
qb.cPush = function(){};
qb.cPop = function(){};
qb.logClear = function(){};

if(qb.config.Debug.Enabled)
{
	if(qb.isObject(window.console) && qb.isFunction(window.console.debug))
 	{
		qb.log = function ()
		{
			window.console.debug.apply(window.console,arguments);
		}

		qb.error = function()
		{
			window.console.error.apply(window.console,arguments);
		}

		if(qb.isFunction(window.console.clear))
		{
			qb.logClear = function()
			{
				window.console.clear.apply(window.console,arguments);
			}
		}
		else
		{
			qb.logClear = function(){};
		}

		if(qb.isFunction(window.console.groupCollapsed))
		{
			qb.cPush = function()
			{
				window.console.groupCollapsed.apply(window.console,arguments);
			}
			qb.cPop = function()
			{
				window.console.groupEnd.apply(window.console,arguments);
			}
		}
		else if(qb.isFunction(window.console.group))
		{
			qb.cPush = function()
			{
				window.console.group.apply(window.console,arguments);
			}
			qb.cPop = function()
			{
				window.console.groupEnd.apply(window.console,arguments);
			}
		}
		else
		{
			qb.cPush = function(){};
			qb.cPop = function(){};
		}
 	}
 	else
	{
		qb.logClear = function()
		{
			if(qb.rConsole)
			{
				qb.onDOMReady(function()
				{
					document.body.removeChild(qb.rConsole);
				});
			}
			qb.console = qb.rConsole = document.createElement('div');
			qb.console.style.clear = "both";
			qb.cPush('Application Log :'); // qb.application.GetName() +
			qb.onDOMReady(function()
			{
				document.body.appendChild(qb.rConsole);
			});
		}

		qb.log = function()
		{
			if(!qb.rConsole)
			{
				qb.logClear();
			}
			var html = qb.toString.apply(this,arguments);
			var p = document.createElement('pre');
			p.style.margin = "1px";
			p.style.paddingLeft = "4px";
			p.style.border = "1px outset #321";
			p.style.background = "#321";
			p.style.fontSize = '14px';
			p.style.color = '#F60';
			p.style.whiteSpace = 'pre';
			p.style.fontFamily = 'Courier New';
			p.style.wordWrap = 'normal';

			p.appendChild(document.createTextNode(html));
			qb.console.appendChild(p);

			return p;
		};

		qb.error = function()
		{
			var a = Array.prototype.slice.call(arguments);
			a.unshift('!ERROR! : ');
			qb.log.apply(this,a);
		};

		qb.cPush = function()
		{
			if(!qb.rConsole)
			{
				qb.logClear();
			}

			var a = Array.prototype.slice.call(arguments);
			a.unshift('+ ');
			var p = qb.log.apply(this,a);

			p.style.background = "#A50";
			p.style.color = '#321';
			p.style.fontStyle = 'italic';
			p.style.fontWeight = 'bold';

			p.open = false;
			p.onclick = function(_lap)
			{
				if(this.open === true)
				{
					this.nextSibling.style.display = 'none';
					this.open = false;
					p.style.marginBottom = '1px';
					this.innerHTML = '+' + this.innerHTML.substr(1)
				}
				else
				{
					this.nextSibling.style.display = 'block';
					this.open = true;
					p.style.marginBottom = '1px';
					this.innerHTML = '-' + this.innerHTML.substr(1)
				}
			}

			var bq = document.createElement('blockquote');

			bq.style.padding = "1px 1px 1px 20px";
			bq.style.margin = "1px";
			bq.style.border = "1px inset #310";
			bq.style.background = "#310";
			bq.style.textAlign = 'left';
			bq.style.display = 'none';
			bq.style.whiteSpace = 'pre';
			bq.style.fontFamily = 'Courier New';
			p.style.wordWrap = 'normal';

			bq.className = 'log_block'

			qb.console.appendChild(bq);

			qb.console = bq;
		};

		qb.cPop = function()
		{
			if(qb.console != qb.rConsole)
			{
				qb.console = qb.console.parentNode;
			}
		};
	}
}
*/

/*
*/
