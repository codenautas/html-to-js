"use strict";

var Path = require('path');

var expect = require("expect.js");
var fs = require("fs-promise");

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
    it("must generate js source code from text nodes (array)", function(){
        var sourceCode=jsFromHtml.toJsSourceCode(["simple & short"]);
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
});

// var error_sintaxis = require('./fixtures/pseudo-pp.js');

describe("jsFromHtml from fixtures", function(){
    [   
        {fileName: 'fixture1.js'   , },
        {fileName: 'fixture1b.js'  , },
        {fileName: 'fixture2.js'   , },
        {fileName: 'fixture1c.js'  , },
        {fileName: 'ejemplo.html'  , },
        {fileName: 'pseudo-pp.html', skip: '#5'},
        {fileName: 'pseudo-pp.html', skip: '#6', jsName: 'pseudo-pp-es6.js', versionES:6},
    ].forEach(function(fixtureInfo){
        var fileName = fixtureInfo.fileName;
        var mustName="must parse and create the same JS thats create the HTML text for: "+fileName+" for issue "+fixtureInfo.skip;
        if(fixtureInfo.skip){
            it.skip(mustName);
            return true;
        }
        it(mustName, function(done){
            var arrayList;
            var js;
            var jsName=fixtureInfo.jsName||fileName.replace(/\.[^.]+$/,'.js');
            fs.readFile('test/fixtures/'+jsName,{encoding:'utf8'}).then(function(content){
                js = content;
                arrayList = eval("["+js+"]");
                if(Path.extname(fileName)=='.js'){
                    return jsToHtml.arrayToHtmlText(arrayList);
                }else{
                    return fs.readFile('test/fixtures/'+fileName,{encoding:'utf8'});
                }
            }).then(function(htmlText){
                //var htmlText = eval(js);
                //console.log("htmlText", htmlText);
                var cdo=jsFromHtml.parse(htmlText);
                var sc=jsFromHtml.toJsSourceCode(cdo, {versionES: fixtureInfo.versionES});
                expect(sc).to.eql(js);
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

