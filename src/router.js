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
const HttpIO = require('./httpio.js');
const Branch = require('./branch.js');
const Clonable = require('./clonable.js');

class TargetInterface
{
	run(_rt)
	{
		return _rt;
	}
}

class Route extends Clonable
{
	constructor(_methods,_pattern,_target,_parent)
	{
		super({
			methods: _methods,
			pattern: _pattern,
			target: _target,
			parent: _parent
		});
	}
}

class RouteBranch extends Branch
{
	constructor(_path,_parent = null)
	{
		super(_path,_parent);
		this.checkRegX(this.element);
	}

	addRegX(_param,_regx,_branch)
	{
		Log.dbgTrace('RegX : ',_param,_regx);
		if(!this.regxes)
		{
			this.regxes = [];
		}
		this.regxes.push({
			branch:_branch,
			name:_param,
			regx:_regx
		});
	}

	checkRegX(_str)
	{
		var o = _str.indexOf('{');
		var p = _str.indexOf(':');
		var c = _str.indexOf('}');

		if(p < o && o >= 0 && c > o) // colon not found => provide dummy regexp
		{
			let name = _str.substring(o+1,c-1);

			this.parent.addRegX(name,{test:()=>true},this);
		}
		else if(o >= 0 && p > o && c > p)
		{
			let name = _str.substring(o+1,p);
			let regx = _str.substring(p+1,c-1);

			this.parent.addRegX(name,new RegExp(regx),this);
		}

		return _str;
	}

	dispatch(_rt,_path = 0,_attribs = {})
	{
		var split = _rt.req.data.split;
		var length = _rt.req.data.split.length;

		Log.dbgTrace('Dispatching : %d - %s', _path, this.element, split);

		if(this.leaf) // leaf !
		{
			Log.dbgTrace('Leaf Found');
			if(_path < length)
			{
				// TODO : Handle Premature Match
				return _rt;
			}

			_rt.req = _rt.req.withAttributes(_attribs);
			return this.leaf.target.run(_rt);
		}

		if(length - _path < 1)
		{
			Log.dbgTrace('Leaf NOT Found',this.leaf);
			// TODO : Handle Error
			_rt.res.withStatus(404, 'File Not Found');
			return _rt;
		}

		var child = split[_path++];
		Log.dbgTrace('Checking : ', child);
		if(this.regxes)
		{
			Log.dbgTrace('In Regx');
			for(let match of this.regxes)
			{
				if(match.regx.test(child))
				{
					Log.dbgTrace('Found RegX !');
					_attribs[match.name] = parseFloat(child) || child;
					return match.branch.dispatch(_rt,_path,_attribs);
				}
			}
		}

		if(this.childs[child])
		{
			Log.dbgTrace('Found Child !');
			Log.dbgTrace(this.childs[child]);
			return this.childs[child].dispatch(_rt,_path,_attribs);
		}

		Log.dbgTrace('Unmatch ! Childs : ',this.childs);
		// TODO : Handle Error
		_rt.res = _rt.res.withStatus(404,'File Not Found');
		return _rt;
	}
}

class RouterInterface
{
	addRoute(_route)
	{
		return this;
	}

	dispatch(_rt)
	{
		return _rt;
	}

	cleanSplit(_str)
	{
		Log.dbgTrace('Splitting : ',_str);
		var split = _str.split('/');
		if(split[0] == '') split.shift();
		// allow route & route/ to differ
		// if(split[split.length-1] == '') split.pop();
		return split;
	}
}

class Router extends RouterInterface
{
	constructor()
	{
		super();

		this.branches = Object.create(null); // no prototype
		Object.assign(this.branches,{
			get:new RouteBranch('get'),
			post:new RouteBranch('post'),
			put:new RouteBranch('put'),
			patch:new RouteBranch('patch'),
			delete:new RouteBranch('delete'),
			options:new RouteBranch('options')
		});
	}

	addRoute(_route)
	{
		for(let method of _route.methods)
		{
			method = method.toLowerCase();

			if(!this.branches[method])
			{
				continue;
			}

			let path = this.cleanSplit(_route.pattern);
			_route.addProp('parent',this.branches[method].settle(path,_route));
			Log.dbgTrace(_route.parent);
		}
		return this;
	}

