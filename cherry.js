/*cherry is a css selector*/
var cherry = (function(document){
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
  //---------------Dom 操作常用函数------------------
  HTMLElement.addGetter = function(name, func){
      Object.defineProperty(this.prototype, name, {
        configuable : true,
        enumerable  : false,
        get         : function(){
              return func(this);
        }
      });
      return this;
  };
  HTMLElement.addGetter('isElementNode', function(self){
    return !!(self && self.nodeType === 1);
  });

  HTMLElement.addGetter('preEleSibling', function(self){
      var element = self;
      while(element && (element = element.previousSibling) && !element.isElementNode) continue;
      return element;
  });

  HTMLElement.addGetter('nextEleSibling', function(self){
    return self.nextElementSibling;
  });
  HTMLElement.addGetter('firstEleChild', function(self){
    return (self.firstChild.isElementNode)? 
            self.firstChild : self.firstChild.nextElementSibling;
  });
    
  HTMLElement.addGetter('childEleNodes', function(self){
    var elements = [], element = self.firstElementChild;
    while(element){
      elements.push(element);
      element = element.nextElementSibling;
    }
    return elements;
  });
  HTMLElement.addGetter('desEleNodes', function(self){
    var elements = [];
    (function collectElements(elems){
      Array.prototype.push.apply(elements, elems);
      for(var i = 0; i < elems.length; i++){
        if(elems[i].childEleNodes){
          collectElements(elems[i].childEleNodes);
        }
      }
    })(self.childEleNodes);
    return elements;
  });
 // ------------------------------------------------
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
          if(from[i].desEleNodes[j].tagName.toLowerCase() == tagName) result.push(from[i].desEleNodes[j]);
        }
      }                   
    }
    return result || [];
  };

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









