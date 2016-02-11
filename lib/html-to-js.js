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
    //console.log("out", out)
    return out;
}

htmlToJs.toJsSourceCode = function toJsSourceCode(canonicDirectObject){
    return "not implemented yet!";
}

return htmlToJs;

});
