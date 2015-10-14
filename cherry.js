/*cherry is a css selector*/
// this main file include css level1 css selcetor
// create by luoran 
var cherry = (function(document){
  //---------------------the main function---------------------------------------
  var cherry = function($selector, $from){
  	var COMMA = /\s*(?:,)\s*/, 
        results = [],
        $useCache = cherry.cache && !$from,
        selectors;

  	$from = $from? ($from.constructor == 'Array')? $from : [$from] : [document.documentElement];
  	$selector = $selector 
  	           && (~Object.prototype.toString.call($selector).indexOf('String'))
  	           && parseSelector($selector);
  	selectors = $selector.split(COMMA);
  	for(var i = 0; i < selectors.length; i++ ){
  		var chopedArray = chop(selectors[i]), 
          j = 0, token, filter, arguments = '',
          cacheSelector = '', from = $from;
  		console.log(chopedArray)
  		while(chopedArray[j]){
  			token = chopedArray[j++];
  			filter = chopedArray[j++];
        cacheSelector += token + filter;

        if(chopedArray[j] === '('){
          while(chopedArray[j++] !==')' && j < chopedArray.length){
            arguments += chopedArray[j];
          }
          arguments = arguments.slice(0, -1);
          cacheSelector += '(' + arguments + ')';
        }

        if($useCache && cache[cacheSelector]){
          from = cache[cacheSelector];
        } else {
          from = select(from, token, filter, arguments);
          if($useCache) cache[cacheSelector] = from;
        }
  		}
  		results = results.concat(from);
  	}
  	return results;
  };
  // --------------------------------main function end-------------------------------
  // select 函数开始-------------------------------------------------------------------
  //select函数用来选择在指定token，filter下的dom元素
  //token是选择器的标签，如"#"是id选择器，"."是类选择器，">"是子选择器等
  //filter是元素标签名，tagName。或者id值，或者className值等
  function select($from, $token, $filter, $arguments){
    var results = [];
    if($selectors[$token]){
      $selectors[$token](results, $from, $filter, $arguments);
    }
    return results;
  }
  // select 函数结束-------------------------------------------------------------------
  // ---------------------选择器对象----------------------------------------------------
  var $selectors = {};
  //id 选择器'#'
  $selectors['#'] = function(result, from, id){
    for(var i = 0; i < from.length; i++){
      if(from[i].id == id) result.push(from[i]);
    }
    return result || [];
  };
  //类选择器 '.'
  $selectors['.'] = function(result, from, className){
    var CLASS_NAME = new RegExp('(^|\\s)' + className + '(\\s|$)');
    var i, element;
    for(i = 0; (element = from[i]); i++ ){
      if(CLASS_NAME.test(element.className)) result.push(element);
    }
    return result || [];
  };
  //后代选择器' '
  $selectors[' '] = function(result, from, tagName){
    for(var i = 0; i < from.length; i++){
      //from[i] = (from[i] == document)? document.documentElement : from[i];
      if(tagName === '*'){
        Array.prototype.push.apply(result, from[i].desEleNodes);
      } else {
        for(var j = 0; j < from[i].desEleNodes.length; j++ ){
          if(from[i].desEleNodes[j].tagName.toLowerCase() == tagName) 
            result.push(from[i].desEleNodes[j]);
        }
      }                   
    }
    return result || [];
  };
  // 子选择器'>'
  $selectors['>'] = function($result, $from, $tagName){
    for(var i = 0; i < $from.length; i ++){
       //$from[i] = ($from[i] === document)? document.documentElement : $from[i];
       if($tagName === '*'){
        Array.prototype.push.apply(result, $from[i].childrenEle);
       } else {
        Array.prototype.forEach.call($from[i].childrenEle, function(ele){
          if(ele.tagName.toLowerCase() === $tagName) $result.push(ele);
        });
       }
    }
    return $result || [];
  };
  // 临近元素选择器'+'
  $selectors['+'] = function($result, $from, $tagName){
    for(var i = 0, len = $from.length; i < len; i ++){
      if($from[i].nextEleSibling && $from[i].nextEleSibling.tagName.toLowerCase() === $tagName){
        $result.push($from[i].nextEleSibling);
      }
    }
    return $result;
  };
  // 排在其后面的所有兄弟元素选择器 '~'
  $selectors['~'] = function($result, $from, $tagName){
    for(var i = 0, len = $from.length; i < len; i ++){
      Array.prototype.forEach.call($from[i].afterEleSiblings, function(ele){
        if(ele.tagName.toLowerCase() === $tagName) $result.push(ele);
      });
    }
    return $result;
  };
  //伪类选择器':'
  $selectors[':'] = function($result, $from, $pseudoClass, $arguments){
    var $test = null;
    if(pseudoClasses[$pseudoClass]) $test = pseudoClasses[$pseudoClass];
    if($pseudoClass == 'root') $from.push(document.documentElement);
    for(var i = 0, len = $from.length; i < len; i++ ){
      if($test($from[i], $arguments)) $result.push($from[i]);
    }
    return $result;
  };
  // 属性选择器'@'
  $selectors['@'] = function($result, $from, $attributeId){
    var test = null;
    if(attributeSelectors[$attributeId]) test = attributeSelectors[$attributeId].test;
    for(var i = 0, len = $from.length; i < len; i ++){
      if(test($from[i])) $result.push($from[i]);
    }
  }
  //------------------------选择器对象结束--------------------------------
  //------------------------pseudo-classes-------------------------------
  var pseudoClasses = {};
  // 以下是CSS3以前的伪类选择器
  // link pseudoClass 用来判断一个元素是否是：link伪类选择器，返回值为：true or false；
  pseudoClasses['link'] = function($element){
    var links = document.links;
    return Array.prototype.some.call(links, function(ele){
      return ele === $element;
    });
  };
  pseudoClasses['lang'] = function($element, $value){
    console.log($value)
    if($element && $element.getAttribute('lang'))
      return new RegExp('^' + $value).test($element.getAttribute('lang'));
  };
  //下面几个伪类属于css1选择器，但是jQuery中没有实现这些选择器?
  pseudoClasses['visited'] = function($element){}
  pseudoClasses['active'] = function($element){}
  pseudoClasses['hover'] = function($element){}
  pseudoClasses['first-letter'] = function($element){}
  pseudoClasses['first-line'] = function($element){}
  //CSS 3 伪类选择器
  pseudoClasses['first-child'] = function($element){
    return !$element.prevEleSibling;
  };
  pseudoClasses['last-child'] = function($element){
    return !$element.nextEleSibling;
  };
  // root选择器问题：$from中不可能有document.documentElement 啊？？？
  //root 选择器暂时还不能够使用
  pseudoClasses['root'] = function($element){
    return $element === $element.ownerDocument.documentElement;
  };
  pseudoClasses['first-of-type'] = function($element){
    var parent = $element.parentNode;
    var firstChild = parent.firstEleChild;
    while(firstChild && 
          firstChild.tagName.toLowerCase() !== $element.tagName.toLowerCase()){
      firstChild = firstChild.nextEleSibling;
    }
    return firstChild === $element;
  };
  pseudoClasses['last-of-type'] = function($element){
    var parent = $element.parentNode;
    var lastChild = parent.lastEleChild;
    while(lastChild && lastChild.tagName.toLowerCase() !== $element.tagName.toLowerCase()){
      lastChild = lastChild.prevEleSibling;
    }
    return lastChild === $element;
  };
  pseudoClasses['only-of-type'] = function($element){
    var parent = $element.parentNode;
    var tagName = $element.tagName.toLowerCase();
    return parent.getElementsByTagName(tagName).length === 1;
  };
  //子考虑元素节点
  pseudoClasses['only-child'] = function($element){
    return !$element.prevEleSibling && !$element.nextEleSibling;
  };
  //:empty 用来选择没有子元素（元素节点）的元素
  pseudoClasses['empty'] = function($element){
    return $element.childrenEle.length === 0 ? true : false;
  };
  // :target 用来选择某个元素的target元素，只有在跳转后才会表现出特定样式，也就是说
  //只有点击了连接后，target元素的样式才会生效(现在的问题是，刚点击后在target元素上
  // 设置的样式还不能够生效，只有刷新页面才能够生效)
  pseudoClasses['target'] = function($element){
    return $element.id && $element.id === location.hash.slice(1);
  };
  pseudoClasses['enable'] = function($element){
    return $element.disabled === false;
  };
  pseudoClasses['disabled'] = function($element){
    return $element.disabled;
  };
  pseudoClasses['checked'] = function($element){
    return $element.checked;
  };
  pseudoClasses['indeterminate'] = function($element){
    return $element.indeterminate;
  };
  pseudoClasses['not'] = function($element, $argument){
    var negted = cherry($argument);
    for(var i = 0; i < negted.length; i ++){
      if($element === negted[i]) return false;
    }
    return true;
  };
  pseudoClasses['nth-child'] = function($element, $argument){
    return nthChild($element, $argument, 'nextEleSibling');
  };
  pseudoClasses['nth-last-child'] = function($element, $argument){
    return nthChild($element, $argument, 'prevEleSibling');
  };
  pseudoClasses['nth-of-type'] = function($element, $argument){
    return nthChild($element, $argument, 'nextEleSibling', 'nthType');
  };
  pseudoClasses['nth-last-of-type'] = function($element, $argument){
    return nthChild($element, $argument, 'prevEleSibling', 'nthType');
  };
  //jQuery中的contains 伪类选择器的实现
  pseudoClasses['contains'] = function($element, $text){
    return new RegExp($text.slice(1,-1)).test($element.textCont);
  };
  
  function nthChild($element, $argument, $travese, type){
    var multi, step, children = [], tagName = $element.tagName.toLowerCase();
    switch($argument){
      case 'n': return true; break;
      case 'even': $argument = '2n'; break;
      case 'odd' : $argument = '2n+1'; break;
    }
    if(type && type == 'nthType'){
      Array.prototype.forEach.call( $element.parentNode.childrenEle, function(ele){
        if(ele.tagName.toLowerCase() === $element.tagName.toLowerCase())
          children.push(ele);
      });
    } else children = $element.parentNode.childrenEle;
    function _checkIndex($index){
      $index =  Object.prototype.toString.call($travese).indexOf('Function') &&
             $travese === 'prevEleSibling' ? children.length - $index : $index -1;
      return children[$index] === $element;
    }

    if(!isNaN($argument)) 
      return _checkIndex($argument);
    $argument = $argument.split('n');
    multi = parseInt($argument[0]);
    step = parseInt($argument[1]);
    if(isNaN(step)) step = 0;
    if(isNaN(multi)) multi = 1;
    if(multi == 0) return _checkIndex(step);
    var count = 1;
    if(type && type == 'nthType') {
      while($element = $element[$travese]) {
        if($element.tagName.toLowerCase() == tagName) count++;
      }
    } else {
      while($element = $element[$travese]) count++;
    }
    console.log(count)
    if(multi == 1) 
      return children.length - count + 1 >= step;
    return count % multi === step % multi && children.length - count + 1 >= step;
  }
  //------------------------pseudo-calsses end---------------------------

  /*属性选择器相关的方法*/
  var attributeSelectors = [];
  var AttributeSelector = {match: /\[([\w-]+(\|[\w-]+)?)\s*(\W?=)?\s*([^\]]*)\]/};
  AttributeSelector.tests = {};
  AttributeSelector.NAMESPACE = '/\:/g';
  AttributeSelector.PREFIX = '@';

  AttributeSelector.parse = function($selector){
    var matches, attrId;
    $selector = $selector.replace(this.NAMESPACE, '|');
    matches = $selector.match(this.match);
    if(matches)
      attrId = this.getAttrId(matches[0], matches[1], matches[2], matches[3], matches[4]);
    return $selector = $selector.replace(this.match, attrId);
  };

  AttributeSelector.getAttrId = function($match, $attribute, $nameSpace, $compare, $value){
    var key = this.PREFIX + $match, attributeSelector;
    if(!attributeSelectors[key]){
      attributeSelector = this.create($attribute, $compare || '', $value || '');
      attributeSelectors[key] = attributeSelector;
      attributeSelectors.push(attributeSelector);
    }
    return attributeSelectors[key].id;
  };
  AttributeSelector.create = function($propertyName, $compare, $value){
    var attributeSelector = {}, test;
    attributeSelector.id = this.PREFIX + attributeSelectors.length;
    attributeSelector.name = $propertyName;
    test = this.tests[$compare];
    attributeSelector.test = function(ele){
      return test? test(ele.getAttribute($propertyName), $value.slice(1,-1)) : false;
    }
    return attributeSelector;
  };

  AttributeSelector.tests[''] = function($attribute){
    return $attribute !== null;
  };
  AttributeSelector.tests['='] = function($attribute, $value){
    return $attribute === $value;
  };
  AttributeSelector.tests['~='] = function($attribute, $value){
    return new RegExp('(^| )' + $value + '( |$)').test($attribute);
  };
  AttributeSelector.tests['|='] = function($attribute, $value){
    return new RegExp('^' + $value + '(-|$)').test($attribute);
  };
  // CSS 3
  AttributeSelector.tests['*='] = function($attribute, $value){
    return new RegExp($value).test($attribute);
  };
  AttributeSelector.tests['^='] = function($attribute, $value){
    return new RegExp('^' + $value).test($attribute);
  };
  AttributeSelector.tests['$='] = function($attribute, $value){
    return new RegExp($value + '$').test($attribute);
  };

  //monkey-patch
  var _parseSelector = parseSelector;
  parseSelector = function($selector){
    return _parseSelector(AttributeSelector.parse($selector));
  };
  /*属性选择器相关的方法结束*/
  // --------------------------------DOM element 缓存---------------------------------
  var cache = {};
  //默认选择器是缓存的
  cherry.cache = true;
  //删除某一选择器的缓存，如果不传参数，就删除整个选择器缓存
  cherry.cleanCache = function($selector){
    if($selector){
      var cacheSelector = chop($selector).join('');
      if(cache[cacheSelector]) delete cache[cacheSelector];
    } else cache = {};
  }
  //---------------------------------DOM element 缓存 end-----------------------------
  //关于WHITESPACE正则表达式：首先理解：/\s*(^|$)\s*/g
  //这个表达式可以用来清除字符串前后的空白符，比如"   hello   ".replace(/\s*(^|$)\s*/g, '$1'); 
  // "hello"
  //现在就好理解下面的WHITESPACE正则表达式了，起作用是用来清除选择器字符串中一些不必要的空白符。
  //比如子选择器多余空格（一个空格就够了），'>','+','~','(',')',','前后的空白符。使得选择器
  //字符串能够成为标准的选择器字符串。便于后面的切分

  var WHITESPACE = /\s*([\s>=+~(),]|^|$)\s*/g;
  var ADD_STAR = /([\s>+~,]|^)([:#.@])/g;
  function parseSelector(selector){
  	return selector
  	       .replace(WHITESPACE, '$1')
  	       .replace(ADD_STAR, '$1*$2');
  }
  // chop函数用来把选择器切分为单个token，filter等
  // CHOP正则表达式就是用来切分选择器字符串的「分界点」，token包括(' ','#','.',':','~','+','>')
  // 分别为后代选择器，id选择器，类选择器，伪类选择器，选择目标元素以后的兄弟元素选择器，选择目标元素
  // 下一个相邻元素的选择器，子选择器。
  var STANDAR_SELECT = /^[^\s>~+]/;
  var CHOP = /[\s>+~#.:()@]|[^\s>+~#.:()@]+/g;
  function chop(selector){
  	if(STANDAR_SELECT.test(selector)) selector = ' ' + selector;
  	return selector.match(CHOP);
  }
  //-----------------------Dom 元素获取常用属性（方法）--------------------------------
  //IE8及以下只支持children属性，不支持previousElementSibling，nextElementSibling，
  //lastElementChild, firstElementChild, childElementCount，children属性。
  //因此在不支持这些属性的浏览器中需要对这些属性进行定义
  //addGetter： 是在Node上面添加一个addGetter的静态方法，用来向Node原型上添加get属性，get属性的返回值
  //是在Node实例上条用func的返回值。
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
  // isTextNode用来判断节点是否是文本节点，并且不是空的文本节点。
  Node.addGetter('isTextNode', function(self){
    return!!(self && self.nodeType == 3 && /\S/.test(self.nodeValue));
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
  Node.addGetter('afterEleSiblings', function(self){
    var elements = [];
    while((self = self.nextEleSibling) && self.isElementNode ) elements.push(self);
    return elements;

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
  // textCont用来获取节点中所有文本内容
  //chrome 支持innerText和textContent。 fireFox仅支持textContent。
  // ******************innerText 和 textContent的区别和相同点 ***********************
  // 1. textContent will return all tag's contents, including script and style, 
  // but innerText will not!
  // 2. textContent will return 'dispaly: none' element's content, but innerText
  // will not!
  // 3. both of the two property will not return this comments.
  Node.addGetter('textCont', function(self){
    return self.textContent || self.innerText || _getTextContent(self);
  });
  //_getTextContentf返回node的所有文本，包括隐藏元素，和textContent相同
  function _getTextContent($element){
    var content = '';
    Array.prototype.forEach.call($element.childNodes, function(e){
      if(e.isTextNode) content += e.nodeValue;
      // nodeType === 11, FRAGMENT_NODE
      else if(e.isElementNode || e.nodeType === 11) content += _getTextContent(e);
    });
    return content;
  }
 // ---------------------获取DOM元素常用函数结束---------------------------
 //返回cherry主函数。
  return cherry;
})(document);









