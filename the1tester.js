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
var exec    = require('child_process').exec,
    stdio   = require('stdio'),
    util    = require('util'),
    path    = require('path'),
    data    = require('./data').inputs,
    logger  = require('./logger'),
    creator = require('./io_creator'),
    os      = require('os'),
    source = 'the1.c',
    command_index = -1,
    commands = [],
    executable='the1',
    buildSuccessful=true,
    test_index = 0;

var options = stdio.getopt({
    'code' :    {key: 'c', description: 'The1 source code',args:1},
    'generate': {key: 'g', description: 'Generate new inputs for testing',args:1},
    'save' :    {key: 's', description: 'Save log file'}
});

if(options.source){
    source = options.source;
}

function buildCallback(error, stdout, stderr) {
    if(stdout!=null && stdout!='')
        console.log('stdout: ' + stdout);
    if(stderr!=null && stderr!=''){
        console.log('stderr: ' + stderr);
        logger.addError(stderr);
    }
    if (error !== null) {
        console.log('exec error: ' + error);
        buildSuccessful = false;
    }

    runNextCommand();
}
function testCallback(error, stdout, stderr) {
    if(stdout!=null && stdout!='')
        console.log(test_index + ' result: ' + stdout);
    if(stderr!=null && stderr!=''){
        console.log('stderr: ' + stderr);
        logger.addError(stderr);
    }
    if (error !== null) {
        console.log('exec error: ' + error);
        buildSuccessful = false;
    } else{
        if(stdout == data[test_index].output){
            logger.addInputResult(data[test_index].input,data[test_index].output,stdout,logger.errors.incorrect);
        }
        else{
            console.log(test_index + " error:  " + data[test_index].output);
            logger.addInputResult(data[test_index].input,data[test_index].output,stdout,logger.errors.incorrect);
        }
    }
    test_index += 1;
    if(test_index<data.length){
        testNextInput();
    }
    else{
        runNextCommand();
    }
}

function runNextCommand(){
    command_index++;
    if(command_index < commands.length){
        commands[command_index]();
    }
}
testNextInput = function(){
    if(test_index >= data.length){
        runNextCommand();
        return;
    }
    var child = exec(executable, testCallback);
    child.stdin.write(data[test_index].input);
    child.stdin.end();
};

buildWindows = function(){
    console.log("Application is building windows app");
    exec(util.format("%s %s -o %s",path.resolve(__dirname, 'tcc/tcc.exe'),source,executable), buildCallback);
};
buildLinux = function(){
    console.log("Application is building linux app");
    exec(util.format("gcc %s",source), buildCallback);
};
buildDarwin = function(){
    console.log("Application is building mac os x app");
    exec(util.format("gcc %s",source), buildCallback);
};
createInputs=function(amount){
    console.log("Inputs are creating");
    data = creator.generate(amount);
};

runTests = function(){
    if(!buildSuccessful){
        runNextCommand();
        return;
    }
    console.log("Tests are running");

    testNextInput();
};
saveLog = function(){
    console.log("log file is saving");

    if(options.generate || options.save)
    {
        logger.save();
    }
    runNextCommand();
};


var platform = os.platform();

if(platform=='win32' ||platform=='win64' ){
    executable="the1.exe";
    commands.push(buildWindows);
}else if(platform=='linux2'){
    executable="the1";
    commands.push(buildLinux);
}else if(platform=='darwin'){
    executable="the1";
    commands.push(buildDarwin);
}

commands.push(runTests);
commands.push(saveLog);

runNextCommand();

if(options.generate){
    createInputs(options.generate);
}