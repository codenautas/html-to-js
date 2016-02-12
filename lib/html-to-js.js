"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */
(function codenautasModuleDefinition(root, name, factory) {
    /* global define */
    /* global globalModuleName */
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
})(/*jshint -W040 */this, 'htmlToJs', function() {
/*jshint +W040 */

var htmlparser = require("htmlparser2");
var jsToHtml = require("js-to-html");
var htmlTags = jsToHtml.htmlTags;

/*jshint -W004 */
var htmlToJs = {};
/*jshint +W004 */

function isInstanceOfHtml(obj) {
    return String(obj.constructor).substr(0,17)==="function HtmlBase";
}

/* global document */
htmlToJs.parse = function parse(htmlText){
    //console.log("parse INPUT", (htmlText instanceof jsToHtml.Html ? "SI" : "NO"));
    if(isInstanceOfHtml(htmlText)) { return htmlText; }
    var out = {};
    var level = 0;
    var curNode = null;
    var curLevel = level;
    var curText = '';
    var parser = new htmlparser.Parser({
        onopentag: function(name, attribs){
            //console.log("open", name, "attribs", attribs);
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
    //console.log("parse --->", out);
    return out;
}

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
                    if(attrs != '') cont +=',';
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
    if(pad.length==0) { sc += '\n'; }
    return sc;
}

htmlToJs.toJsSourceCode = function toJsSourceCode(canonicDirectObject){
    //console.log("SC -> ", canonicDirectObject, typeof(canonicDirectObject)); 
    //if(!(canonicDirectObject instanceof jsToHtml.Html)) {
    /*
    if(! isInstanceOfHtml(canonicDirectObject)) {
        canonicDirectObject = htmlToJs.parse(canonicDirectObject);
    }
    */
    if(typeof canonicDirectObject === "string"){
        canonicDirectObject = jsToHtml.html._text(canonicDirectObject);
    }
    return cdoToSource(canonicDirectObject,'');
    
}

return htmlToJs;

});
