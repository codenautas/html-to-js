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

/* global document */
htmlToJs.parse = function parse(htmlText){
    //console.log("INPUT", htmlText);
    var out = {};
    var level = 0;
    var curTag = null;
    var curLevel = level;
    var parser = new htmlparser.Parser({
        onopentag: function(name, attribs){
            //console.log("open", name, "attribs", attribs);
            if(name in htmlTags) {
                if(! curTag) { curTag = out; }
                if(curLevel != level) {
                    var newTag = {};
                    curTag.content.push(newTag);
                    curTag = newTag;
                    curLevel = level;
                }
                curTag.tagName = name;
                curTag.attributes = {};
                curTag.content = [];
                if(attribs) {
                    curTag.attributes = attribs;
                }
                ++level;
            }
        },
        ontext: function(text){
            //console.log("-->", text);
            if(curTag){
                curTag.content.push({textNode:text});
            }
        },
        onclosetag: function(tagname){
            //console.log("close", tagname);
            --level;
        }
    }, {decodeEntities: true});
    parser.write(htmlText);
    parser.end();
    return out;
}

var htmlReservedSymbols={
    '&' :'&amp;',
    '<' :'&lt;',
    '>' :'&gt;',
    "'" :'&#39;',
    '"' :'&quot;'
};

function decodeSpecialChars(htmlText) {
    for(var sym in htmlReservedSymbols) {
        var code = htmlReservedSymbols[sym];
        htmlText = htmlText.replace(code, sym);
    }
    return htmlText;
}

function cdoToSource(tag, pad) {
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
                    cont += cdoToSource(obj, '\n'+pad+margen);
                    if(attrs !=='' && pad.length) { cont +=','; }
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
    }
    else {
        sc += pad + 'html._text("'+decodeSpecialChars(tag)+'")';
    }
    if(! pad.length) { sc += '\n'; }
    return sc;
}

htmlToJs.toJsSourceCode = function toJsSourceCode(canonicDirectObject){
    // console.log("toJsSourceCode", canonicDirectObject);
    return cdoToSource(canonicDirectObject,'');
}

return htmlToJs;

});
