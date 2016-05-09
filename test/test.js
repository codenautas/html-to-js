"use strict";

var Path = require('path');

var expect = require("expect.js");
var fs = require("fs-promise");
var semver = require('semver');
var jsFromHtml = require("../lib/js-from-html.js");
var jsToHtml = require("js-to-html");
var html = jsToHtml.html;
var direct = jsToHtml.direct;

describe("jsFromHtml simple tests", function(){
    it("must parse any html and generate the same kind of object that generates 'direct' and 'html.TAGNAME'", function(){
         var cdo=jsFromHtml.parse('<div id=id1 class=class2>Hello <B>World!</B></div>');
        //console.log("cdo", cdo);
        expect(cdo).to.eql([direct({tagName:'div', attributes:{id:'id1', "class": 'class2'}, content:[
            direct({textNode:'Hello '}), direct({tagName:'b', attributes:{}, content:[direct({textNode:'World!'})]})
        ]})]);
        expect(cdo).to.eql([
            html.div({id:'id1', "class": 'class2'}, [
                "Hello ", html.b("World!")
            ])
        ]);
    });
    it("must generate js source code", function(){
        var sourceCode=jsFromHtml.toJsSourceCode([html.div({id:'id1', "class": 'class2'}, [
            "Hello ", html.b("World!")
        ])]);
        // must ident with 4 spaces
        // id and class must be the first attributes, others must be alfabethical
        // the attributes are in the same line because are 3 or less
        // redundant comma is ok when multi line list
        expect(sourceCode).to.eql(
            'html.div({id: "id1", "class": "class2"}, [\n'+
            '    "Hello ",\n'+
            '    html.b("World!"),\n'+
            ']),\n'
        )
    });
    it("must generate js source code from text nodes (text)", function(){
        var sourceCode=jsFromHtml.toJsSourceCode(jsFromHtml.parse("simple &amp; short"));
        expect(sourceCode).to.eql(
            '"simple & short",\n'
        )
    });
    it("must generate js source code from comment nodes", function(){
        var sourceCode=jsFromHtml.toJsSourceCode(jsFromHtml.parse("<!-- the comment -->"));
        expect(sourceCode).to.eql(
            'html._comment(" the comment "),\n'
        )
    });
    it("should return original object if in canonical form", function(){
        var original=html.div({id:"elid"}, "div content");
        expect(jsFromHtml.parse(original)).to.eql(original);
    });
    it("must generate js source code from nested tags", function(){
        var sourceCode=jsFromHtml.toJsSourceCode(jsFromHtml.parse("<div><!-- the comment --></div>"));
        expect(sourceCode).to.eql(
            'html.div([\n'+
            '    html._comment(" the comment "),\n'+
            ']),\n'
        )
    });
});

// var error_sintaxis = require('./fixtures/pseudo-pp.js');

describe("jsFromHtml from fixtures", function(){
    [   
        {fileName: 'fixture1.js'   , },
        {fileName: 'fixture1b.js'  , },
        {fileName: 'fixture2.js'   , },
        {fileName: 'fixture1c.js'  , },
        {fileName: 'ejemplo.html'  , },
        {fileName: 'pseudo-pp.html'},
        {fileName: 'pseudo-pp.html', jsName: 'pseudo-pp-es6.js', versionES:6, minVersion:'4.4.0'},
        {fileName: 'from-pp.html'  , skip: '#8', fromPretty:true},
    ].forEach(function(fixtureInfo){
        var fileName = fixtureInfo.fileName;
        var minVersion = fixtureInfo.minVersion || '0.12.7';
        var mustName="must parse and create the same JS thats create the HTML text for: "+fileName+(fixtureInfo.skip ? " for issue "+fixtureInfo.skip : '');
        if(fixtureInfo.skip || semver.lt(process.versions.node,minVersion)){
            it.skip(mustName);
            return true;
        }
        it(mustName, function(done){
            var arrayList;
            var js;
            var jsName=fixtureInfo.jsName||fileName.replace(/\.[^.]+$/,'.js');
            //console.log("jsName", jsName)
            fs.readFile('test/fixtures/'+jsName,{encoding:'utf8'}).then(function(content){
                //console.log("content", JSON.stringify(content));
                js = content;
                arrayList = eval("["+js+"]");
                if(Path.extname(fileName)=='.js'){
                    return jsToHtml.arrayToHtmlText(arrayList);
                }else{
                    return fs.readFile('test/fixtures/'+fileName,{encoding:'utf8'});
                }
            }).then(function(htmlText){
                //console.log("fileName", fileName);
                //console.log("htmlText", htmlText);
                //console.log("htmlText", JSON.stringify(htmlText));
                //console.log("js", js);
                // var htmlText = eval(js);
                // console.log("htmlText", htmlText);
                var cdo=jsFromHtml.parse(htmlText);
                var sc=jsFromHtml.toJsSourceCode(cdo, {versionES: fixtureInfo.versionES, fromPretty: fixtureInfo.fromPretty});
                //console.log("sc", JSON.stringify(sc));
                //console.log("js", JSON.stringify(js));
                expect(sc).to.eql(js);
                //console.log("      cdo", JSON.stringify(cdo));
                //console.log("arrayList", JSON.stringify(arrayList));
                expect(cdo).to.eql(arrayList);
            }).then(done,done);
        });
    });
});

describe("jsToHtml instance check", function(){
    it("must generate js source code from comment nodes", function(){
        var tag = jsToHtml.direct({textNode:'El texto'});
        expect(tag instanceof jsToHtml.HtmlTextNode).to.eql(true);
    });
});

