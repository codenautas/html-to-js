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
    it.skip("must generate js source code", function(){
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
    it.skip("must generate js source code from text nodes", function(){
        var sourceCode=jsFromHtml.toJsSourceCode(jsFromHtml.parse("simple &amp; short"));
        expect(sourceCode).to.eql(
            '"simple & short",\n'
        )
    });
    it.skip("must generate js source code from text nodes 2", function(){
        var sourceCode=jsFromHtml.toJsSourceCode(["simple & short"]);
        expect(sourceCode).to.eql(
            '"simple & short",\n'
        )
    });
    it.skip("must generate js source code from comment nodes", function(){
        var sourceCode=jsFromHtml.toJsSourceCode(jsFromHtml.parse("<!-- the comment -->"));
        expect(sourceCode).to.eql(
            'html._comment(" the comment "),\n'
        )
    });
});

describe.skip("jsFromHtml from fixtures", function(){
    ['fixture1.js','fixture1b.js','fixture2.js'].forEach(function(fileName){
        if(fileName == 'fixture2.js') {
            console.log("Skipping ------------------------> ", fileName);
            return;
        }
        it("must parse and create the same JS thats create the HTML text for: "+fileName, function(done){
            fs.readFile('test/fixtures/'+fileName,{encoding:'utf8'}).then(function(js){
                var htmlText = eval("jsToHtml.arrayToHtmlText(["+js+"])");
                //var htmlText = eval(js);
                // console.log("htmlText", htmlText);
                var cdo=jsFromHtml.parse(htmlText);
                // console.log("cdo", cdo)
                var sc=jsFromHtml.toJsSourceCode(cdo);
                console.log("filename", fileName)
                console.log("sc", sc)
                console.log("js", js)
                expect(sc).to.eql(js);
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
