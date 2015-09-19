/*cherry is a css selector*/
//
var cherry = (function(document){
  //---------------------the main function---------------------------------------
  var cherry = function(selector, from){
  	var COMMA = /\s*(?:,)\s*/;
  	var results = [];
  	var froms = from?(from.constructor == 'Array')? from : [from] : [document];
  	//console.log(froms);
  	var selectorString = selector 
  	                     && (~Object.prototype.toString.call(selector).indexOf('String'))
  	                     && parseSelector(selector);
  	    console.log(selectorString);
  	var selectors = selectorString.split(COMMA);
  	
  	for(var i = 0; i < selectors.length; i++ ){
  		var chopedArray = [], j = 0, token, filter, $from = froms;
  		chopedArray = chop(selectors[i]);
  		while(chopedArray[j]){
  			token = chopedArray[j++];
  			filter = chopedArray[j++];
  			$from = select($from, token, filter); 
  		}
  		results = results.concat($from);
  	}
     console.log(results);
  	return results;
  };
  // --------------------------------main function end-------------------------------
  //关于WHITESPACE正则表达式：首先我们理解下/\s*(^|$)\s*/g
  //这个表达式可以用来清除字符串前后的空白符，比如"   hello   ".replace(/\s*(^|$)\s*/g, '$1'); // "hello"
  //现在就好理解下面的WHITESPACE正则表达式了，起作用是用来清除选择器字符串中一些不必要的空白符。
  //比如子选择器多余空格（一个空格就够了），'>','+','~','(',')',','前后的空白符。使得选择器
  //字符串能够成为标准的选择器字符串。便于后面的切分

  var WHITESPACE = /\s*([\s>=+~(),]|^|$)\s*/g;
  var ADD_STAR = /([\s>+~,]|^)([:#.])/g;
  function parseSelector(selector){
  	return selector
  	       .replace(WHITESPACE, '$1')
  	       .replace(ADD_STAR, '$1*$2');
  }
  //chop函数用来把选择器切分为单个token，filter等
  var STANDAR_SELECT = /^[^\s>~+]/;
  var CHOP = /[\s>+~#.]|[^\s>+~#.]+/g;
  function chop(selector){
  	if(STANDAR_SELECT.test(selector)) selector = ' ' + selector;
  	return selector.match(CHOP);
  }
  //-----------------------Dom 元素获取常用属性（方法）--------------------------------
  //IE8及以下只支持children属性，不支持previousElementSibling，nextElementSibling，
  //lastElementChild, firstElementChild, childElementCount属性。因此需要对这些属性进行
  //浏览器兼容处理
  // ************* 注意下面是一个错误示范 **********************
  // addGeter静态方法应该添加到Node构造函数上面
  // HTMLElement.addGetter = function(name, func){
  //     Object.defineProperty(this.prototype, name, {
  //       configuable : true,
  //       enumerable  : false,
  //       get         : function(){
  //             return func(this);
  //       }
  //     });
  //     return this;
  // };
  Node.addGetter = function(name, func){
      Object.defineProperty(this.prototype, name, {
        configuable : true,
        enumerable  : false,
        get         : function(){
              return func(this);
        }
      });
      return this;
  };
  //isElementNode函数用来判断Dom元素是否是element节点
  Node.addGetter('isElementNode', function(self){
    return !!(self && self.nodeType == 1);
  });

  Node.addGetter('prevEleSibling', function(self){
    if(self.previousElementSibling) return self.previousElementSibling;
    var element = self;
    while(element && (element = element.previousSibling) && !element.isElementNode) continue;
    return element;
  });

  Node.addGetter('nextEleSibling', function(self){
    if(self.nextElementSibling) return self.nextElementSibling;
    var element = self;
    while(element && (element = element.nextSibling) && !element.isElementNode) continue;
    return element;
  });
  HTMLElement.addGetter('firstEleChild', function(self){
    if(self.firstElementChild) return self.firstElementChild;
    return (self.firstChild.isElementNode)? 
            self.firstChild : self.firstChild.nextEleSibling;
  });

  HTMLElement.addGetter('lastEleChild', function(self){
    if(self.lastElementChild) return self.lastElementChild;
    return (self.lastChild.isElementNode)?
            self.lastChild : self.lastChild.prevEleSibling;
  });
        
  HTMLElement.addGetter('childrenEle', function(self){
    if(self.children) return self.children;
    var elements = [], element = self.firstEleChild;
    while(element){
      elements.push(element);
      element = element.nextEleSibling;
    }
    return elements;
  });

  HTMLElement.addGetter('childEleCount', function(self){
    if(self.childElementCount) return self.childElementCount;
    return self.childrenEle.length;
  });
  //desEleNodes用来获取所有的子孙元素节点
  HTMLElement.addGetter('desEleNodes', function(self){
    var elements = [];
    (function collectElements(elems){
      Array.prototype.push.apply(elements, elems);
      for(var i = 0; i < elems.length; i++){
        if(elems[i].childrenEle){
          collectElements(elems[i].childrenEle);
        }
      }
    })(self.childrenEle);
    return elements;
  }); 
 // ---------------------获取DOM元素常用函数结束---------------------------
 // ---------------------选择器对象---------------------------------------
  var $selectors = {};
  $selectors['#'] = function(result, from, id){
  	for(var i = 0; i < from.length; i++){
  		if(from[i].id == id) result.push(from[i]);
  	}
  	return result || [];
  };
  $selectors['.'] = function(result, from, className){
  	var CLASS_NAME = new RegExp('^|\\s' + className + '$|\\s');
  	for(var i = 0; i < from.length; i ++){
  		if(CLASS_NAME.test(from[i].classNmae)) result.push(from[i]);
  	}
  	return result || [];
  };
  //后代选择器
  $selectors[' '] = function(result, from, tagName){
  	for(var i = 0; i < from.length; i++){
      from[i] = (from[i] == document)? document.documentElement : from[i];
      if(tagName === '*'){
        Array.prototype.push.apply(result, from[i].desEleNodes);
      } else {
        for(var j = 0; j < from[i].desEleNodes.length; j++ ){
          console.log(from[i].desEleNodes[j].tagName);
          if(from[i].desEleNodes[j].tagName.toLowerCase() == tagName) 
            result.push(from[i].desEleNodes[j]);
        }
      }                   
    }
    return result || [];
  };
  //------------------------选择器对象结束--------------------------------
  //select函数用来选择在指定token，filter下的dom元素
  //token是选择器的标签，如"#"是id选择器，"."是类选择器，">"是子选择器等
  //filter是元素标签名，tagName。或者id，或者className等
  function select(from, token, filter){
  	var results = [];
  	if($selectors[token]){
  		$selectors[token](results, from, filter);
  	}
  	return results;
  }
  return cherry;
})(document);









