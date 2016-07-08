/*

	This code is part of the aqnb project :
	https://github.com/oxomoxo/aqnb

	Author: Lorenzo Pastrana
	https://github.com/oxomoxo

*/
// @flow
"use strict";

const stream = require('stream');

const qb = require('./qb.js');

const Log = require('./log.js');
const App = require('./app.js');
const Router = require('./router.js');
const Server = require('./server.js');
const HttpIO = require('./httpio.js');
const StreamBuff = require('./streambuff.js');

const StaticMW = require('./mw/static.js');
const CompressionMW = require('./mw/compression.js');
const ReqBodyMW = require('./mw/reqbody.js');
const BodySizeMW = require('./mw/bodysize.js');

/* TESTS */

class RT extends Router.TargetInterface
{
	run(_rt)
	{
		// _rt.res.body.write('<h1>Route Target Executed!</h1>\n<pre>' + qb.prettyString(_rt) + '</pre>');
		_rt.res.body.write('<h1>Route Target Executed!</h1>\n');
	}
}
var rt = new RT();

var app = new App('./test.conf');
// app.use(new ReqBodyMW());
app.use(new StaticMW('/home/dev/Documents/PROJECTS/SRC/butterfish/static'));
app.use(new CompressionMW());

app.routeGet('/ok/{file:\\.+}',rt);

// app.listen(8080);

var target = rt;

