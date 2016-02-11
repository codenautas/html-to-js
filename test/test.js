var expect = require("expect.js");
var fs = require("fs-promise");

var htmlToJs = require("../lib/html-to-js.js");
var jsToHtml = require("js-to-html");
var html = jsToHtml.html;
var direct = jsToHtml.direct;
describe("htmlToJs simple tests", function(){
    it("must parse any html and generate the same kind of object that generates 'direct' and 'html.TAGNAME'", function(){
        var cdo=htmlToJs.parse('<div id=id1 class=class2>Hello <B>World!</B></div>');
        expect(cdo).to.eql(direct({tagName:'div', attributes:{id:'id1', "class": 'class2'}, content:[
            direct({textNode:'Hello '}), direct({tagName:'b', attributes:{}, content:[direct({textNode:'World!'})]})
        ]}));
        expect(cdo).to.eql(html.div({id:'id1', "class": 'class2'}, [
            "Hello ", html.b("World!")
        ]));
    });
    it("must generate js source code", function(){
        var sourceCode=htmlToJs.toJsSourceCode(html.div({id:'id1', "class": 'class2'}, [
            "Hello ", html.b("World!")
        ]));
        // must ident with 4 spaces
        // id and class must be the first attributes, others must be alfabethical
        // the attributes are in the same line because are 3 or less
        // redundant comma is ok when multi line list
        expect(sourceCode).to.eql(
            'html.div({id: "id1", "class": "class2"}, [\n'+
            '    "Hello ",\n'+
            '    html.b("World!")\n'+
            '])\n'
        )
    });
    it("must generate js source code from text nodes", function(){
        var sourceCode=htmlToJs.toJsSourceCode("simple &amp; short");
        expect(sourceCode).to.eql(
            'html._text("simple & short")\n'
        )
    });
    it("must generate js source code from comment nodes", function(){
        var sourceCode=htmlToJs.toJsSourceCode("<!-- the comment -->");
        expect(sourceCode).to.eql(
            'html._comment(" the comment ")\n'
        )
    });
});

describe("htmlToJs from fixtures", function(){
    ['fixture1.js','fixture2.js'].forEach(function(fileName){
        if(fileName == 'fixture2.js') {
            console.log("Skipping ", fileName);
            return;
        }
        it("must parse and create the same JS thats create the HTML text for: "+fileName, function(done){
            fs.readFile('test/fixtures/'+fileName,{encoding:'utf8'}).then(function(js){
                var htmlText = eval(js+".toHtmlText()");
                //var htmlText = eval(js);
                //console.log("htmlText", htmlText);
                var cdo=htmlToJs.parse(htmlText);
                //console.log("cdo", cdo)
                var sc=htmlToJs.toJsSourceCode(cdo);
                //console.log("sc", sc)
                expect(sc).to.eql(js+'\n');
            }).then(done,done);
        });
    });
});