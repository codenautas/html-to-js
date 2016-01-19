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

/*jshint -W004 */
var htmlToJs = {};
/*jshint +W004 */

/* global document */
htmlToJs.parse = function parse(htmlText){
    return {tagName:'div', attributes:{'not': 'implemented'}, content:[]};
}

htmlToJs.toJsSourceCode = function toJsSourceCode(canonicDirectObject){
    return "not implemented yet!";
}

return htmlToJs;

});