app.routeGet('/understood/ourselves/exertion/{on:\\d+}/',target);
app.routeGet('/laughter/strangers/',target);
app.routeGet('/seven/depending/plate/he/unpleasing/',target);
app.routeGet('/smallness/has/provision/',target);
app.routeGet('/set/active/',target);
app.routeGet('/on/common/',target);
app.routeGet('/felicity/be/up/mutual/',target);
app.routeGet('/depending/it/carried/him/',target);
app.routeGet('/ready/property/',target);
app.routeGet('/girl/house/',target);
app.routeGet('/supposing/indulged/extremely/{decay:\\d+}/',target);
app.routeGet('/denoting/announcing/moreover/far/husbands/',target);
app.routeGet('/shy/invitation/allowance/if/entreaties/',target);
app.routeGet('/waited/our/had/joy/',target);
app.routeGet('/garret/exercise/call/person/introduced/',target);
app.routeGet('/looking/direction/had/',target);
app.routeGet('/two/lain/',target);
app.routeGet('/intention/ye/favourable/',target);
app.routeGet('/connection/sang/',target);
app.routeGet('/waited/there/',target);
app.routeGet('/own/felicity/questions/music/',target);
app.routeGet('/five/nature/',target);
app.routeGet('/understood/roof/esteem/{waited:\\d+}/',target);
app.routeGet('/boy/seemed/oppose/',target);
app.routeGet('/because/she/songs/{few:\\d+}/{procured:\\d+}/',target);
app.routeGet('/all/use/are/nor/',target);
app.routeGet('/calling/on/oppose/',target);
app.routeGet('/direction/house/settling/performed/{tore:\\d+}/',target);
app.routeGet('/either/person/then/am/{music:\\d+}/',target);
app.routeGet('/boy/income/direction/{many:\\d+}/',target);
app.routeGet('/allowance/spite/indulgence/',target);
app.routeGet('/ye/at/really/as/{whole:\\d+}/',target);
app.routeGet('/longer/needed/announcing/become/denoting/',target);
app.routeGet('/an/me/',target);
app.routeGet('/remarkably/scale/{equal:\\d+}/',target);
app.routeGet('/we/smallest/smallness/',target);
app.routeGet('/length/begin/we/stimulated/',target);
app.routeGet('/five/it/by/{exercise:\\d+}/{many:\\d+}/',target);
app.routeGet('/excited/they/carried/',target);
app.routeGet('/bed/difficult/plate/{certainty:\\d+}/',target);
app.routeGet('/civility/income/spoke/',target);
app.routeGet('/diverted/collecting/spoke/points/or/',target);
app.routeGet('/interested/northward/settling/{spite:\\d+}/',target);
app.routeGet('/lain/needed/mr/spite/',target);
app.routeGet('/gentleman/they/difficult/remarkably/',target);
app.routeGet('/graceful/seems/{unpacked:\\d+}/',target);
app.routeGet('/young/whose/joy/{favour:\\d+}/',target);
app.routeGet('/they/settling/',target);
app.routeGet('/music/mr/abilities/sir/{friendly:\\d+}/',target);
app.routeGet('/oh/widen/apartments/',target);
app.routeGet('/unaffected/delivered/sometimes/man/{abode:\\d+}/',target);
app.routeGet('/felt/mr/announcing/direction/{impression:\\d+}/',target);
app.routeGet('/extensive/walk/',target);
app.routeGet('/smallest/allowance/person/',target);
app.routeGet('/few/gentleman/introduced/{equal:\\d+}/{instantly:\\d+}/',target);
app.routeGet('/her/burst/{extensive:\\d+}/',target);
app.routeGet('/northward/met/miles/',target);
app.routeGet('/acceptance/celebrated/recommend/',target);
app.routeGet('/perpetual/remarkably/part/{small:\\d+}/',target);
app.routeGet('/unpleasing/young/property/he/{at:\\d+}/',target);
app.routeGet('/want/improved/neat/',target);
app.routeGet('/them/gentleman/',target);
app.routeGet('/colonel/five/striking/draw/offending/',target);
app.routeGet('/gay/ye/striking/wrote/interested/',target);
app.routeGet('/eat/need/lain/enjoy/{felicity:\\d+}/',target);
app.routeGet('/not/shy/certainty/',target);
app.routeGet('/become/extremely/',target);
app.routeGet('/not/draw/repeated/{set:\\d+}/',target);
app.routeGet('/points/visitor/',target);
app.routeGet('/taken/residence/addition/{esteem:\\d+}/{indulged:\\d+}/',target);
app.routeGet('/greatest/chief/',target);
app.routeGet('/miles/sir/him/',target);
app.routeGet('/smart/spot/add/literature/{performed:\\d+}/',target);
app.routeGet('/such/edward/spite/gate/{music:\\d+}/',target);
app.routeGet('/intention/except/impression/',target);
app.routeGet('/person/at/',target);
app.routeGet('/drew/in/strictly/',target);
app.routeGet('/use/china/',target);
app.routeGet('/merry/spoke/',target);
app.routeGet('/kindness/alteration/',target);
app.routeGet('/get/everything/settling/two/',target);
app.routeGet('/ask/noisier/{dispatched:\\d+}/',target);
app.routeGet('/sorry/in/warmly/{one:\\d+}/',target);
app.routeGet('/improved/addition/own/apartments/{projection:\\d+}/',target);
app.routeGet('/sorry/contented/spoke/wrote/{knowledge:\\d+}/',target);
app.routeGet('/this/gentleman/felt/',target);
app.routeGet('/day/ye/rapturous/allowance/',target);
app.routeGet('/dissimilar/person/',target);
app.routeGet('/get/opinion/tried/income/men/',target);
app.routeGet('/such/prevailed/an/its/{elsewhere:\\d+}/',target);
app.routeGet('/part/discretion/',target);
app.routeGet('/required/his/staying/dissimilar/',target);
app.routeGet('/felicity/abilities/knowledge/delivered/his/',target);
app.routeGet('/on/opinion/likewise/way/{unable:\\d+}/',target);
app.routeGet('/impossible/small/polite/',target);
app.routeGet('/property/regret/',target);
app.routeGet('/many/instantly/',target);
app.routeGet('/collecting/oppose/warmly/yet/him/',target);
app.routeGet('/indulgence/needed/carried/{leave:\\d+}/{connection:\\d+}/',target);
app.routeGet('/seven/danger/led/ingulgence/{this:\\d+}/',target);
app.routeGet('/seven/danger/led/{this:\\d+}/',target);
app.routeGet('/seven/danger/led/indulgence/needed/carried/felicity/abilities/knowledge/colonel/five/striking/draw/offending/{this:\\d+}/',target);

app.listen(8080);

// nab http://user:pass@localhost:8080/seven/danger/led/123/?possibly=some&state=data

// var req = new HttpIO.ServerRequest('GET','http://user:pass@localhost:8080/seven/danger/led/123/?possibly=some&state=data;');
// var res = new HttpIO.ServerResponse(new StreamBuff.ProxyWritable(process.stdout));

// var runtime = new Server.Runtime({app:app},new stream.Readable(),res,{},{});

// try
// {
// 	Log.time('app');
// 	for(let i = 0; i < 10000; ++i)
// 	{
// 		app.main(runtime);
// 	}
// 	Log.timeEnd('app');
// }
// catch(_err)
// {
// 	Log.out(_err);
// }

