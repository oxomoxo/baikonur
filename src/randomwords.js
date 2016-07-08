/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

// This code is for testing purpose
// Used to generate fake namespaces and urls etc.

var words = [ 'stimulated','get','unfeeling','law','smart','introduced','laughter','points','income','all','attending','small','stanhill','garret','purse','abilities','get','contented','smallness','discretion','attacks','allowance','announcing','no','set','taken','begin','dissimilar','three','shutters','far','boy','everything','knowledge','devonshire','disposal','not','how','themselves','gate','day','match','decisively','certainly','doubtful','fat','house','offer','tried','understood','rapturous','am','procuring','civility','she','depending','procured','likely','held','elsewhere','longer','offending','excellence','objection','are','principle','need','stairs','provision','diverted','calling','share','her','coming','want','young','woody','lain','noisier','plate','add','cause','chief','widen','whose','neat','overcame','marry','literature','belonging','attachment','decay','extensive','little','entreaties','they','shall','lovers','oppose','otherwise','one','spite','wholly','questions','put','performed','age','china','call','advantage','sex','oh','intention','indulgence','apartments','admitted','garrets','moreover','sigh','equal','was','stand','felt','draw','husbands','become','downs','enough','mr','extremely','direction','walk','favourable','on','its','miles','to','interested','friendly','me','at','esteem','collecting','affronting','denoting','celebrated','has','visitor','remarkably','fruit','seeing','pretend','felicity','settling','entirely','feebly','had','excited','painted','scale','first','residence','cheerful','his','sense','unwilling','form','travelling','turned','favour','give','it','differed','repeated','enable','suffer','sir','delivered','wandered','now','certainty','unable','acceptance','boisterous','continual','merry','waited','in','then','difficult','style','charm','joy','improved','ham','why','abode','both','gentleman','show','yet','few','use','screened','instantly','happiness','this','end','nearer','unpacked','active','really','summer','strictly','regret','spoke','as','other','garden','again','ye','except','wishes','past','mutual','hard','partiality','projection','sang','inhabiting','connection','drew','incommode','side','invitation','linen','whole','everything','looking','we','felicity','likewise','nature','staying','seemed','by','dispatched','exercise','tore','direction','unpleasing','him','greatest','say','is','leave','music','be','led','them','learning','supposing','draw','diminution','impossible','the','imprudence','bed','or','enjoy','listening','new','girl','own','oh','burst','unaffected','discretion','met','my','wife','so','case','high','can','either','in','new','length','wrote','warrant','bred','dull','sorry','our','alone','an','roof','those','and','him','on','evil','of','recommend','indulged','jokes','feelings','northward','way','sometimes','at','man','ye','settling','addition','graceful','because','an','eat','considered','apartments','friendship','five','part','property','danger','his','met','kindness','perceived','dissuade','only','doors','colonel','striking','you','do','needed','polite','feeling','alteration','shy','songs','do','two','but','door','wisdom','warmly','rose','ourselves','edward','if','should','me','common','improving','folly','prevailed','men','order','smallest','gay','ask','opinion','existence','allowance','nor','seems','knew','he','matter','unpleasant','spot','up','person','power','principles','many','necessary','resources','exertion','mr','attention','impression','ready','carried','there','speaking','branch','strangers','sell','such','out','sentiments','seven','required','perpetual' ]

function rnd(_max,_min = 0)
{
  return Math.floor(Math.random() * (_max - _min + 1)) + _min;
}

function word()
{
	return words[rnd(words.length-1)];
}

function path(_len)
{
	var pattern = [];
	for(let i = 0; i < _len; ++i)
	{
		pattern.push(word());
	}
	return '/' + pattern.join('/') + '/';
}

function route(_len,_ph)
{
	var pattern = [];
	_ph = _len - Math.floor(_len * _ph);
	for(let i = _len-1; i >= _ph; --i)
	{
		pattern[i] = '{' + pattern[i] + ':\\\\d+}';
	}
	pattern = path(_len) + pattern.join('/') + '/';
	return "router.addRoute(new Route(['get'],'" + pattern + '\',new Target()));'
}

function object(_len)
{
	var pattern = [];
	for(let i = 0; i < _len; ++i)
	{
		pattern.push(word());
	}
	return pattern.join('.');
}

module.exports.rnd = rnd;
module.exports.word = word;
module.exports.path = path;
module.exports.route = route;
module.exports.object = object;
