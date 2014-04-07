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
var errorMessages='';
var errors={
    incorrect:0,
    collapse :1
};
var result = {
    incorrectInputs:[],
    inputCount:0,
    correctInputs:0
};
addInputResult = function(input,user_output,correct_input,error)
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
    errorMessages+=str;
};
save = function(){

};

module.exports.addInputResult   = addInputResult;
module.exports.addResult        = addResult;
module.exports.addError         = addError;
module.exports.save             = save;
module.exports.errors           = errors;