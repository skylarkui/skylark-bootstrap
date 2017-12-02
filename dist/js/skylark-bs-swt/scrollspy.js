/**
 * skylark-bs-swt - The skylark bootstrap standard widget tookit
 * @author Hudaokeji, Inc.
 * @version v0.9.0-beta
 * @link https://github.com/skylarkui/skylark-bs-swt/
 * @license MIT
 */
define(["skylark-utils/browser","skylark-utils/langx","skylark-utils/eventer","skylark-utils/query"],function(t,s,e,i){"use strict";function o(t,e){this.$body=i(document.body),this.$scrollElement=i(i(t).is(document.body)?window:t),this.options=s.mixin({},o.DEFAULTS,e),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",s.proxy(this.process,this)),this.refresh(),this.process()}function r(t){return this.each(function(){var s=i(this),e=s.data("bs.scrollspy"),r="object"==typeof t&&t;e||s.data("bs.scrollspy",e=new o(this,r)),"string"==typeof t&&e[t]()})}o.VERSION="3.3.7",o.DEFAULTS={offset:10},o.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},o.prototype.refresh=function(){var t=this,e="offset",o=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),s.isWindow(this.$scrollElement[0])||(e="position",o=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var t=i(this),s=t.data("target")||t.attr("href"),r=/^#./.test(s)&&i(s);return r&&r.length&&r.is(":visible")&&[[r[e]().top+o,s]]||null}).sort(function(t,s){return t[0]-s[0]}).each(function(){t.offsets.push(this[0]),t.targets.push(this[1])})},o.prototype.process=function(){var t,s=this.$scrollElement.scrollTop()+this.options.offset,e=this.getScrollHeight(),i=this.options.offset+e-this.$scrollElement.height(),o=this.offsets,r=this.targets,l=this.activeTarget;if(this.scrollHeight!=e&&this.refresh(),s>=i)return l!=(t=r[r.length-1])&&this.activate(t);if(l&&s<o[0])return this.activeTarget=null,this.clear();for(t=o.length;t--;)l!=r[t]&&s>=o[t]&&(void 0===o[t+1]||s<o[t+1])&&this.activate(r[t])},o.prototype.activate=function(t){this.activeTarget=t,this.clear();var s=this.selector+'[data-target="'+t+'"],'+this.selector+'[href="'+t+'"]',e=i(s).parents("li").addClass("active");e.parent(".dropdown-menu").length&&(e=e.closest("li.dropdown").addClass("active")),e.trigger("activate.bs.scrollspy")},o.prototype.clear=function(){i(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};var l=i.fn.scrollspy;i.fn.scrollspy=r,i.fn.scrollspy.Constructor=o,i.fn.scrollspy.noConflict=function(){return i.fn.scrollspy=l,this}});
//# sourceMappingURL=sourcemaps/scrollspy.js.map
