#!/usr/bin/env node

"use strict";

var program = require('commander');
var htmlToJs = require('../lib/html-to-js');
var Promises = require('best-promise');
var fs = require('fs-promise');
var path = require('path');

function realPath(inFile) {
    return Promises.start(function() {
        if(!inFile) { throw new Error("null file"); }
        return fs.exists(inFile);
    }).then(function(exists) {
        if(! exists) { throw new Error("'"+inFile+"' does not exists"); }
        return inFile;
    }).then(function(inFile) {
        return path.dirname(path.resolve(inFile));
    });
};

program
    .version(require('../package').version)
    .usage('[options] input.html output.js')
    .option('-i, --input [input.md]', 'Name of the input file')
    .option('-o, --output [output.js]', 'Name of the output file.')
    // .option('-d, --directory [name]', 'Name of the output directory.')
    .option('-s, --silent', 'Do not output anything')
    .option('-v, --verbose', 'Output all progress informations')
    .parse(process.argv);

if( (""==program.args && !program.input) ){
    program.help();
}

var params = {};
params.input = program.input ? program.input : program.args[0];
params.output = program.output ? program.output : program.args[1];
params.verbose = program.verbose;
params.silent = program.silent;

var jsCodeForOutput=""; 

Promises.start(function(){
    if(params.verbose) console.log("reading HTML file:", params.input)
    return fs.readFile(params.input, {encoding: 'utf8'});
}).then(function(htmlText){
    if(params.verbose) console.log("parsing HTML");
    return htmlToJs.parse(htmlText);
}).then(function(htmlObject){
    if(params.verbose) console.log("creating JS");
    return htmlToJs.toJsSourceCode(htmlObject);
}).then(function(jsCode){
    if(params.verbose) console.log("ensuring output does'n exists");
    return fs.stat(params.output).then(function(){
        throw new Error(params.output+" already exists");
    },function(err){
        if(err.code!='ENOENT'){
            throw err;
        }
        return jsCode;
    });
}).then(function(jsCode){
    if(params.verbose) console.log("writing output to:", params.output);
    fs.writeFile(params.output,jsCode,'utf8');
}).then(function(jsCode){
    if(!params.silent) console.log("done");
}).catch(function(err){
    console.error("ERROR");
    console.error(err.message||err)
    if(params.verbose) console.error(err.stack);
});