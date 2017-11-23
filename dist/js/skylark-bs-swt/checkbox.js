/**
 * skylark-bs-swt - The skylark bootstrap standard widget tookit
 * @author Hudaokeji, Inc.
 * @version v0.9.0-beta
 * @link https://github.com/skylarkui/skylark-bs-swt/
 * @license MIT
 */
define(["skylark-utils/langx","skylark-utils/browser","skylark-utils/eventer","skylark-utils/noder","skylark-utils/geom","skylark-utils/query"],function(e,t,i,c,o,a){var s=a.fn.checkbox,h=function(e){window&&window.console&&window.console.error&&window.console.error(e)},n=function(t,i){this.options=e.mixin({},a.fn.checkbox.defaults,i);var c=a(t);if("label"!==t.tagName.toLowerCase())return void h("Checkbox must be initialized on the `label` that wraps the `input` element. See https://github.com/ExactTarget/fuelux/blob/master/reference/markup/checkbox.html for example of proper markup. Call `.checkbox()` on the `<label>` not the `<input>`");this.$label=c,this.$chk=this.$label.find('input[type="checkbox"]'),this.$container=c.parent(".checkbox"),!this.options.ignoreVisibilityCheck&&this.$chk.css("visibility").match(/hidden|collapse/)&&h("For accessibility reasons, in order for tab and space to function on checkbox, checkbox `<input />`'s `visibility` must not be set to `hidden` or `collapse`. See https://github.com/ExactTarget/fuelux/pull/1996 for more details.");var o=this.$chk.attr("data-toggle");this.$toggleContainer=a(o),this.$chk.on("change",a.proxy(this.itemchecked,this)),this.setInitialState()};n.prototype={constructor:n,setInitialState:function(){var e=this.$chk,t=e.prop("checked"),i=e.prop("disabled");this.setCheckedState(e,t),this.setDisabledState(e,i)},setCheckedState:function(e,t){var i=e,c=this.$label,o=this.$toggleContainer;t?(i.prop("checked",!0),c.addClass("checked"),o.removeClass("hide hidden"),c.trigger("checked.fu.checkbox")):(i.prop("checked",!1),c.removeClass("checked"),o.addClass("hidden"),c.trigger("unchecked.fu.checkbox")),c.trigger("changed.fu.checkbox",t)},setDisabledState:function(e,t){var i=a(e),c=this.$label;return t?(i.prop("disabled",!0),c.addClass("disabled"),c.trigger("disabled.fu.checkbox")):(i.prop("disabled",!1),c.removeClass("disabled"),c.trigger("enabled.fu.checkbox")),i},itemchecked:function(e){var t=a(e.target),i=t.prop("checked");this.setCheckedState(t,i)},toggle:function(){var e=this.isChecked();e?this.uncheck():this.check()},check:function(){this.setCheckedState(this.$chk,!0)},uncheck:function(){this.setCheckedState(this.$chk,!1)},isChecked:function(){var e=this.$chk.prop("checked");return e},enable:function(){this.setDisabledState(this.$chk,!1)},disable:function(){this.setDisabledState(this.$chk,!0)},destroy:function(){return this.$label.remove(),this.$label[0].outerHTML}},n.prototype.getValue=n.prototype.isChecked,a.fn.checkbox=function(e){var t,i=Array.prototype.slice.call(arguments,1),c=this.each(function(){var c=a(this),o=c.data("fu.checkbox"),s="object"==typeof e&&e;o||c.data("fu.checkbox",o=new n(this,s)),"string"==typeof e&&(t=o[e].apply(o,i))});return void 0===t?c:t},a.fn.checkbox.defaults={ignoreVisibilityCheck:!1},a.fn.checkbox.Constructor=n,a.fn.checkbox.noConflict=function(){return a.fn.checkbox=s,this},a(document).on("mouseover.fu.checkbox.data-api","[data-initialize=checkbox]",function(e){var t=a(e.target);t.data("fu.checkbox")||t.checkbox(t.data())}),a(function(){a("[data-initialize=checkbox]").each(function(){var e=a(this);e.data("fu.checkbox")||e.checkbox(e.data())})})});
//# sourceMappingURL=sourcemaps/checkbox.js.map
