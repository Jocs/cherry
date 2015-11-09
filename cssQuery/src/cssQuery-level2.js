/*
	cssQuery, version 2.0.2 (2005-08-19)
	Copyright: 2004-2005, Dean Edwards (http://dean.edwards.name/)
	License: http://creativecommons.org/licenses/LGPL/2.1/
*/

cssQuery.addModule("css-level2", function() {

// -----------------------------------------------------------------------
// selectors
// -----------------------------------------------------------------------

// child selector
selectors[">"] = function($results, $from, $tagName, $namespace) {
	var $element, i, j;
	for (i = 0; i < $from.length; i++) {
		var $subset = childElements($from[i]);
		for (j = 0; ($element = $subset[j]); j++)
			if (compareTagName($element, $tagName, $namespace))
				$results.push($element);
	}
};

// sibling selector
selectors["+"] = function($results, $from, $tagName, $namespace) {
	for (var i = 0; i < $from.length; i++) {
		var $element = nextElementSibling($from[i]);
		if ($element && compareTagName($element, $tagName, $namespace))
			$results.push($element);
	}
};

// attribute selector
selectors["@"] = function($results, $from, $attributeSelectorID) {
	var $test = attributeSelectors[$attributeSelectorID].test;
	var $element, i;
	for (i = 0; ($element = $from[i]); i++)
		if ($test($element)) $results.push($element);
};

// -----------------------------------------------------------------------
// pseudo-classes
// -----------------------------------------------------------------------
// 如果某元素前面没有元素节点，就说明它是父节点元素的第一个子元素，也就是「first-child」
pseudoClasses["first-child"] = function($element) {
	return !previousElementSibling($element);
};
//为啥还要检查其parentNode呢？
pseudoClasses["lang"] = function($element, $code) {
	$code = new RegExp("^" + $code, "i");
	while ($element && !$element.getAttribute("lang")) $element = $element.parentNode;
	return $element && $code.test($element.getAttribute("lang"));
};

// -----------------------------------------------------------------------
//  attribute selectors
// -----------------------------------------------------------------------

// constants
//  eval('/\\:/g') => /\:/g

AttributeSelector.NS_IE = /\\:/g;
AttributeSelector.PREFIX = "@";
// properties
AttributeSelector.tests = {};
// methods
/*这儿使用replace这个名字挺混乱的，如果使用getAttrId是否更好呢？*/
AttributeSelector.replace = function($match, $attribute, $namespace, $compare, $value) {
	var $key = this.PREFIX + $match;
	if (!attributeSelectors[$key]) {
		$attribute = this.create($attribute, $compare || "", $value || "");
		// store the selector
		attributeSelectors[$key] = $attribute;
		attributeSelectors.push($attribute);
	}
	return attributeSelectors[$key].id;
};
AttributeSelector.parse = function($selector) {
	/*进行替换的原因：因为命名空间中也有「：」如http://www.w3.org/1999/xlink*/
	$selector = $selector.replace(this.NS_IE, "|");
	var $match;
	while ($match = $selector.match(this.match)) { 
	    //match方法：首先这是字符串的方法，如果传入参数的
		// 正则表达式有「g」标识符，那么久返回所有的匹配项，若果没有g标识符，那么返回第一个匹配项，匹配的索引
		// 所需匹配的字符串。 
		/*      不带nameSpace的事例    */
		/*		> '[lang |= "en"]'.match(/\[([\w-]+(\|[\w-]+)?)\s*(\W?=)?\s*([^\]]*)\]/);
		*		[ '[lang |= "en"]',
		*		  'lang',
		*		  undefined,
		*		  '|=',
		*		  '"en"',
		*		  index: 0,
		*		  input: '[lang |= "en"]' ]
		*       带nameSpace的属性事例
		* '[xml|xlink="http://www.w3.org/1999/xlink"]'.match(/\[([\w-]+(\|[\w-]+)?)\s*(\W?=)?\s*([^\]]*)\]/);
		*	[ '[xml|xlink="http://www.w3.org/1999/xlink"]',
		*	  'xml|xlink',
		*	  '|xlink',
		*	  '=',
		*	  '"http://www.w3.org/1999/xlink"',
		*	  index: 0,
		*	  input: '[xml|xlink="http://www.w3.org/1999/xlink"]' ]
		*/
		var $replace = this.replace($match[0], $match[1], $match[2], $match[3], $match[4]);
		$selector = $selector.replace(this.match, $replace);
	}
	return $selector;
};
AttributeSelector.create = function($propertyName, $test, $value) {
	var $attributeSelector = {};
	$attributeSelector.id = this.PREFIX + attributeSelectors.length;
	$attributeSelector.name = $propertyName;
	$test = this.tests[$test];
	$test = $test ? $test(this.getAttribute($propertyName), getText($value)) : false;
	$attributeSelector.test = new Function("e", "return " + $test);
	return $attributeSelector;
};
AttributeSelector.getAttribute = function($name) {
	switch ($name.toLowerCase()) {
		case "id":
			return "e.id";
		case "class":
			return "e.className";
		case "for":
			return "e.htmlFor";
		case "href":
			if (isMSIE) {
				// IE always returns the full path not the fragment in the href attribute
				//  so we RegExp it out of outerHTML. Opera does the same thing but there
				//  is no way to get the original attribute.
				return "String((e.outerHTML.match(/href=\\x22?([^\\s\\x22]*)\\x22?/)||[])[1]||'')";
			}
	}
	return "e.getAttribute('" + $name.replace($NAMESPACE, ":") + "')";
};

// -----------------------------------------------------------------------
//  attribute selector tests
// -----------------------------------------------------------------------

AttributeSelector.tests[""] = function($attribute) {
	return $attribute;
};

AttributeSelector.tests["="] = function($attribute, $value) {
	return $attribute + "==" + Quote.add($value);
};

AttributeSelector.tests["~="] = function($attribute, $value) {
	return "/(^| )" + regEscape($value) + "( |$)/.test(" + $attribute + ")";
};

AttributeSelector.tests["|="] = function($attribute, $value) {
	return "/^" + regEscape($value) + "(-|$)/.test(" + $attribute + ")";
};

// -----------------------------------------------------------------------
//  parsing
// -----------------------------------------------------------------------

// override parseSelector to parse out attribute selectors
// monkey-patch method
var _parseSelector = parseSelector;
parseSelector = function($selector) {
	return _parseSelector(AttributeSelector.parse($selector));
};

}); // addModule
