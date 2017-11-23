/**
 * skylark-bs-swt - The skylark bootstrap standard widget tookit
 * @author Hudaokeji, Inc.
 * @version v0.9.0-beta
 * @link https://github.com/skylarkui/skylark-bs-swt/
 * @license MIT
 */
define(["skylark-utils/langx","skylark-utils/browser","skylark-utils/eventer","skylark-utils/noder","skylark-utils/geom","skylark-utils/query"],function(t,e,i,a,o,r){var s=r.fn.radio,d=function(t){window&&window.console&&window.console.error&&window.console.error(t)},n=function(e,i){if(this.options=t.mixin({},r.fn.radio.defaults,i),"label"!==e.tagName.toLowerCase())return void d("Radio must be initialized on the `label` that wraps the `input` element. See https://github.com/ExactTarget/fuelux/blob/master/reference/markup/radio.html for example of proper markup. Call `.radio()` on the `<label>` not the `<input>`");this.$label=r(e),this.$radio=this.$label.find('input[type="radio"]'),this.groupName=this.$radio.attr("name"),!this.options.ignoreVisibilityCheck&&this.$radio.css("visibility").match(/hidden|collapse/)&&d("For accessibility reasons, in order for tab and space to function on radio, `visibility` must not be set to `hidden` or `collapse`. See https://github.com/ExactTarget/fuelux/pull/1996 for more details.");var a=this.$radio.attr("data-toggle");this.$toggleContainer=r(a),this.$radio.on("change",r.proxy(this.itemchecked,this)),this.setInitialState()};n.prototype={constructor:n,setInitialState:function(){var t=this.$radio,e=t.prop("checked"),i=t.prop("disabled");this.setCheckedState(t,e),this.setDisabledState(t,i)},resetGroup:function(){var t=r('input[name="'+this.groupName+'"]');t.each(function(t,e){var i=r(e),a=i.parent(),o=i.attr("data-toggle"),s=r(o);a.removeClass("checked"),s.addClass("hidden")})},setCheckedState:function(t,e){var i=t,a=i.parent(),o=i.attr("data-toggle"),s=r(o);e?(this.resetGroup(),i.prop("checked",!0),a.addClass("checked"),s.removeClass("hide hidden"),a.trigger("checked.fu.radio")):(i.prop("checked",!1),a.removeClass("checked"),s.addClass("hidden"),a.trigger("unchecked.fu.radio")),a.trigger("changed.fu.radio",e)},setDisabledState:function(t,e){var i=r(t),a=this.$label;return e?(i.prop("disabled",!0),a.addClass("disabled"),a.trigger("disabled.fu.radio")):(i.prop("disabled",!1),a.removeClass("disabled"),a.trigger("enabled.fu.radio")),i},itemchecked:function(t){var e=r(t.target);this.setCheckedState(e,!0)},check:function(){this.setCheckedState(this.$radio,!0)},uncheck:function(){this.setCheckedState(this.$radio,!1)},isChecked:function(){var t=this.$radio.prop("checked");return t},enable:function(){this.setDisabledState(this.$radio,!1)},disable:function(){this.setDisabledState(this.$radio,!0)},destroy:function(){return this.$label.remove(),this.$label[0].outerHTML}},n.prototype.getValue=n.prototype.isChecked,r.fn.radio=function(t){var e,i=Array.prototype.slice.call(arguments,1),a=this.each(function(){var a=r(this),o=a.data("fu.radio"),s="object"==typeof t&&t;o||a.data("fu.radio",o=new n(this,s)),"string"==typeof t&&(e=o[t].apply(o,i))});return void 0===e?a:e},r.fn.radio.defaults={ignoreVisibilityCheck:!1},r.fn.radio.Constructor=n,r.fn.radio.noConflict=function(){return r.fn.radio=s,this},r(document).on("mouseover.fu.radio.data-api","[data-initialize=radio]",function(t){var e=r(t.target);e.data("fu.radio")||e.radio(e.data())}),r(function(){r("[data-initialize=radio]").each(function(){var t=r(this);t.data("fu.radio")||t.radio(t.data())})})});
//# sourceMappingURL=sourcemaps/radio.js.map
