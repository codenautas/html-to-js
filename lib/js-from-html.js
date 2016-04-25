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
var htmlAttribs = jsToHtml.htmlAttributes;

function isBooleanAttribute(tagName, att) {
    //console.log(tagName, att, htmlAttribs[att].tags[tagName]);
    if(htmlAttribs[att].tags[tagName].value==="Boolean attribute") {
        return true;
    }
    return false;
}

jsFromHtml.genJS = function genJS(el) {
    if(el.type === 'text') {
        return jsToHtml.direct({textNode:el.data});
    } else if(el.type === 'comment') {
        return jsToHtml.direct({commentText:el.data});
    } else {
        var tag = {
            tagName : el.name,
            attributes : el.attribs,
            content : []
        };
        for(var attName in tag.attributes) {
            if(tag.attributes[attName]==='' && isBooleanAttribute(tag.tagName, attName)){
                tag.attributes[attName] = attName;
            }
        }
        for(var c in el.children) {
            var child = el.children[c];
            tag.content.push(jsFromHtml.genJS(child));
        }
        return tag;
    }
};

jsFromHtml.parse = function parse(htmlText){
    if(String(htmlText.constructor).substr(0,17)==="function HtmlBase") { return htmlText; }    
    //console.log("parse'" + htmlText +"'");
    var dom = htmlparser.parseDOM(htmlText, {decodeEntities: true})
    var res = [];
    for(var elem=0; elem<dom.length; ++elem) {
        res.push(jsFromHtml.genJS(dom[elem]));
    }
    return res;
};

jsFromHtml.parseTextNode = function parseTextNode(text, pad) {
    var lines = text.split(/\r?\n/);
    switch(lines.length) {
        case 1: return '"'+text.replace(/"/g, '\\"')+'"';
        case 2:
            if(lines[1]==='') {
                return '"'+lines[0].replace(/"/g, '\\"')+'\\n"';
            }
            // fall through
        default:
            for(var l=0; l<lines.length; ++l) {
                lines[l] = lines[l].replace(/"/g, '\\"');
                if(l<lines.length-1 || lines[l]==='') { lines[l] += '\\n'; }
            }
            return (lines.length>2?'\n'+pad+pad:'')+'"'+lines.join('"+\n'+pad+pad+'"')+'"';
    }
};

/*
    1. El content va siempre abajo, nunca al lado salvo que sea un solo elemento de texto que va sin corchetes y en la misma línea
    2. Los atributos si son 4 o menos van en un solo renglón. Si son más van identados uno abajo del otro
        a. Primero va id (si está), luego en orden alfabético
        b. Sin comillas salvo los reserved y los guionados
*/
jsFromHtml.cdoToSource = function cdoToSource(tag, pad) {
    var out = [];
    var margen = '    ';
    if(tag.tagName) {
        if(pad.length!==0) {
            out.push('\n');
        }
        out.push(pad+'html.'+tag.tagName+'(');
        var attrs = [];
        var idPos = -1;
        if(tag.attributes) {
            var numAttribs = 0;
            for(var attName in tag.attributes) {
                ++numAttribs;
                var att = tag.attributes[attName];
                var aName = attName;
                switch(attName) {
                    case 'for':
                    case 'class':
                        aName ='"'+aName+'"'
                        break;
                    case 'id':
                        idPos = attrs.length; // sera insertado!
                        break; // por si se agrega algo al final
                    default:
                        if(attName.indexOf('-') !== -1) {
                            aName ='"'+aName+'"'
                        }
                        break;
                }
                attrs.push(aName +': "'+att+'"');
            }
            if(attrs.length) {
                if(idPos !== -1) {
                    var id = attrs[idPos];
                    attrs.splice(idPos, 1);
                    attrs = attrs.sort();
                    attrs.unshift(id);
                } else {
                    attrs = attrs.sort();
                }
                out.push('{');
                if(attrs.length<5) {
                    out.push(attrs.join(', '));
                } else {
                    var join = ',\n'+pad+margen;
                    out.push('\n'+pad+margen + attrs.join(join) + ',\n'+pad);
                }
                out.push('}');
            }
        }
        if(tag.content && tag.content.length) {
            var allCont=[];
            var haveObjs = 0;
            var isLabel = false;
            for(var elem=0; elem<tag.content.length; ++elem) {
                var obj = tag.content[elem];
                //console.log("obj", obj);
                var cont=[];
                if(obj.tagName) {
                    ++haveObjs;
                    cont.push(jsFromHtml.cdoToSource(obj, pad+margen)+',');
                } else {
                    if(tag.content.length !== 1) { cont.push('\n'+pad+margen);  }
                    cont.push(jsFromHtml.parseTextNode(obj.textNode, pad));
                    if(tag.content.length !== 1) { cont.push(',');  }
                }
                allCont.push(cont.join(''));
            }
            if(allCont.length>0) {
                if(attrs.length) { out.push(', '); }
                if(haveObjs) { out.push('['); }
                var allContS = allCont.join('');
                out.push(allContS.substr(0, allContS.length+1));
                if(haveObjs) {
                    out.push('\n'+pad+']');
                }
            }
        }
        out.push(')');
    }else if(tag.textNode) {
        out.push(pad + '"'+tag.textNode+'"');
    }else if(tag.commentText) {
        out.push(pad + 'html._comment("'+tag.commentText+'")');
    }
    if(pad.length===0) { out.push(',\n'); }
    return out.join('');
};

jsFromHtml.toJsSourceCode = function toJsSourceCode(canonicDirectObject){
    if(typeof canonicDirectObject === "string"){
        canonicDirectObject = jsToHtml.html._text(canonicDirectObject);
    }
    var jsSrc = [];
    if(canonicDirectObject.length) {
        for(var o=0; o<canonicDirectObject.length; ++o) {
            var cdo = canonicDirectObject[o];
            if(typeof cdo ==="string") {
                cdo = jsToHtml.html._text(cdo);
            }
            jsSrc.push(jsFromHtml.cdoToSource(cdo, ''));
        }
    } else {
        jsSrc.push(jsFromHtml.cdoToSource(canonicDirectObject, ''));
    }
    return jsSrc.join('');
};

return jsFromHtml;

});
