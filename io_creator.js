/*
 Copyright 2014 Sercan Degirmenci

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
var minRightBoundary=100,
    maxRightBoundary=100000,
    minViruses= 1,
    maxViruses=100,
    minWidth= 1,
    maxWidth=100,
    minHeight= 1,
    maxHeight=100,
    minTime= 1,
    maxTime=100,
    maxSpeed=1000,
    minInterval= 1,
    maxInterval=100,
    minNumberOfAttacks= 1,
    maxNumberOfAttacks= 100;

rand = function(from,to){
    return Math.floor((Math.random()*(to-from))+from);
};

randomize = function(){
    var length = rand(minRightBoundary,maxRightBoundary-1);
    var viruses = rand(minViruses,maxViruses);
    var vs = [];
    var str = length+"\n"+viruses+"\n";
    for(var i = 0 ; i < viruses ; i++){
        var w=rand(minWidth,maxWidth),h=rand(minHeight,maxHeight),t=rand(minTime,maxTime),
            p=rand(0,length),s=rand(-maxSpeed,maxSpeed),a=rand(minInterval,maxInterval),
            n=rand(minNumberOfAttacks,maxNumberOfAttacks);
        vs.push({width:w,height:h,initial:t,position:p,speed:s,interval:a,remain:n });
        str += w+' '+h+' '+t+' '+p+' '+s+' '+a+' '+n+ "\n";
    }
    return {text:str,length:length,viruses:vs};
};
solve = function(input) {
    var membranes = new Array(input.length + 1);
    for (var i = 0; i < membranes.length; i++) {
        membranes[i] = 1;
    }
    var cont = true, time = 0, n = input.viruses.length;
    while (cont) {
        cont = false;
        time++;
        for (i = 0; i < n; i++) {
            var virus = input.viruses[i];
            var t = time - virus.initial;
            if (virus.remain <= 0) continue;
            if (t < 0) {
                cont = true;
                continue;
            }
            if (t % virus.interval == 0) {
                virus.remain--;
                for (var start = virus.position, end = Math.min(virus.position + virus.width, membranes.length); start < end; start++) {
                    if (start < 0)continue;
                    if (membranes[start] < virus.height) membranes[start] = virus.height;
                }
            }
            virus.position += virus.speed;
            cont = cont || (virus.remain > 0);
        }
    }
    var str = '';
    for (i = 0; i < membranes.length; i++) {
        str += membranes[i];
        if (i < membranes.length - 1)str += ' ';
    }
    return str;
};
generate = function(){
    var input = randomize();
    var output = solve(input);
    return {'input':input.text,'output':output};
};


module.exports.generate = generate;