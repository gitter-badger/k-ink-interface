/**
 * @module Ink.Plugin.Kink_1
 * @author entomb ( https://github.com/entomb/k-ink-interface ) and ported by inkdev AT sapo.pt
 * @version 0.1.0-DEV
 *
 * @license http://opensource.org/licenses/MIT

Copyright (c) 2013 Jonathan Tavares and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

 */
Ink.createModule('Ink.Plugin.Kink',1,[
    'Ink.Dom.Browser_1',
    'Ink.Dom.Selector_1',
    'Ink.Dom.Event_1',
    'Ink.Dom.Element_1',
    'Ink.Dom.Css_1',
    'Ink.Dom.Loaded_1', // DOM
    'Ink.Util.Array_1',
    'Ink.Util.Url_1',
    'Ink.Util.String_1',
    'Ink.Util.Date_1',
    'Ink.Util.Cookie_1',
    'Ink.Net.Ajax',
    'Ink.Net.JsonP'
],function(
    InkBrowser,
    InkSelector,
    InkEvent,
    InkElement,
    InkCss,
    InkLoaded,
    InkArray,
    InkUrl,
    InkString,
    InkDate,
    InkCookie,
    InkAjax,
    InkJsonP
){


    /**
     * @class kink
     * @module kink
     * @main kink
     * @param {mixed} param input parameter
     * @param {mixed} [context] context parameter
     * @return {kink.result} New kink.result object
     * @static
     * 
	 **/
    var kink = function(param,context){
        return new kink.result(param,context);
    };

    /**
     * Kink Result Object, holds resultsets and methods
     *
     * @main kResult
     * @class kResult
     * @uses Resultset
     * @uses Array
     * @uses Element
     * @uses CSS
     * @module kink
     * @param {mixed} param input parameter
     * @param {mixed} [context] context parameter
     * @constructor
     * @return {kink.result} kink.result object
    */
    kink.result = function(param,context){
        var rArray = [];

        if(!param){ //revent fuckups
            return this;
        }else if(param instanceof Array){ //direct array
            rArray = param;

        }else if(typeof param === 'string'){ //query selector
            try{
                rArray = InkSelector.select(param, context);
            }catch(e){
                rArray = [];
            }
        }else if(param instanceof Function){ //exec function

            return kink(param(context || kink));

        }else if(param instanceof kink.result){ //recursive much?
            return param;

        }else{ //fallback
            rArray = kink([param]);
        }

        //import resultArray into this
        for(var i in InkArray.convert(rArray)){
            this.push(rArray[i]);
        }

        //export full result object
        return kink.extend(this,{
            selector: param,
            context: context,
        });
    };

    //is this real life?
    kink.result.prototype = [];


    /**
     * @method kink.extend()
     * @for    kink
     * @final
     * @param  {Object}   extendObj the destination object or the object to extend `kink`
     * @param  {Object}   [paramObj] the origin object
     * @param  {Function} [cb] a callback function to be called after the merge
     * @return  {Mixed}
     * 
	 **/
    kink.extend = function(extendObj,paramObj,cb){

        //optional callback function
        if(cb===undefined && paramObj instanceof Function){
            cb = paramObj;
            paramObj = undefined;
        }

        if(paramObj===undefined){
            if('result' in extendObj){ //protect kink.result
                throw("Error extending kink: result is a reserved word");
            }
            if('extend' in extendObj){ //protect kink.extend and kink.result.extend
                throw("Error extending kink: extend is a reserved word");
            }

            //extend {kink + extendObj}
            Ink.extendObj(kink,extendObj);

            if(cb instanceof Function){
                cb.call(this,this);
            }
            return this;
        }else{
            //extend {extendObj + paramObj}
            Ink.extendObj(extendObj,paramObj);

            if(cb instanceof Function){
                cb.call(this,extendObj);
            }

            return extendObj;
        }
    };



    /**
     *
     * @method .extend()
     * @for    kResult
     * @final
     * @param  {Object}   object to extend `kResult`
     * @param  {Function} [cb] a callback function to be called after the merge
     * @return {kResult}
     * @chainable
     * 
	 **/
    kink.result.extend = function(extendObj,callback){
        if('result' in extendObj){ //protect kink.extend and kink.result.extend
            //throw("Error extending kink.result: extend is a reserved word");
        }
        kink.extend(kink.result.prototype,extendObj,callback);
    };






    /**
     * @DISCLAIMER
     * largely ispired in the jQuery core code. no need to re-invent the wheel here.
     */




    /**
     * @module Helper
     * @for kResult
     */

    /**
     * @Class Helper




     */
    kink.extend({
        /**
         * @property kink.browser
         * @for kink
         * @public
         */
        browser: InkBrowser,


        /**
         * @method kink.type()
         * @param  {mixed} element to inspect
         * @return {string} returns the type of the object.
         * @description

    #type table:
        true               === "boolean"
        new Boolean()      === "boolean"
        3                  === "number"
        new Number(3)      === "number"
        "test"             === "string"
        new String("test") === "string"
        function(){}       === "function"
        []                 === "array"
        new Array()        === "array"
        new Date()         === "date"
        new Error()        === "error"
        /test/             === "regexp"


         */
        type: function(target){

            if(target===null){
                return 'null';
            }

            if(target===undefined){
                return 'undefined';
            }

            var objectTypes = "object function array string number boolean date error regexp".split(" ");
            var jsType = typeof target;

            if(jsType==='object'){
                /* global toString */
                var evalType = (toString.call(target)).replace(/\[object|\s|\]/ig,'').toLowerCase();

                return (this.inArray(evalType,objectTypes)>0) ?  evalType : jsType;

            }else{
                return jsType;
            }
        },


        /**
         * @method kink.now()
         * @for kink
         * @return {int} unix timestamp
         */
        now: function(){
            return (new Date()).toTime();
        },


        /**
         * @method kink.isJSON()
         * @for kink
         * @return {bool}
         */
        isJSON: InkString.isJSON,


        /**
         * @method kink.isFunction()
         * @for kink
         * @return {bool}
         */
        isFunction: function(target) {
            return (this.type(target)==="function");
        },


        /**
         * @method kink.isWindow()
         * @for kink
         * @return {bool}
         */
        isWindow: function(target) {
            return (target===target.window);
        },


        /**
         * @method kink.isNumeric()
         * @for kink
         * @return {bool}
         */
        isNumeric: function(target) {
            return (target - parseFloat(target)>=0);
        },


        /**
         * checks if an object is empty
         * @param  {array|object} the element to inspect
         * @return {bool}
         */
        isEmptyObject: function(target) {
            var i;
            for ( i in target ) {
                return false;
            }
            return true;
        },


        /**
         * Trows an error.
         * @param  {string} msg Error menssage
         * @return {void}
         */
        error: function(msg) {
            throw new Error(msg);
        },


        /**
         * Turns a dashed string into a camelCase one
         * @param  {string} string some-dashed-string-like-this
         * @return {string} stringLikeThis
         */
        camelCase: function( string ) {
            return string.replace( /-([\da-z])/gi,function(all,letter) {
                                                    return letter.toUpperCase();
                                                });
        },


        /**
         * Truncates a string, breaking words and adding ... at the end
         *
         * @method .truncateString()
         * @param {String} string
         * @param {Number} length - length limit for the string. String will be at most this big, ellipsis included.
         * @return {String} string truncated
         */
        truncate: InkString.truncateString,


        /**
         * Remove spaces and new line from biggin and ends of string
         *
         * @method trim
         * @param {String} string
         * @return {String} string trimmed
         */
        trim: function(str){

            str = (str==="" || str===undefined || str===null) ? "" : String(str);
            return InkString.trim(str);
        },


        /**
         * Remove spaces and new line from biggin and ends of string
         *
         * @method trim
         * @param {String} string
         * @return {String} string trimmed
         */
        stripTags: InkString.stripTags,


        /**
         * Convert listed characters to HTML entities
         *
         * @method htmlEntitiesEncode
         * @param {String} string
         * @return {String} string encoded
         */
        htmlEntitiesencode: InkString.htmlEntitiesEncode,


        /**
         * Convert listed HTML entities to character
         *
         * @method htmlEntitiesDecode
         * @param {String} string
         * @return {String} string decoded
         */
        htmlEntitiesDecode: InkString.htmlEntitiesDecode,


        /**
         * Just an empty function
         * @return {void}
         */
        noop: function() {}

     });








    /**
     * @module Resultset
     * @for kResult
     */

    /**
     * @Class Resultset
     */
    kink.result.extend({

        /**
         * Returns item in the position `i` or all if `i` is undefined
         *
         * @method .get()
         * @param  {int|undefined} [i=undefined] index position. suports negative indexes.
         * @return {Mixed}  Returns the literal element for the position `i` or all of them
         */
        get: function(i) {
            if(i === undefined || typeof i !== 'number'){
                return InkArray.convert(this);
            }else{
                i = parseInt(i,10);
                return  this[(i<0) ? this.length+i : i];
            }
        },

        /**
         * Returns another `kResult` containing the item in the position `i` or all if `i` is undefined
         *
         * @method .result()
         * @param  {int|undefined} [i=undefined] index position. suports negative indexes.
         * @return {kResult}
         */
        result: function(i){
            return kink(this.get(i));
        },

        /**
         * Alias for `.result()`, this is here for a more familiar syntax.
         *
         * @method .eq()
         * @param  {int|undefined} [i=undefined] index position. suports negative indexes.
         * @return {kResult}
         */
        eq: function(i){
            return this.result(i);
        },

        /**
         * Returns a resultset containing the last item.
         *
         * @method .last()
         * @return {kResult}
         */
        last: function() {
            return this.result(this.length-1);
        },

        /**
         * Returns a resultset containing the first item.
         *
         * @method .first()
         * @return {kResult}
         */
        first: function() {
            return this.result(0);
        },

        /**
         * searches for elements using the `selector` param inside each of the current elements of the resultset
         *
         * @method .find()
         * @param {string} selector css selector to search for
         * @return {kResult}
         */
        find: function(selector){
            var foundElements = [];
            this.each(function(elem){
                kink(selector,elem).each(function(childElem){
                    if(!InkArray.inArray(childElem,foundElements)){
                        foundElements.push(childElem);
                    }
                });
            });

            return kink(foundElements);
        },


        /**
         * @method .siblings()
         */
        siblings: function(){
            var foundElements = [];
            this.each(function(elem){
                var elemFilter = InkElement.siblings(elem);
                if(elemFilter){
                    InkArray.each(elemFilter,function(elemSibling){
                        if(!InkArray.inArray(elemSibling,foundElements)){
                            foundElements.push(elemSibling);
                        }
                    });
                }
            });

            return kink(foundElements);
        },


        /**
         * @method .next()
         */
        next: function(){
            var foundElements = [];
            this.each(function(elem){
                var elemFilter = InkElement.nextElementSibling(elem);
                if(elemFilter && !InkArray.inArray(elemFilter,foundElements)){
                    foundElements.push(elemFilter);
                }
            });
            return kink(foundElements);
        },


        /**
         * @method .prev()
         */
        prev: function(){
            var foundElements = [];
            this.each(function(elem){
                var elemFilter = InkElement.previousElementSibling(elem);
                if(elemFilter && !InkArray.inArray(elemFilter,foundElements)){
                    foundElements.push(elemFilter);
                }
            });
            return kink(foundElements);
        },


        /**
         * @method .parent()
         */
        parent: function(){
            var foundParents = [];
            this.each(function(elem){
                if(elem.parentNode && !InkArray.inArray(elem.parentNode,foundParents)){
                    foundParents.push(elem.parentNode);
                }
            });

            return kink(foundParents);
        },


        /**
         * @method .childs()
         */
        childs: function(i){
            var foundElements = [];
            this.each(function(elem){
                var collection = InkArray.convert(elem.children);
                kink(collection).each(function(childElem){
                    if(childElem && !InkArray.inArray(childElem,foundElements)){
                        foundElements.push(childElem);
                    }
                });
            });

            if(typeof i !== 'number' && !i){
                return kink(foundElements);
            }else{
                return kink(foundElements).get(i);
            }
        }

    });




    kink.extend({

        /**
         * @method kink.each()
         * @for kink
         */
        each: function(arr,callback){
            return InkArray.each( InkArray.convert(arr) ,function(element,index){
                //@NOTE InkArray has no way of passing a 'this' context
                callback.call(element,element,index,arr);
            });
        },

        /**
         * @method kink.some()
         * @for kink
         */
        some: function(arr,callback){
            return InkArray.some( InkArray.convert(arr) ,function(element,index){
                return callback.call(element,element,index,arr);
            });
        },

        /**
         * @method kink.filter()
         * @for kink
         */
        filter: function(arr,callback) {
            return arr.filter(function(element,index){
                callback.call(element,element,index);
            });
        },

        /**
         * @method kink.filter()
         * @for kink
         */
        map: function(arr,callback) {
            var mapped = [];
            this.each(arr,function(element,index){
                var value = callback.call(element,element,index);
                if(value!==undefined && value!==null){
                    mapped.push(value);
                }
            });
            return mapped;
        },

        /**
         * @method kink.filter()
         * @for kink
         */
        grep: function(arr,callback) {
            return this.map(arr,function(element,index){
                var value = callback.call(element,element,index);
                if(value){
                    return element;
                }else{
                    return null;
                }
            });
        },

        /**
         * @method kink.makeArray()
         * @for kink
         */
        makeArray: function(target){
            return InkArray.convert(target);
        },

        /**
         * @method kink.inArray()
         * @for kink
         */
        inArray: function(element, arr) {
            var i = this.keyValue(element,arr,true);
            return (i!==false) ? i : -1; // -1 is here to replicate Array.indexOf
        },

        keyValue: function(element,arr,stopAtFirst){
            return InkArray.keyValue(element,arr,stopAtFirst);
        },

        /**
         * @method kink.isArray()
         * @for kink
         */
        isArray: function(target){
            return (this.type(target)==="array");
        },

        /**
         * Merge two arrays and return the result
         *
         * @method kink.merge()
         * @for  kink
         * @param  {array} arr1 target
         * @param  {array} arr2 source
         * @return {array} arr1+arr2
         */
        merge: function(arr1,arr2){
            arr1 = this.makeArray(arr1);
            arr2 = this.makeArray(arr2);

            for(var i in arr2){
                arr1.push(arr2[i]);
            }

            return arr1;
        },


        /**
         * Intersect two arrays and return the result
         *
         * @method kink.intersect()
         * @for  kink
         * @param  {array} arr1 target
         * @param  {array} arr2 source
         * @return {array} arr1+arr2
         */
        intersect: function(arr1,arr2){
            arr1 = this.makeArray(arr1);
            arr2 = this.makeArray(arr2);

            return InkArray.intersect(arr1,arr2);
        },

        /**
         * removes duplicares in an array
         *
         * @method kink.unique()
         * @for  kink
         * @param  {array} arr source
         * @return {array} unique elements from arr
         */
        unique: function(arr){

            arr = this.makeArray(arr);

            return this.grep(arr,function(element,index){
                return (kink.inArray(element,arr)===index);
            });

        },


    });


    /**
     * @module Array
     * @for kResult
     */

    /**
     * @Class Array
     */
    kink.result.extend({

        /**
         * @method .each()
         */
        each: function(callback){
            kink.each(this,callback);
            return this;
        },

        /**
         * @method .some()
         */
        some: function(callback){
            return kink.some(this,callback);
        },

        /**
         * @method .makeArray()
         * @for kResult
         */
        toArray: function(){
            return this.get();
        },

        /**
         * @method .filter()

        some: function(option){

            if(option instanceof Function){

            }else{
                var filterElements = kink(option);
                this.filter(function(){
                });
            }
        }*/

    });






    /**
     * @module Element
     * @for kResult
     */

    /**
     * @Class Element
     *
     */
    kink.result.extend({


        /**
         * @method  .hasAttribute()
         *
         */
        hasAttribute: function(attr){
            return this.some(function(){
                return InkElement.hasAttribute(attr);
            });
        },

        /**
         * @method  .attr()
         *
         */
        attr: function(attr,value){
            if(value !== undefined){
                return this.each(function(elem){
                    if(elem.setAttribute!==undefined){
                        elem.setAttribute(attr,value);
                    }
                });
            }else{
                var elem = this.get(0);
                if(elem!==undefined && elem.getAttribute!==undefined && InkElement.hasAttribute(elem,attr)){
                    return elem.getAttribute(attr);
                }else{
                    return null;
                }

            }
        },
        /**
         * @method  .name()
         *
         */
        name: function(value){
            return this.attr('name',value);
        },
        /**
         * @method  .id()
         *
         */
        id: function(value){
            return this.attr('id',value);
        },
        /**
         * @method  .tag()
         *
         */
        tag: function(){
            var elem = this.get(0);
            if(elem!==undefined){
                return this.get(0).nodeName.toUpperCase() || null;
            }else{
                return null;
            }
        },

        /**
         * @method  .offset()
         *
         */
        offset: function(){
            var offset2 = InkElement.offset2(this.get(0));
            return {
                top:    offset2[1],
                left:   offset2[0]
            };
        },

        /**
         * @method  .size()
         *
         */
        size: function(){
            return InkElement.elementDimensions(this.get(0));
        },

        /**
         * @method  .height()
         *
         */
        height: function(){
            return InkElement.elementHeight(this.get(0));
        },

        /**
         * @method  .width()
         *
         */
        width: function(){
            return InkElement.elementWidth(this.get(0));
        },



        /**
         * @method  .scroll()
         *
         */
        scroll: function(){
            return InkElement.scroll(this.get(0));
        },

        /**
         * @method  .scrollTo()
         *
         */
        scrollTo: function(){
            return InkElement.scrollTo(this.get(0));
        },

     /*

    checked
    data

    html

    size

    value
    */

    });




    /**
     * @module CSS
     * @for kResult
     *
     */

    /**
     * @Class CSS
     */
    kink.result.extend({


    /**
     * @method  .removeClass()
     * @param {String|Array|null} className className or array of classNames to remove
     * 
	 **/
        removeClass: function(className){
            if(className===undefined){
                return this.each(function(elem){
                    if(elem && elem.hasOwnProperty('className')){
                        elem.className = null;
                    }
                });
            }else if(className instanceof Array){
                return this.each(function(elem){
                    kink.each(className,function(iclass){
                        InkCss.removeClassName(elem,iclass);
                    });
                });
            }else{
                return this.each(function(elem){
                    InkCss.removeClassName(elem,className);
                });
            }
        },


    /**
     * @method  .addClass()
     * @param {String|Array} className className or array of classNames to add
     * 
	 **/
        addClass: function(className){
            if(className===undefined){
                return this;
            }else if(className instanceof Array){
                return this.each(function(elem){
                    kink.each(className,function(iclass){
                        InkCss.addClassName(elem,iclass);
                    });
                });
            }else{
                return this.each(function(elem){
                    InkCss.addClassName(elem,className);
                });
            }
        },


        /**
         * @method  .hasClass()
         *
         */
        hasClass: function(className){
            return this.some(function(elem){
                return InkCss.hasClassName(elem,className);
            });
        },

        /**
         * @method  .setClass()
         *
         */
        setClass: function(className){
            return this.removeClass().addClass(className.split(/\s+/));
        },

        /**
         * @method  .class()
         *
         */
        class: function(className){
            if(className===undefined){
                var elem = this.get(0);
                return (elem && elem.hasOwnProperty('className')) ? elem.className : '';
            }else{
                return this.setClass(className);
            }
        },


        /**
         * @method  .style()
         *
         */
        style: function(inlineStyle){
            if(inlineStyle===undefined){
                //return this.attr('style');

                //temp while attr() is not ready
                return this.get(0).getAttribute('style').trim();
            }else if(typeof inlineStyle==="string"){
                if(inlineStyle===""){
                    return this.each(function(elem){
                        elem.setAttribute('style','');
                    });
                }else{
                    return this.each(function(elem){
                        InkCss.setStyle(elem,inlineStyle);
                    });
                }
            }else{
                return this;
            }
        },


        /**
         * @method  .css()
         *
         */
        css: function(cssProp,value){
            //preventing type errors
            if(typeof this.get(0) !== "object" || !this.get(0).hasOwnProperty('style')){
                return this;
            }

            if(typeof cssProp==="string"){
                if(value===undefined){
                    return InkCss.getStyle(this.get(0),cssProp);
                }else{
                    return this.each(function(elem){
                        InkCss.setStyle(elem,cssProp+":"+value);
                    });
                }
            }else if(cssProp instanceof Object){
                return this.each(function(elem){
                    kink.extend(elem.style || {},cssProp);
                });
            }else{
                return this;
            }
        },

        /**
         * @method  .hide()
         *
         */
        hide: function(){
            return this.each(function(elem){
               InkCss.hide(elem);
            });
        },

        /**
         * @method  .show()
         *
         */
        show: function(){
            return this.each(function(elem){
               InkCss.show(elem);
            });
        },

        /**
         * @method  .toggle()
         *
         */
        toggle: function(state){
            if(state!==undefined){
                return this.each(function(elem){
                   InkCss.showHide(elem,!!state);
                });
            }else{
                return this.each(function(elem){
                   InkCss.toggle(elem);
                });
            }
        },

        /**
         * @method  .visible()
         *
         */
        visible: function(){
            var elem = this.first();
            return (elem.offset().left>0 &&
                elem.offset().top>0 &&
                elem.css('display')!=="none" &&
                elem.css('visibility')!=="hidden" &&
                elem.css('opacity')>0
            );
        }
    });


/**
 * @module window
 */


    /**
    * Kink main and global object

    * @property kink
    * @type {Class}
    * @for window
    * @global
    */
    window.kink = kink;

    /**
    * Shorthand for the Kink main and global object
    * @property kk
    * @type {Class}
    * @for window
    * @global
    */
    window.kk = kink;


    return kink;

    //end

});