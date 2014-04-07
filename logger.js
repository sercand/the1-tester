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
var fs=require('fs');
var errorMessages='';
var stream=null;
var current=-1;
var errors={
    incorrect:0,
    collapse :1
};
var result = {
    incorrectInputs:[],
    inputCount:0,
    correctInputs:0
};
addInputResult = function(input,correct_input,user_output,error)
{
    result.incorrectInputs.push({
        'input':input,
        'expected':correct_input,
        'received':user_output,
        'error':error
    })
};
addResult = function(total_input, correct_inputs)
{
    result.inputCount=total_input;
    result.correctInputs=correct_inputs;
};
addError = function(str){
    errorMessages+=str+"\n";
};
getPath=function(){
    var objToday = new Date(),
        dayOfMonth =  (objToday.getDate() < 10) ? '0' + objToday.getDate():objToday.getDate(),
        curMonth = objToday.getMonth() < 10 ? "0" + objToday.getMonth() : objToday.getMonth(),
        curYear = objToday.getFullYear(),
        curHour = objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours(),
        curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes(),
        curSeconds = objToday.getSeconds() < 10 ? "0" + objToday.getSeconds() : objToday.getSeconds();
    return 'log_'+curYear+'-'+curMonth + "-" + dayOfMonth+"_"+curHour+"-"+curMinute+"-"+curSeconds+".txt";
};
function getText(res){
    var str="Input:\n"+res.input+"\nOutput:\n" + res.expected;
    if(res.error===errors.incorrect)
        str+="\nYourOutput:\n" + res.received;
    else
        str+="\nError is:\n" + res.received+"\n";
    return str+"\n";
}
function niceWrite() {
    current += 1;

    if (current >= result.incorrectInputs.length)
        return stream.end();

    var nextPacket = result.incorrectInputs[current];
    var canContinue = stream.write(getText(nextPacket));

    // wait until stream drains to continue
    if (!canContinue)
        stream.once('drain', niceWrite);
    else
        niceWrite();
}

save = function(){
    stream = fs.createWriteStream(getPath());

    stream.write("Score            : " +100*(result.correctInputs/result.inputCount)+"\n");
    stream.write("Total Input      : " +result.inputCount+"\n");
    stream.write("Successful Inputs: " +result.correctInputs+"\n");
    stream.write("Incorrect Inputs : " +(result.inputCount-result.correctInputs)+"\n");

    niceWrite();
};

module.exports.addInputResult   = addInputResult;
module.exports.addResult        = addResult;
module.exports.addError         = addError;
module.exports.save             = save;
module.exports.errors           = errors;