"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

(function codenautasModuleDefinition(root, name, factory) {
    /* global define */
    /* istanbul ignore next */
    if(typeof root.globalModuleName !== 'string'){
        root.globalModuleName = name;
    }
    /* istanbul ignore next */
    if(typeof exports === 'object' && typeof module === 'object'){
        module.exports = factory();
    }else if(typeof define === 'function' && define.amd){
        define(factory);
    }else if(typeof exports === 'object'){
        exports[root.globalModuleName] = factory();
    }else{
        root[root.globalModuleName] = factory();
    }
    root.globalModuleName = null;
})(/*jshint -W040 */this, 'jsFromHtml', function() {
/*jshint +W040 */

/*jshint -W004 */
var jsFromHtml = {};
/*jshint +W004 */

var htmlparser = require("htmlparser2");
var jsToHtml = require("js-to-html");
var htmlTags = jsToHtml.htmlTags;

function isInstanceOfHtml(obj) {
    return String(obj.constructor).substr(0,17)==="function HtmlBase";
}

var space = '   ';
function printDOM(elem, pad) {
    //console.log("typeof elem", typeof(elem));
    //console.log("elem:",elem);
    console.log(pad+"name:"+elem.name+", type:", elem.type, ", data:", elem.data);
    if(elem.attribs) {
        //console.log(pad+"attribs", elem.attribs)
        for(var a in elem.attribs) {
            console.log(pad+space+"attrib:"+a+"='"+elem.attribs[a]+'"');
        }
    }
    if(elem.children && elem.children.length) {
        for(var c=0; c<elem.children.length; ++c) {
            pad += space;
            printDOM(elem.children[c], pad);
            pad = pad.substring(pad.length-space.length)
        }
    }
}

function setLevels(out, row, col, elem) {
    ++col;
    if(elem.children && elem.children.length) {
        for(var c=0; c<elem.children.length; ++c) {
            setLevels(out, row, col, elem.children[c]);
        }
    }
    out.push({col:col, row:row, elem:elem});
}

function prn(titu, dwe) {
    for(var e=0; e<dwe.length; ++e) {
        var ee = dwe[e];
        console.log(titu+': [C:'+ee.col+' R:'+ee.row+' '+(ee.elem.type=='text' ? ee.elem.data : ee.elem.name)+']');
    }
}

/* global document */
jsFromHtml.parse = function parse(htmlText){
    //console.log("parse INPUT", (htmlText instanceof jsToHtml.Html ? "SI" : "NO"));
    if(isInstanceOfHtml(htmlText)) { return htmlText; }
    //console.log("parse'" + htmlText +"'");
    var dom = htmlparser.parseDOM(htmlText);
    //console.log("typeof DOM", typeof(dom), dom.length);
    //for(var d=0; d<dom.length; ++d) { printDOM(dom[d], ''); }
    var domWithLevels = [];
    var col = 0;
    var out = [];
    for(var row=0; row<dom.length; ++row) {
        ++col;
        var elems=[];
        setLevels(elems, col, row, dom[row]);
        elems=elems.sort(function(a, b) { return a.row - b.row - a.col - b.col; });
        //prn("level "+row, elems);
        var children = [];
        for(var child in elems) {
            var elem = elems[child].elem;
            if(elem.type == 'text') {
                children.push(jsToHtml.direct({textNode:elem.data}));
            } else {
                var tag = {
                    tagName : elem.name,
                    attributes : elem.attribs,
                    content : []
                };
                children.push(tag);
            }            
        }
        //console.log("children", children)
        var left = [];
        for(var e=1; e<children.length; ++e) {
            var o = children[e];
            //console.log("children", e, o)
            var prev = children[e-1];
            if(o.content) {
                o.content.push(prev);
            } else {
                left.push(prev);
            }
        }
        var first = children[children.length-1];
        for(var i=0; i<left.length; ++i) {
            first.content.splice(i, 0, left[i]);
        }
        //console.log("first", first)
        out.push(first);
    }
    //console.log("parse --->", out);
    return out;
};

/*
jsFromHtml.parse = function parse(htmlText){
    console.log("parse INPUT", (htmlText instanceof jsToHtml.Html ? "SI" : "NO"));
    if(isInstanceOfHtml(htmlText)) { return htmlText; }
    var out = {};
    var level = 0;
    var curNode = null;
    var curLevel = level;
    var curText = '';
    var parser = new htmlparser.Parser({
        onopentag: function(name, attribs){
            console.log("open", name, "attribs", attribs);
            if(! curNode) { curNode = out; }
            if(name in htmlTags) {
                if(curLevel != level) {
                    var newTag = {};
                    curNode.content.push(newTag);
                    curNode = newTag;
                    curLevel = level;
                }
                curNode.tagName = name;
                curNode.attributes = {};
                curNode.content = [];
                if(attribs) { curNode.attributes = attribs; }
            }
            else if(curText !=='') {
                curNode = jsToHtml.direct({textNode:curText});
            }
            curText = '';
            ++level;
        },
        oncomment: function(comment) {
            //console.log("comment", comment);
            var newNode = jsToHtml.direct({commentText:comment});
            if(curNode) {
                curNode.content.push(newNode);
            } else {
                out = newNode;
            }
        },
        commentend: function(commentEnd) {
            //console.log("Comment end", commentEnd);
        },
        ontext: function(text){
            //console.log("[", text, "]");
            if(curNode) {
                if(curNode.tagName){
                    if(curNode.content.length) {
                        var lastTextNode = curNode.content[curNode.content.length-1].textNode;
                        if(lastTextNode) {
                            lastTextNode += text;
                        }
                    }
                     else {
                        curNode.content.push(jsToHtml.direct({textNode:text}));
                    }
                }
            } else {
                curText += text;
            }
        },
        onclosetag: function(tagname){
            //console.log("close", tagname);
            --level;
        },
        error: function(error) {
            console.log("Error", error);
        }
    }, {decodeEntities: true});
    parser.write(htmlText);
    parser.end();
    if(curText !=='') {
        var newNode = jsToHtml.direct({textNode:curText});
        if(curNode) {
            curNode.content.push(newNode);
        } else {
            out = newNode;
        }
    }
    console.log("parse --->", out);
    return out;
};

*/

function cdoToSource(tag, pad) {
    //console.log("cdoToSource", tag, "pad["+pad+"]")
    var sc = '';
    var margen = '    ';
    if(tag.tagName) {
        sc = pad+'html.'+tag.tagName+'(';
        var attrs = '';
        if(tag.attributes) {
            for(var attName in tag.attributes) {
                var att = tag.attributes[attName];
                var aName = attName == 'id' ? attName : '"'+attName+'"';
                attrs += aName +': "'+att+'", ';
            }
            if(attrs !== '') {
                sc += '{';
                attrs = attrs.substr(0, attrs.length-2); // sacamos la ,
                sc += attrs + '}';
            }
        }
        if(tag.content && tag.content.length) {
            var allCont='';
            for(var elem=0; elem<tag.content.length; ++elem) {
                var obj = tag.content[elem];
                var cont='';
                if(obj.tagName) {
                    cont += cdoToSource(obj, '\n'+pad+margen)+',';
                } else {
                    if(attrs !== '') {
                        cont += '\n'+pad+margen;
                    }
                    cont += '"'+obj.textNode+'"';
                    if(attrs !== '') { cont +=','; }
                }
                allCont += cont;
            }
            if(allCont !== '') {
                if(attrs !=='') { sc += ', ['; }
                sc += allCont.substr(0, allCont.length+1);
                if(attrs !=='') { sc += '\n'+pad+']'; }
            }
        }
        sc += ')';
    }else if(tag.textNode) {
        sc += pad + '"'+tag.textNode+'"';
    }else if(tag.commentText) {
        sc += pad + 'html._comment("'+tag.commentText+'")';
    }
    if(pad.length===0) { sc += '\n'; }
    return sc;
}

jsFromHtml.toJsSourceCode = function toJsSourceCode(canonicDirectObject){
    //console.log("SC -> ", canonicDirectObject, typeof(canonicDirectObject)); 
    //if(!(canonicDirectObject instanceof jsToHtml.Html)) {
    /*
    if(! isInstanceOfHtml(canonicDirectObject)) {
        canonicDirectObject = jsFromHtml.parse(canonicDirectObject);
    }
    */
    if(typeof canonicDirectObject === "string"){
        canonicDirectObject = jsToHtml.html._text(canonicDirectObject);
    }
    return cdoToSource(canonicDirectObject,'');  
};

return jsFromHtml;

});
