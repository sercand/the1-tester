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
    test_index = 0,
    successfulOutput= 0,
    currentInput=null,
    lastTest=true,
    hasGcc=false;

var options = stdio.getopt({
    'code' :    {key: 'c', description: 'The1 source code',args:1},
    'generate': {key: 'g', description: 'Generate new inputs for testing',args:1},
    'exec' :    {key: 'e', description: 'Use executable file without building source code',args:1},
    'save' :    {key: 's', description: 'Save log file'},
    'tcc' :     {key: 't', description: 'Force to use tcc instead of gcc on Windows'}
});

if(options.code){
    source = options.code;
}

buildCallback = function (error, stdout, stderr) {
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
};
checkForGcc=function(){
    exec("gcc -v", function(err,stdout,stderr){
        hasGcc = err === null;
        if(hasGcc)
            console.log("You have gcc!!!");
        runNextCommand();
    });
};

getLastIndex=function(){
    if(options.generate){
        return options.generate;
    }else{
        return data.length;
    }
};
getNextInput=function(){
    if(options.generate){
        return creator.generate();
    }else{
        return data[test_index];
    }
};
testCallback=function (error, stdout, stderr) {
    if(stderr!=null && stderr!=''){
        console.log('error: input ' +test_index);
        if(error!=null) {
            console.log('exec error: ' + error);
            logger.addInputResult(currentInput.input,currentInput.output,error,logger.errors.collapse);
        }
        logger.addError(stderr);
    }else if(lastTest){
        successfulOutput+=1;
    }
    else{
        logger.addInputResult(currentInput.input,currentInput.output,stdout,logger.errors.incorrect);
    }
    test_index += 1;
    if(test_index<getLastIndex()){
        testNextInput();
    }
    else{
        runNextCommand();
    }
};

runNextCommand=function(){
    command_index++;
    if(command_index < commands.length){
        commands[command_index]();
    }
};

testNextInput = function(){
    lastTest=true;
    if(test_index >= getLastIndex()){
        runNextCommand();
        return;
    }
    var child = exec(executable, testCallback);
    currentInput = getNextInput();
    child.stdin.write(currentInput.input);
    child.stdin.end();
    var index = 0;
    child.stdout.on('data', function(chunk) {
        var comp = currentInput.output.substr(index,chunk.length);
        if(comp !== chunk)
            if(index + chunk.length - 1 == currentInput.output.length && chunk[chunk.length-1]==' '){
                lastTest = comp == chunk.substr(0,chunk.length-1);
            }else {
                lastTest = false;
            }
        index += chunk.length;
    });
};

buildWindows = function(){
    console.log("Application is building windows app");
    if(options.tcc || !hasGcc)
        exec(util.format("%s %s -o %s",path.resolve(__dirname, 'tcc/tcc.exe'),source,executable), buildCallback);
    else
        exec(util.format("gcc -o %s %s -Wall -pedantic-errors -Wmissing-braces -ansi",executable,source), buildCallback);
};
buildLinux = function(){
    console.log("Application is building linux app");
    exec(util.format("gcc -o %s %s -Wall -pedantic-errors -Wmissing-braces -ansi",executable,source), buildCallback);
};
buildDarwin = function(){
    console.log("Application is building mac os x app");
    exec(util.format("gcc -o %s %s -Wall -pedantic-errors -Wmissing-braces -ansi",executable,source), buildCallback);
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
    console.log("Score: "+100*(successfulOutput/getLastIndex()));
    logger.addResult(getLastIndex(),successfulOutput);
    logger.save();
    if(options.generate || options.save)
    {
        logger.save();
    }
    runNextCommand();
};

var platform = os.platform();

if(platform=='win32' ||platform=='win64' ){
    if(options.exec) {
        executable = options.exec;
    }else{
        executable = "the1.exe";
        commands.push(checkForGcc);
        commands.push(buildWindows);
    }
}else if(platform=='linux2' || platform=='linux'){
    if(options.exec) {
        executable = options.exec;
    }else {
        executable = "./the1";
        commands.push(buildLinux);
    }
}else if(platform=='darwin'){
    if(options.exec) {
        executable = options.exec;
    }else {
        executable = "./the1";
        commands.push(buildDarwin);
    }
}

commands.push(runTests);
commands.push(saveLog);


module.exports.start=function(){
    runNextCommand();
};