/*

nperf -c 50 -n 10000 http://localhost:8080/test.html
stats:
{ statuses: { '200': 10000 },
  min: 8,
  max: 105,
  avg: 57.34819999999998,
  count: 10000,
  rate: 867.0770831526922,
  start: 1465644749538,
  total_time: 11533 }

nperf -c 50 -n 10000 "http://user:pass@localhost:8080/understood/ourselves/exertion/123/?possibly=some&state=data"
stats:
{ statuses: { '200': 10000 },
  min: 4,
  max: 111,
  avg: 66.15329999999992,
  count: 10000,
  rate: 751.9927808693036,
  start: 1465644870712,
  total_time: 13298 }

nperf -c 50 -n 10000 "http://user:pass@localhost:8080/seven/danger/led/123/?possibly=some&state=data"
stats:
{ statuses: { '200': 10000 },
  min: 7,
  max: 103,
  avg: 64.88020000000058,
  count: 10000,
  rate: 766.6947788085563,
  start: 1465644612199,
  total_time: 13043 }

nab http://localhost:8080/test.html
REQ NUM: 200 RTN NUM: 200 QPS: 66 BODY TRAF: 61KB per second
REQ NUM: 800 RTN NUM: 800 QPS: 132 BODY TRAF: 121KB per second
REQ NUM: 1700 RTN NUM: 1700 QPS: 188 BODY TRAF: 172KB per second
REQ NUM: 2900 RTN NUM: 2500 QPS: 207 BODY TRAF: 190KB per second

nab "http://user:pass@localhost:8080/understood/ourselves/exertion/123/?possibly=some&state=data"
REQ NUM: 200 RTN NUM: 200 QPS: 66 BODY TRAF: 2KB per second
REQ NUM: 800 RTN NUM: 800 QPS: 132 BODY TRAF: 4KB per second
REQ NUM: 1700 RTN NUM: 1700 QPS: 188 BODY TRAF: 6KB per second
REQ NUM: 2900 RTN NUM: 2500 QPS: 207 BODY TRAF: 6KB per second

nab "http://user:pass@localhost:8080/seven/danger/led/123/?possibly=some&state=data"
REQ NUM: 200 RTN NUM: 200 QPS: 66 BODY TRAF: 2KB per second
REQ NUM: 800 RTN NUM: 800 QPS: 132 BODY TRAF: 4KB per second
REQ NUM: 1700 RTN NUM: 1689 QPS: 187 BODY TRAF: 5KB per second
REQ NUM: 2600 RTN NUM: 2331 QPS: 193 BODY TRAF: 6KB per second

ab -r -n 10000 -c 10 http://localhost:8080/test.html
Time taken for tests:   10.321 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      9930000 bytes
HTML transferred:       9180000 bytes
Requests per second:    968.90 [#/sec] (mean)
Time per request:       10.321 [ms] (mean)
Time per request:       1.032 [ms] (mean, across all concurrent requests)
Transfer rate:          939.57 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       0
Processing:     9   10   2.9      9      67
Waiting:        8   10   2.8      9      64
Total:          9   10   2.9      9      67

Percentage of the requests served within a certain time (ms)
  50%      9
  66%     10
  75%     10
  80%     10
  90%     12
  95%     17
  98%     18
  99%     20
 100%     67 (longest request)

ab -r -n 10000 -c 10 "http://localhost:8080/understood/ourselves/exertion/123/?possibly=some&state=data"
Time taken for tests:   10.792 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1070000 bytes
HTML transferred:       320000 bytes
Requests per second:    926.65 [#/sec] (mean)
Time per request:       10.792 [ms] (mean)
Time per request:       1.079 [ms] (mean, across all concurrent requests)
Transfer rate:          96.83 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       1
Processing:     6   11   2.7     10      32
Waiting:        5   11   2.7     10      32
Total:          7   11   2.7     10      33

Percentage of the requests served within a certain time (ms)
  50%     10
  66%     10
  75%     10
  80%     11
  90%     13
  95%     18
  98%     21
  99%     22
 100%     33 (longest request)

ab -r -n 10000 -c 10 "http://localhost:8080/seven/danger/led/123/?possibly=some&state=data"
Time taken for tests:   10.849 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1070000 bytes
HTML transferred:       320000 bytes
Requests per second:    921.71 [#/sec] (mean)
Time per request:       10.849 [ms] (mean)
Time per request:       1.085 [ms] (mean, across all concurrent requests)
Transfer rate:          96.31 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       1
Processing:     4   11   2.8     10      34
Waiting:        4   11   2.8     10      34
Total:          5   11   2.8     10      34

Percentage of the requests served within a certain time (ms)
  50%     10
  66%     10
  75%     10
  80%     11
  90%     13
  95%     19
  98%     21
  99%     22
 100%     34 (longest request)
*/
