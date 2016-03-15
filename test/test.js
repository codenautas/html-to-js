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

function getE(elem) {
    return '['+(elem.name ? elem.name : '?')+']'+(elem.type ?" type:"+elem.type:"")+(elem.data ? " data:"+elem.data : '')
               +(elem.attribs && elem.attribs.id?" id:"+elem.attribs.id:"")
               +(elem.attribs && elem.attribs.src?" src:"+elem.attribs.src:"")
               +(elem.attribs && elem.attribs.href?" href:"+elem.attribs.href:"")
               +(elem.prev?" prev:"+(elem.prev.name ? elem.prev.name : elem.prev.data):"")
               +(elem.next?" next:"+(elem.next.name ? elem.next.name : elem.next.data):"")
               +(elem.parent?" [parent:"+(elem.parent.name ? elem.parent.name : elem.parent.data)+']':"")
               +(elem.children && elem.children.length?"":" [NIETO]");
}

var space = '   ';
var ctr = 0;
function prnDE(elem, pad) {
    ++ctr;
    //console.log("prnDE:",elem);
    console.log(ctr, pad+getE(elem));
    if(elem.attribs) {
        for(var a in elem.attribs) {
            console.log(pad+space+space+"attrib:"+a+"='"+elem.attribs[a]+'"');
        }
    }
    if(elem.children) {
        var i=0;
        for(var c in elem.children) {
            ++i;
            var child = elem.children[c];
            console.log(pad+space+"child", i, "of", elem.children.length, "from", elem.name ? elem.name : '?'/*, child.name ? child.name : child.type*/);
            pad += space;            
            prnDE(child, pad);
            pad = pad.substring(0, pad.length-space.length);
        }
    }
}

function prnDOM(dom) {
    ctr = 0;
    for(var d=0; d<dom.length; ++d) { prnDE(dom[d], ''); }
    console.log("# of tags:", ctr);
}

describe("jsFromHtml from fixtures", function(){
    ['fixture1.js','fixture1b.js','fixture2.js','fixture1c.js'].forEach(function(fileName){
        it("must parse and create the same JS thats create the HTML text for: "+fileName, function(done){
            fs.readFile('test/fixtures/'+fileName,{encoding:'utf8'}).then(function(js){
                var arrayList = eval("["+js+"]");
                var htmlText = jsToHtml.arrayToHtmlText(arrayList);
                //var htmlText = eval(js);
                //console.log("htmlText", htmlText);
                var cdo=jsFromHtml.parse(htmlText);
                // if(fileName==='fixture2.js') {
                    // console.dir(cdo, {depth:1});
                    // console.dir(arrayList, {depth:1});
                // }
                expect(cdo).to.eql(arrayList);
                var sc=jsFromHtml.toJsSourceCode(cdo);
                if(fileName==='fixture2.js') {
                    console.log("Skipping "+fileName);
                    //console.log("jsFromHtml.toJsSourceCode"); console.log(sc);
                    //console.log("expected"); console.log(js);
                } else {
                    expect(sc).to.eql(js);
                }
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

