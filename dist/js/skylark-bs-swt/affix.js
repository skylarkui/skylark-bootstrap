/**
 * skylark-bs-swt - The skylark bootstrap standard widget tookit
 * @author Hudaokeji, Inc.
 * @version v0.9.0-beta
 * @link https://github.com/skylarkui/skylark-bs-swt/
 * @license MIT
 */
define(["skylark-utils/browser","skylark-utils/langx","skylark-utils/eventer","skylark-utils/query"],function(t,i,e,o){"use strict";function n(t){return this.each(function(){var i=o(this),e=i.data("bs.affix"),n="object"==typeof t&&t;e||i.data("bs.affix",e=new s(this,n)),"string"==typeof t&&e[t]()})}var s=function(t,e){this.options=i.mixin({},s.DEFAULTS,e),this.$target=o(this.options.target).on("scroll.bs.affix.data-api",i.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",i.proxy(this.checkPositionWithEventLoop,this)),this.$element=o(t),this.affixed=null,this.unpin=null,this.pinnedOffset=null,this.checkPosition()};s.VERSION="3.3.7",s.RESET="affix affix-top affix-bottom",s.DEFAULTS={offset:0,target:window},s.prototype.getState=function(t,i,e,o){var n=this.$target.scrollTop(),s=this.$element.offset(),f=this.$target.height();if(null!=e&&"top"==this.affixed)return n<e&&"top";if("bottom"==this.affixed)return null!=e?!(n+this.unpin<=s.top)&&"bottom":!(n+f<=t-o)&&"bottom";var a=null==this.affixed,h=a?n:s.top,r=a?f:i;return null!=e&&n<=e?"top":null!=o&&h+r>=t-o&&"bottom"},s.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(s.RESET).addClass("affix");var t=this.$target.scrollTop(),i=this.$element.offset();return this.pinnedOffset=i.top-t},s.prototype.checkPositionWithEventLoop=function(){setTimeout(i.proxy(this.checkPosition,this),1)},s.prototype.checkPosition=function(){if(this.$element.is(":visible")){var t=this.$element.height(),i=this.options.offset,n=i.top,f=i.bottom,a=Math.max(o(document).height(),o(document.body).height());"object"!=typeof i&&(f=n=i),"function"==typeof n&&(n=i.top(this.$element)),"function"==typeof f&&(f=i.bottom(this.$element));var h=this.getState(a,t,n,f);if(this.affixed!=h){null!=this.unpin&&this.$element.css("top","");var r="affix"+(h?"-"+h:""),l=e.create(r+".bs.affix");if(this.$element.trigger(l),l.isDefaultPrevented())return;this.affixed=h,this.unpin="bottom"==h?this.getPinnedOffset():null,this.$element.removeClass(s.RESET).addClass(r).trigger(r.replace("affix","affixed")+".bs.affix")}"bottom"==h&&this.$element.offset({top:a-t-f})}};var f=o.fn.affix;o.fn.affix=n,o.fn.affix.Constructor=s,o.fn.affix.noConflict=function(){return o.fn.affix=f,this}});
//# sourceMappingURL=sourcemaps/affix.js.map