	dispatch(_rt)
	{
		var method = _rt.req.method.toLowerCase();

		if(!this.branches[method])
		{
			Log.dbgTrace('Wrong method : ',method);
			Log.dbgTrace(qb.prettyString(this.branches));
			// TODO : Handle Error
			return;
		}

		if(!qb.isArray(_rt.req.data.split))
		{
			_rt.req.data.split = this.cleanSplit(_rt.req.uri.path);
		}

		var branch = this.branches[method];

		return branch.dispatch(_rt);
	}

	cleanSplit(_str)
	{
		Log.dbgTrace('Splitting : ',_str);
		var split = _str.split('/');

		if(split[0] == '') split.shift();
		// allow route & route/ to differ
		// if(split[split.length-1] == '') split.pop();

		return split;
	}

	dump(_tab = "    ")
	{
		var ret = '';
		for(let branch in this.branches)
		{
			ret += this.branches[branch].dump(_tab,0);
		}
		return ret;
	}
}

module.exports = Router;
module.exports.Route = Route;

module.exports.TargetInterface = TargetInterface;
module.exports.RouterInterface = RouterInterface;




// TESTS

/*
var router = new Router();
router.addRoute(new Route(['get','post'],'/grumeau/{method:\\w+}/{id:\\d+}/',new Target()));

// Url : http://user:pass@server.com/some/quite/deep/path/to/an/grumeau/edit/123?possibly=some&state=data;
// Pattern : /some/quite/deep/path/to/an/grumeau/{method:\\w+}/{id:\\d+}/

var req = new HttpIO.ServerRequest('GET','http://user:pass@server.com/grumeau/edit/123?possibly=some&state=data;');
var res = new HttpIO.ServerResponse(process.stdout);

router.dispatch(_rt);
Log.out(router.dump())

/*
// * 0 - 100 *

router.addRoute(new Route(['get'],'/understood/ourselves/exertion/{on:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/laughter/strangers/',new Target()));
router.addRoute(new Route(['get'],'/seven/depending/plate/he/unpleasing/',new Target()));
router.addRoute(new Route(['get'],'/smallness/has/provision/',new Target()));
router.addRoute(new Route(['get'],'/set/active/',new Target()));
router.addRoute(new Route(['get'],'/on/common/',new Target()));
router.addRoute(new Route(['get'],'/felicity/be/up/mutual/',new Target()));
router.addRoute(new Route(['get'],'/depending/it/carried/him/',new Target()));
router.addRoute(new Route(['get'],'/ready/property/',new Target()));
router.addRoute(new Route(['get'],'/girl/house/',new Target()));
router.addRoute(new Route(['get'],'/supposing/indulged/extremely/{decay:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/denoting/announcing/moreover/far/husbands/',new Target()));
router.addRoute(new Route(['get'],'/shy/invitation/allowance/if/entreaties/',new Target()));
router.addRoute(new Route(['get'],'/waited/our/had/joy/',new Target()));
router.addRoute(new Route(['get'],'/garret/exercise/call/person/introduced/',new Target()));
router.addRoute(new Route(['get'],'/looking/direction/had/',new Target()));
router.addRoute(new Route(['get'],'/two/lain/',new Target()));
router.addRoute(new Route(['get'],'/intention/ye/favourable/',new Target()));
router.addRoute(new Route(['get'],'/connection/sang/',new Target()));
router.addRoute(new Route(['get'],'/waited/there/',new Target()));
router.addRoute(new Route(['get'],'/own/felicity/questions/music/',new Target()));
router.addRoute(new Route(['get'],'/five/nature/',new Target()));
router.addRoute(new Route(['get'],'/understood/roof/esteem/{waited:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/boy/seemed/oppose/',new Target()));
router.addRoute(new Route(['get'],'/because/she/songs/{few:\\d+}/{procured:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/all/use/are/nor/',new Target()));
router.addRoute(new Route(['get'],'/calling/on/oppose/',new Target()));
router.addRoute(new Route(['get'],'/direction/house/settling/performed/{tore:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/either/person/then/am/{music:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/boy/income/direction/{many:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/allowance/spite/indulgence/',new Target()));
router.addRoute(new Route(['get'],'/ye/at/really/as/{whole:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/longer/needed/announcing/become/denoting/',new Target()));
router.addRoute(new Route(['get'],'/an/me/',new Target()));
router.addRoute(new Route(['get'],'/remarkably/scale/{equal:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/we/smallest/smallness/',new Target()));
router.addRoute(new Route(['get'],'/length/begin/we/stimulated/',new Target()));
router.addRoute(new Route(['get'],'/five/it/by/{exercise:\\d+}/{many:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/excited/they/carried/',new Target()));
router.addRoute(new Route(['get'],'/bed/difficult/plate/{certainty:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/civility/income/spoke/',new Target()));
router.addRoute(new Route(['get'],'/diverted/collecting/spoke/points/or/',new Target()));
router.addRoute(new Route(['get'],'/interested/northward/settling/{spite:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/lain/needed/mr/spite/',new Target()));
router.addRoute(new Route(['get'],'/gentleman/they/difficult/remarkably/',new Target()));
router.addRoute(new Route(['get'],'/graceful/seems/{unpacked:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/young/whose/joy/{favour:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/they/settling/',new Target()));
router.addRoute(new Route(['get'],'/music/mr/abilities/sir/{friendly:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/oh/widen/apartments/',new Target()));
router.addRoute(new Route(['get'],'/unaffected/delivered/sometimes/man/{abode:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/felt/mr/announcing/direction/{impression:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/extensive/walk/',new Target()));
router.addRoute(new Route(['get'],'/smallest/allowance/person/',new Target()));
router.addRoute(new Route(['get'],'/few/gentleman/introduced/{equal:\\d+}/{instantly:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/her/burst/{extensive:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/northward/met/miles/',new Target()));
router.addRoute(new Route(['get'],'/acceptance/celebrated/recommend/',new Target()));
router.addRoute(new Route(['get'],'/perpetual/remarkably/part/{small:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/unpleasing/young/property/he/{at:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/want/improved/neat/',new Target()));
router.addRoute(new Route(['get'],'/them/gentleman/',new Target()));
router.addRoute(new Route(['get'],'/colonel/five/striking/draw/offending/',new Target()));
router.addRoute(new Route(['get'],'/gay/ye/striking/wrote/interested/',new Target()));
router.addRoute(new Route(['get'],'/eat/need/lain/enjoy/{felicity:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/not/shy/certainty/',new Target()));
router.addRoute(new Route(['get'],'/become/extremely/',new Target()));
router.addRoute(new Route(['get'],'/not/draw/repeated/{set:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/points/visitor/',new Target()));
router.addRoute(new Route(['get'],'/taken/residence/addition/{esteem:\\d+}/{indulged:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/greatest/chief/',new Target()));
router.addRoute(new Route(['get'],'/miles/sir/him/',new Target()));
router.addRoute(new Route(['get'],'/smart/spot/add/literature/{performed:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/such/edward/spite/gate/{music:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/intention/except/impression/',new Target()));
router.addRoute(new Route(['get'],'/person/at/',new Target()));
router.addRoute(new Route(['get'],'/drew/in/strictly/',new Target()));
router.addRoute(new Route(['get'],'/use/china/',new Target()));
router.addRoute(new Route(['get'],'/merry/spoke/',new Target()));
router.addRoute(new Route(['get'],'/kindness/alteration/',new Target()));
router.addRoute(new Route(['get'],'/get/everything/settling/two/',new Target()));
router.addRoute(new Route(['get'],'/ask/noisier/{dispatched:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/sorry/in/warmly/{one:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/improved/addition/own/apartments/{projection:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/sorry/contented/spoke/wrote/{knowledge:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/this/gentleman/felt/',new Target()));
router.addRoute(new Route(['get'],'/day/ye/rapturous/allowance/',new Target()));
router.addRoute(new Route(['get'],'/dissimilar/person/',new Target()));
router.addRoute(new Route(['get'],'/get/opinion/tried/income/men/',new Target()));
router.addRoute(new Route(['get'],'/such/prevailed/an/its/{elsewhere:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/part/discretion/',new Target()));
router.addRoute(new Route(['get'],'/required/his/staying/dissimilar/',new Target()));
router.addRoute(new Route(['get'],'/felicity/abilities/knowledge/delivered/his/',new Target()));
router.addRoute(new Route(['get'],'/on/opinion/likewise/way/{unable:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/impossible/small/polite/',new Target()));
router.addRoute(new Route(['get'],'/property/regret/',new Target()));
router.addRoute(new Route(['get'],'/many/instantly/',new Target()));
router.addRoute(new Route(['get'],'/collecting/oppose/warmly/yet/him/',new Target()));
router.addRoute(new Route(['get'],'/indulgence/needed/carried/{leave:\\d+}/{connection:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/seven/danger/led/{this:\\d+}/',new Target()));

// * 100 - 200 *

router.addRoute(new Route(['get'],'/boisterous/rapturous/{sigh:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/seemed/show/',new Target()));
router.addRoute(new Route(['get'],'/get/understood/gentleman/{instantly:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/procuring/objection/music/',new Target()));
router.addRoute(new Route(['get'],'/colonel/his/{danger:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/northward/not/he/delivered/',new Target()));
router.addRoute(new Route(['get'],'/instantly/excellence/',new Target()));
router.addRoute(new Route(['get'],'/songs/calling/provision/oppose/{sigh:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/elsewhere/begin/day/opinion/{evil:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/felicity/downs/',new Target()));
router.addRoute(new Route(['get'],'/then/abode/contented/',new Target()));
router.addRoute(new Route(['get'],'/new/use/',new Target()));
router.addRoute(new Route(['get'],'/songs/understood/improved/shall/',new Target()));
router.addRoute(new Route(['get'],'/other/as/one/sentiments/difficult/',new Target()));
router.addRoute(new Route(['get'],'/neat/required/{of:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/greatest/esteem/',new Target()));
router.addRoute(new Route(['get'],'/noisier/china/',new Target()));
router.addRoute(new Route(['get'],'/residence/all/',new Target()));
router.addRoute(new Route(['get'],'/form/her/either/joy/use/',new Target()));
router.addRoute(new Route(['get'],'/apartments/neat/shall/{is:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/dissimilar/this/person/devonshire/up/',new Target()));
router.addRoute(new Route(['get'],'/share/provision/widen/sense/',new Target()));
router.addRoute(new Route(['get'],'/give/jokes/{sell:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/necessary/enjoy/gentleman/{sir:\\d+}/{enjoy:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/discretion/not/girl/{admitted:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/stairs/recommend/unpacked/little/{decisively:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/past/alteration/',new Target()));
router.addRoute(new Route(['get'],'/perpetual/warmly/',new Target()));
router.addRoute(new Route(['get'],'/principle/seemed/ye/',new Target()));
router.addRoute(new Route(['get'],'/needed/show/extremely/{few:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/resources/happiness/',new Target()));
router.addRoute(new Route(['get'],'/instantly/seeing/drew/ourselves/',new Target()));
router.addRoute(new Route(['get'],'/wishes/walk/continual/{yet:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/chief/resources/match/in/so/',new Target()));
router.addRoute(new Route(['get'],'/excellence/common/disposal/should/{interested:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/remarkably/there/oppose/',new Target()));
router.addRoute(new Route(['get'],'/mr/past/',new Target()));
router.addRoute(new Route(['get'],'/connection/him/length/',new Target()));
router.addRoute(new Route(['get'],'/other/at/',new Target()));
router.addRoute(new Route(['get'],'/is/inhabiting/{there:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/diverted/polite/imprudence/walk/in/',new Target()));
router.addRoute(new Route(['get'],'/neat/civility/side/existence/the/',new Target()));
router.addRoute(new Route(['get'],'/smart/overcame/cause/',new Target()));
router.addRoute(new Route(['get'],'/law/impression/mutual/',new Target()));
router.addRoute(new Route(['get'],'/enable/laughter/introduced/man/{everything:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/abode/exertion/',new Target()));
router.addRoute(new Route(['get'],'/exercise/lain/whose/painted/gate/',new Target()));
router.addRoute(new Route(['get'],'/rose/performed/',new Target()));
router.addRoute(new Route(['get'],'/an/unaffected/certainly/this/',new Target()));
router.addRoute(new Route(['get'],'/are/gate/acceptance/stairs/become/',new Target()));
router.addRoute(new Route(['get'],'/perceived/northward/',new Target()));
router.addRoute(new Route(['get'],'/northward/dispatched/',new Target()));
router.addRoute(new Route(['get'],'/looking/performed/direction/diverted/',new Target()));
router.addRoute(new Route(['get'],'/diverted/announcing/{unaffected:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/sell/entreaties/{are:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/equal/evil/stimulated/spoke/{can:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/wandered/felt/met/out/{incommode:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/there/pretend/',new Target()));
router.addRoute(new Route(['get'],'/far/smart/rapturous/sell/',new Target()));
router.addRoute(new Route(['get'],'/turned/unwilling/side/ourselves/{cause:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/new/abilities/either/small/{two:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/discretion/dispatched/{many:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/settling/need/{elsewhere:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/draw/points/',new Target()));
router.addRoute(new Route(['get'],'/required/resources/need/use/{her:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/striking/offer/dissuade/linen/',new Target()));
router.addRoute(new Route(['get'],'/unaffected/met/',new Target()));
router.addRoute(new Route(['get'],'/get/delivered/unpacked/decisively/{matter:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/music/widen/spot/{evil:\\d+}/{favour:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/add/smallest/part/',new Target()));
router.addRoute(new Route(['get'],'/coming/on/',new Target()));
router.addRoute(new Route(['get'],'/woody/differed/',new Target()));
router.addRoute(new Route(['get'],'/tore/connection/',new Target()));
router.addRoute(new Route(['get'],'/hard/such/jokes/house/{begin:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/garden/cause/objection/abilities/',new Target()));
router.addRoute(new Route(['get'],'/travelling/power/put/',new Target()));
router.addRoute(new Route(['get'],'/mr/want/so/{not:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/indulgence/power/everything/',new Target()));
router.addRoute(new Route(['get'],'/at/greatest/smallest/provision/{strictly:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/stairs/friendship/supposing/',new Target()));
router.addRoute(new Route(['get'],'/in/them/{her:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/roof/they/',new Target()));
router.addRoute(new Route(['get'],'/man/his/',new Target()));
router.addRoute(new Route(['get'],'/considered/offer/',new Target()));
router.addRoute(new Route(['get'],'/then/why/',new Target()));
router.addRoute(new Route(['get'],'/inhabiting/jokes/longer/are/happiness/',new Target()));
router.addRoute(new Route(['get'],'/be/indulged/literature/{contented:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/alteration/wisdom/do/seeing/{equal:\\d+}/',new Target()));
router.addRoute(new Route(['get'],'/has/income/girl/had/',new Target()));
router.addRoute(new Route(['get'],'/sorry/begin/attachment/person/had/',new Target()));
router.addRoute(new Route(['get'],'/power/remarkably/unaffected/',new Target()));
router.addRoute(new Route(['get'],'/neat/if/doubtful/sang/',new Target()));
router.addRoute(new Route(['get'],'/sentiments/turned/strictly/',new Target()));
router.addRoute(new Route(['get'],'/everything/striking/',new Target()));
router.addRoute(new Route(['get'],'/other/her/',new Target()));
router.addRoute(new Route(['get'],'/seven/stairs/me/',new Target()));
router.addRoute(new Route(['get'],'/sentiments/at/direction/',new Target()));
router.addRoute(new Route(['get'],'/connection/discretion/',new Target()));
router.addRoute(new Route(['get'],'/continual/few/',new Target()));
router.addRoute(new Route(['get'],'/is/his/depending/{advantage:\\d+}/',new Target()));


// router.dumpTree();

var first = new HttpIO.ServerRequest('GET','http://user:pass@server.com/understood/ourselves/exertion/123/?possibly=some&state=data;');
Log.time('first');
for(let i = 0; i < 10000; ++i)
{
	router.dispatch(first,res);
	first.data.split = null;
}
Log.timeEnd('first');

var mid = new HttpIO.ServerRequest('GET','http://user:pass@server.com/seven/danger/led/123/?possibly=some&state=data;');
Log.time('mid');
for(let i = 0; i < 10000; ++i)
{
	router.dispatch(mid,res);
	mid.data.split = null;
}
Log.timeEnd('mid');

var last = new HttpIO.ServerRequest('GET','http://user:pass@server.com/is/his/depending/123/?possibly=some&state=data;');
Log.time('last');
for(let i = 0; i < 10000; ++i)
{
	router.dispatch(last,res);
	last.data.split = null;
}
Log.timeEnd('last');
*/

/*
for(let i = 0; i < 100; ++i)
{
	Log.out(rw.route(rw.rnd(5,2),Math.random()*0.5));
}
*/