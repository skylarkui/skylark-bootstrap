/**
 * skylark-fuelux - A version of fuelux that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.2
 * @link https://github.com/skylarkui/skylark-fuelux/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
  	  require = globals.require,
  	  isAmd = (typeof define === 'function' && define.amd),
  	  isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");    
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                exports: null
            };
            require(id);
        } else {
            resolved[id] = factory;
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.exports) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(window, args);
        }
        return module.exports;
    };
  }

  factory(define,require);

  if (!isAmd) { 
    if (isCmd) {
      exports = require("skylark-bootstrap3/main");
    } else {
      if (!globals.skylarkjs) {
         globals.skylarkjs = require("skylark-langx/skylark");
      }

    }
  }

})(function(define,require) {

define('skylark-fuelux/sbswt',[
  "skylark-utils/skylark",
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/query",
  "skylark-utils/widgets"
],function(skylark,langx,browser,eventer,noder,geom,$,widgets){
	var ui = skylark.ui = skylark.ui || {}, 
		sbswt = ui.sbswt = {};

/*---------------------------------------------------------------------------------*/
	/*
	 * Fuel UX utilities.js
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */
	var CONST = {
		BACKSPACE_KEYCODE: 8,
		COMMA_KEYCODE: 188, // `,` & `<`
		DELETE_KEYCODE: 46,
		DOWN_ARROW_KEYCODE: 40,
		ENTER_KEYCODE: 13,
		TAB_KEYCODE: 9,
		UP_ARROW_KEYCODE: 38
	};

	var isShiftHeld = function isShiftHeld (e) { return e.shiftKey === true; };

	var isKey = function isKey (keyCode) {
		return function compareKeycodes (e) {
			return e.keyCode === keyCode;
		};
	};

	var isBackspaceKey = isKey(CONST.BACKSPACE_KEYCODE);
	var isDeleteKey = isKey(CONST.DELETE_KEYCODE);
	var isTabKey = isKey(CONST.TAB_KEYCODE);
	var isUpArrow = isKey(CONST.UP_ARROW_KEYCODE);
	var isDownArrow = isKey(CONST.DOWN_ARROW_KEYCODE);

	var ENCODED_REGEX = /&[^\s]*;/;
	/*
	 * to prevent double encoding decodes content in loop until content is encoding free
	 */
	var cleanInput = function cleanInput (questionableMarkup) {
		// check for encoding and decode
		while (ENCODED_REGEX.test(questionableMarkup)) {
			questionableMarkup = $('<i>').html(questionableMarkup).text();
		}

		// string completely decoded now encode it
		return $('<i>').text(questionableMarkup).html();
	};




	langx.mixin(sbswt, {
		CONST: CONST,
		cleanInput: cleanInput,
		isBackspaceKey: isBackspaceKey,
		isDeleteKey: isDeleteKey,
		isShiftHeld: isShiftHeld,
		isTabKey: isTabKey,
		isUpArrow: isUpArrow,
		isDownArrow: isDownArrow
	});

/*---------------------------------------------------------------------------------*/

	var WidgetBase = widgets.Widget.inherit({
        klassName: "WidgetBase",
    });


	langx.mixin(sbswt, {
		WidgetBase : WidgetBase
	});

	return sbswt;
});

define('skylark-fuelux/checkbox',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){


	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	var old = $.fn.checkbox;

	// CHECKBOX CONSTRUCTOR AND PROTOTYPE

	var logError = function logError (error) {
		if (window && window.console && window.console.error) {
			window.console.error(error);
		}
	};


	var Checkbox = sbswt.Checkbox = sbswt.WidgetBase.inherit({
		klassName: "Checkbox",

		init : function(element,options) {
			this.options = langx.mixin({}, $.fn.checkbox.defaults, options);
			var $element = $(element);

			if (element.tagName.toLowerCase() !== 'label') {
				logError('Checkbox must be initialized on the `label` that wraps the `input` element. See https://github.com/ExactTarget/fuelux/blob/master/reference/markup/checkbox.html for example of proper markup. Call `.checkbox()` on the `<label>` not the `<input>`');
				return;
			}

			// cache elements
			this.$label = $element;
			this.$chk = this.$label.find('input[type="checkbox"]');
			this.$container = $element.parent('.checkbox'); // the container div

			if (!this.options.ignoreVisibilityCheck && this.$chk.css('visibility').match(/hidden|collapse/)) {
				logError('For accessibility reasons, in order for tab and space to function on checkbox, checkbox `<input />`\'s `visibility` must not be set to `hidden` or `collapse`. See https://github.com/ExactTarget/fuelux/pull/1996 for more details.');
			}

			// determine if a toggle container is specified
			var containerSelector = this.$chk.attr('data-toggle');
			this.$toggleContainer = $(containerSelector);

			// handle internal events
			this.$chk.on('change', langx.proxy(this.itemchecked, this));

			// set default state
			this.setInitialState();
		},

		setInitialState: function setInitialState () {
			var $chk = this.$chk;

			// get current state of input
			var checked = $chk.prop('checked');
			var disabled = $chk.prop('disabled');

			// sync label class with input state
			this.setCheckedState($chk, checked);
			this.setDisabledState($chk, disabled);
		},

		setCheckedState: function setCheckedState (element, checked) {
			var $chk = element;
			var $lbl = this.$label;
			var $containerToggle = this.$toggleContainer;

			if (checked) {
				$chk.prop('checked', true);
				$lbl.addClass('checked');
				$containerToggle.removeClass('hide hidden');
				$lbl.trigger('checked.fu.checkbox');
			} else {
				$chk.prop('checked', false);
				$lbl.removeClass('checked');
				$containerToggle.addClass('hidden');
				$lbl.trigger('unchecked.fu.checkbox');
			}

			$lbl.trigger('changed.fu.checkbox', checked);
		},

		setDisabledState: function setDisabledState (element, disabled) {
			var $chk = $(element);
			var $lbl = this.$label;

			if (disabled) {
				$chk.prop('disabled', true);
				$lbl.addClass('disabled');
				$lbl.trigger('disabled.fu.checkbox');
			} else {
				$chk.prop('disabled', false);
				$lbl.removeClass('disabled');
				$lbl.trigger('enabled.fu.checkbox');
			}

			return $chk;
		},

		itemchecked: function itemchecked (evt) {
			var $chk = $(evt.target);
			var checked = $chk.prop('checked');

			this.setCheckedState($chk, checked);
		},

		toggle: function toggle () {
			var checked = this.isChecked();

			if (checked) {
				this.uncheck();
			} else {
				this.check();
			}
		},

		check: function check () {
			this.setCheckedState(this.$chk, true);
		},

		uncheck: function uncheck () {
			this.setCheckedState(this.$chk, false);
		},

		isChecked: function isChecked () {
			var checked = this.$chk.prop('checked');
			return checked;
		},

		enable: function enable () {
			this.setDisabledState(this.$chk, false);
		},

		disable: function disable () {
			this.setDisabledState(this.$chk, true);
		},

		destroy: function destroy () {
			this.$label.remove();
			return this.$label[0].outerHTML;
		}
	});



	Checkbox.prototype.getValue = Checkbox.prototype.isChecked;

	// CHECKBOX PLUGIN DEFINITION

	$.fn.checkbox = function checkbox (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function applyData () {
			var $this = $(this);
			var data = $this.data('fu.checkbox');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.checkbox', (data = new Checkbox(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.checkbox.defaults = {
		ignoreVisibilityCheck: false
	};

	$.fn.checkbox.Constructor = Checkbox;

	$.fn.checkbox.noConflict = function noConflict () {
		$.fn.checkbox = old;
		return this;
	};

	// DATA-API

	/*
	$(document).on('mouseover.fu.checkbox.data-api', '[data-initialize=checkbox]', function initializeCheckboxes (e) {
		var $control = $(e.target);
		if (!$control.data('fu.checkbox')) {
			$control.checkbox($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function onReadyInitializeCheckboxes () {
		$('[data-initialize=checkbox]').each(function initializeCheckbox () {
			var $this = $(this);
			if (!$this.data('fu.checkbox')) {
				$this.checkbox($this.data());
			}
		});
	});
	*/

	return $.fn.checkbox;
});

define('skylark-fuelux/combobox',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){


	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	var old = $.fn.combobox;


	// COMBOBOX CONSTRUCTOR AND PROTOTYPE

	var Combobox = sbswt.Combobox = sbswt.WidgetBase.inherit({
		klassName: "Combobox",

		init : function(element,options) {
			this.$element = $(element);
			this.options = langx.mixin({}, $.fn.combobox.defaults, options);

			this.$dropMenu = this.$element.find('.dropdown-menu');
			this.$input = this.$element.find('input');
			this.$button = this.$element.find('.btn');
			this.$button.dropdown();
			this.$inputGroupBtn = this.$element.find('.input-group-btn');

			this.$element.on('click.fu.combobox', 'a', langx.proxy(this.itemclicked, this));
			this.$element.on('change.fu.combobox', 'input', langx.proxy(this.inputchanged, this));
			this.$element.on('shown.bs.dropdown', langx.proxy(this.menuShown, this));
			this.$input.on('keyup.fu.combobox', langx.proxy(this.keypress, this));

			// set default selection
			this.setDefaultSelection();

			// if dropdown is empty, disable it
			var items = this.$dropMenu.children('li');
			if( items.length === 0) {
				this.$button.addClass('disabled');
			}

			// filter on load in case the first thing they do is press navigational key to pop open the menu
			if (this.options.filterOnKeypress) {
				this.options.filter(this.$dropMenu.find('li'), this.$input.val(), this);
			}
		},

		destroy: function () {
			this.$element.remove();
			// remove any external bindings
			// [none]

			// set input value attrbute in markup
			this.$element.find('input').each(function () {
				$(this).attr('value', $(this).val());
			});

			// empty elements to return to original markup
			// [none]

			return this.$element[0].outerHTML;
		},

		doSelect: function ($item) {

			if (typeof $item[0] !== 'undefined') {
				// remove selection from old item, may result in remove and
				// re-addition of class if item is the same
				this.$element.find('li.selected:first').removeClass('selected');

				// add selection to new item
				this.$selectedItem = $item;
				this.$selectedItem.addClass('selected');

				// update input
				this.$input.val(this.$selectedItem.text().trim());
			} else {
				// this is a custom input, not in the menu
				this.$selectedItem = null;
				this.$element.find('li.selected:first').removeClass('selected');
			}
		},

		clearSelection: function () {
			this.$selectedItem = null;
			this.$input.val('');
			this.$dropMenu.find('li').removeClass('selected');
		},

		menuShown: function () {
			if (this.options.autoResizeMenu) {
				this.resizeMenu();
			}
		},

		resizeMenu: function () {
			var width = this.$element.outerWidth();
			this.$dropMenu.outerWidth(width);
		},

		selectedItem: function () {
			var item = this.$selectedItem;
			var data = {};

			if (item) {
				var txt = this.$selectedItem.text().trim();
				data = langx.mixin({
					text: txt
				}, this.$selectedItem.data());
			} else {
				data = {
					text: this.$input.val().trim(),
					notFound: true
				};
			}

			return data;
		},

		selectByText: function (text) {
			var $item = $([]);
			this.$element.find('li').each(function () {
				if ((this.textContent || this.innerText || $(this).text() || '').trim().toLowerCase() === (text || '').trim().toLowerCase()) {
					$item = $(this);
					return false;
				}
			});

			this.doSelect($item);
		},

		selectByValue: function (value) {
			var selector = 'li[data-value="' + value + '"]';
			this.selectBySelector(selector);
		},

		selectByIndex: function (index) {
			// zero-based index
			var selector = 'li:eq(' + index + ')';
			this.selectBySelector(selector);
		},

		selectBySelector: function (selector) {
			var $item = this.$element.find(selector);
			this.doSelect($item);
		},

		setDefaultSelection: function () {
			var selector = 'li[data-selected=true]:first';
			var item = this.$element.find(selector);

			if (item.length > 0) {
				// select by data-attribute
				this.selectBySelector(selector);
				item.removeData('selected');
				item.removeAttr('data-selected');
			}
		},

		enable: function () {
			this.$element.removeClass('disabled');
			this.$input.removeAttr('disabled');
			this.$button.removeClass('disabled');
		},

		disable: function () {
			this.$element.addClass('disabled');
			this.$input.attr('disabled', true);
			this.$button.addClass('disabled');
		},

		itemclicked: function (e) {
			this.$selectedItem = $(e.target).parent();

			// set input text and trigger input change event marked as synthetic
			this.$input.val(this.$selectedItem.text().trim()).trigger('change', {
				synthetic: true
			});

			// pass object including text and any data-attributes
			// to onchange event
			var data = this.selectedItem();

			// trigger changed event
			this.$element.trigger('changed.fu.combobox', data);

			e.preventDefault();

			// return focus to control after selecting an option
			this.$element.find('.dropdown-toggle').focus();
		},

		keypress: function (e) {
			var ENTER = 13;
			//var TAB = 9;
			var ESC = 27;
			var LEFT = 37;
			var UP = 38;
			var RIGHT = 39;
			var DOWN = 40;

			var IS_NAVIGATIONAL = (
				e.which === UP ||
				e.which === DOWN ||
				e.which === LEFT ||
				e.which === RIGHT
			);

			if(this.options.showOptionsOnKeypress && !this.$inputGroupBtn.hasClass('open')){
				this.$button.dropdown('toggle');
				this.$input.focus();
			}

			if (e.which === ENTER) {
				e.preventDefault();

				var selected = this.$dropMenu.find('li.selected').text().trim();
				if(selected.length > 0){
					this.selectByText(selected);
				}else{
					this.selectByText(this.$input.val());
				}

				this.$inputGroupBtn.removeClass('open');
			} else if (e.which === ESC) {
				e.preventDefault();
				this.clearSelection();
				this.$inputGroupBtn.removeClass('open');
			} else if (this.options.showOptionsOnKeypress) {
				if (e.which === DOWN || e.which === UP) {
					e.preventDefault();
					var $selected = this.$dropMenu.find('li.selected');
					if ($selected.length > 0) {
						if (e.which === DOWN) {
							$selected = $selected.next(':not(.hidden)');
						} else {
							$selected = $selected.prev(':not(.hidden)');
						}
					}

					if ($selected.length === 0){
						if (e.which === DOWN) {
							$selected = this.$dropMenu.find('li:not(.hidden):first');
						} else {
							$selected = this.$dropMenu.find('li:not(.hidden):last');
						}
					}
					this.doSelect($selected);
				}
			}

			// Avoid filtering on navigation key presses
			if (this.options.filterOnKeypress && !IS_NAVIGATIONAL) {
				this.options.filter(this.$dropMenu.find('li'), this.$input.val(), this);
			}

			this.previousKeyPress = e.which;
		},

		inputchanged: function (e, extra) {
			var val = $(e.target).val();
			// skip processing for internally-generated synthetic event
			// to avoid double processing
			if (extra && extra.synthetic) {
				this.selectByText(val);
				return;
			}
			this.selectByText(val);

			// find match based on input
			// if no match, pass the input value
			var data = this.selectedItem();
			if (data.text.length === 0) {
				data = {
					text: val
				};
			}

			// trigger changed event
			this.$element.trigger('changed.fu.combobox', data);
		}

	});



	Combobox.prototype.getValue = Combobox.prototype.selectedItem;

	// COMBOBOX PLUGIN DEFINITION

	$.fn.combobox = function (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.combobox');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.combobox', (data = new Combobox(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.combobox.defaults = {

		autoResizeMenu: true,
		filterOnKeypress: false,
		showOptionsOnKeypress: false,
		filter: function filter (list, predicate, self) {
			var visible = 0;
			self.$dropMenu.find('.empty-indicator').remove();

			list.each(function (i) {
				var $li = $(this);
				var text = $(this).text().trim();

				$li.removeClass();

				if (text === predicate) {
					$li.addClass('text-success');
					visible++;
				} else if (text.substr(0, predicate.length) === predicate) {
					$li.addClass('text-info');
					visible++;
				} else {
					$li.addClass('hidden');
				}
			});

			if (visible === 0) {
				self.$dropMenu.append('<li class="empty-indicator text-muted"><em>No Matches</em></li>');
			}
		}
	};

	$.fn.combobox.Constructor =  Combobox;

	$.fn.combobox.noConflict = function () {
		$.fn.combobox = old;
		return this;
	};

	// DATA-API

	/*

	$(document).on('mousedown.fu.combobox.data-api', '[data-initialize=combobox]', function (e) {
		var $control = $(e.target).closest('.combobox');
		if (!$control.data('fu.combobox')) {
			$control.combobox($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function () {
		$('[data-initialize=combobox]').each(function () {
			var $this = $(this);
			if (!$this.data('fu.combobox')) {
				$this.combobox($this.data());
			}
		});
	});
	*/

	return $.fn.combobox;
});

define('skylark-fuelux/datepicker',[
    "skylark-utils/langx",
    "skylark-utils/browser",
    "skylark-utils/eventer",
    "skylark-utils/noder",
    "skylark-utils/geom",
    "skylark-utils/velm",
    "skylark-utils/query",
    "./sbswt"
], function(langx, browser, eventer, noder, geom, velm, $, sbswt) {


    /*
     * Fuel UX Checkbox
     * https://github.com/ExactTarget/fuelux
     *
     * Copyright (c) 2014 ExactTarget
     * Licensed under the BSD New license.
     */

    var INVALID_DATE = 'Invalid Date';
    var MOMENT_NOT_AVAILABLE = 'moment.js is not available so you cannot use this function';

    var datepickerStack = [];
    var moment = false;
    var old = $.fn.datepicker;
    var requestedMoment = false;

    var runStack = function() {
        var i, l;
        requestedMoment = true;
        for (i = 0, l = datepickerStack.length; i < l; i++) {
            datepickerStack[i].init.call(datepickerStack[i].scope);
        }
        datepickerStack = [];
    };

    /*
    	//only load moment if it's there. otherwise we'll look for it in window.moment
    	if (typeof define === 'function' && define.amd) {//check if AMD is available
    		require(['moment'], function (amdMoment) {
    			moment = amdMoment;
    			runStack();
    		}, function (err) {
    				var failedId = err.requireModules && err.requireModules[0];
    				if (failedId === 'moment') {
    					runStack();
    				}
    			});
    	} else {
    		runStack();
    	}
    */
    // DATEPICKER CONSTRUCTOR AND PROTOTYPE

    var Datepicker = sbswt.Datepicker = sbswt.WidgetBase.inherit({
        klassName: "Datepicker",

        init: function(element, options) {
            this.$element = $(element);
            this.options = langx.mixin({}, $.fn.datepicker.defaults, options);

            this.$calendar = this.$element.find('.datepicker-calendar');
            this.$days = this.$calendar.find('.datepicker-calendar-days');
            this.$header = this.$calendar.find('.datepicker-calendar-header');
            this.$headerTitle = this.$header.find('.title');
            this.$input = this.$element.find('input');
            this.$inputGroupBtn = this.$element.find('.input-group-btn');
            this.$wheels = this.$element.find('.datepicker-wheels');
            this.$wheelsMonth = this.$element.find('.datepicker-wheels-month');
            this.$wheelsYear = this.$element.find('.datepicker-wheels-year');
            this.$dropdown = this.$element.find('[data-toggle="dropdown"]');
            this.$dropdown.dropdown();

            this.artificialScrolling = false;
            this.formatDate = this.options.formatDate || this.formatDate;
            this.inputValue = null;
            this.moment = false;
            this.momentFormat = null;
            this.parseDate = this.options.parseDate || this.parseDate;
            this.preventBlurHide = false;
            this.restricted = this.options.restricted || [];
            this.restrictedParsed = [];
            this.restrictedText = this.options.restrictedText;
            this.sameYearOnly = this.options.sameYearOnly;
            this.selectedDate = null;
            this.yearRestriction = null;

            this.$calendar.find('.datepicker-today').on('click.fu.datepicker', langx.proxy(this.todayClicked, this));
            this.$days.on('click.fu.datepicker', 'tr td button', langx.proxy(this.dateClicked, this));
            this.$header.find('.next').on('click.fu.datepicker', langx.proxy(this.next, this));
            this.$header.find('.prev').on('click.fu.datepicker', langx.proxy(this.prev, this));
            this.$headerTitle.on('click.fu.datepicker', langx.proxy(this.titleClicked, this));
            this.$input.on('change.fu.datepicker', langx.proxy(this.inputChanged, this));
            this.$input.on('mousedown.fu.datepicker', langx.proxy(this.showDropdown, this));
            this.$inputGroupBtn.on('hidden.bs.dropdown', langx.proxy(this.hide, this));
            this.$inputGroupBtn.on('shown.bs.dropdown', langx.proxy(this.show, this));
            this.$wheels.find('.datepicker-wheels-back').on('click.fu.datepicker', langx.proxy(this.backClicked, this));
            this.$wheels.find('.datepicker-wheels-select').on('click.fu.datepicker', langx.proxy(this.selectClicked, this));
            this.$wheelsMonth.on('click.fu.datepicker', 'ul button', langx.proxy(this.monthClicked, this));
            this.$wheelsYear.on('click.fu.datepicker', 'ul button', langx.proxy(this.yearClicked, this));
            this.$wheelsYear.find('ul').on('scroll.fu.datepicker', langx.proxy(this.onYearScroll, this));

            this.$element.on('click.fu.datepicker.data-api', '.datepicker input', function(e) {
                e.stopPropagation();
            });

            this.$element.on('click.fu.datepicker.data-api', '.datepicker .dropdown-menu', function(e) {
                var $target = $(e.target);
                if (!$target.is('.datepicker-date') || $target.closest('.restricted').length) {
                    e.stopPropagation();
                }
            });

            var init = function() {
                if (this.checkForMomentJS()) {
                    moment = moment || window.moment; // need to pull in the global moment if they didn't do it via require
                    this.moment = true;
                    this.momentFormat = this.options.momentConfig.format;
                    this.setCulture(this.options.momentConfig.culture);

                    // support moment with lang (< v2.8) or locale
                    moment.locale = moment.locale || moment.lang;
                }

                this.setRestrictedDates(this.restricted);
                if (!this.setDate(this.options.date)) {
                    this.$input.val('');
                    this.inputValue = this.$input.val();
                }

                if (this.sameYearOnly) {
                    this.yearRestriction = (this.selectedDate) ? this.selectedDate.getFullYear() : new Date().getFullYear();
                }
            };

            if (requestedMoment) {
                init.call(this);
            } else {
                datepickerStack.push({
                    init: init,
                    scope: this
                });
            }
        },

        backClicked: function() {
            this.changeView('calendar');
        },

        changeView: function(view, date) {
            if (view === 'wheels') {
                this.$calendar.hide().attr('aria-hidden', 'true');
                this.$wheels.show().removeAttr('aria-hidden', '');
                if (date) {
                    this.renderWheel(date);
                }

            } else {
                this.$wheels.hide().attr('aria-hidden', 'true');
                this.$calendar.show().removeAttr('aria-hidden', '');
                if (date) {
                    this.renderMonth(date);
                }

            }
        },

        checkForMomentJS: function() {
            if (
                ($.isFunction(window.moment) || (typeof moment !== 'undefined' && $.isFunction(moment))) &&
                $.isPlainObject(this.options.momentConfig) &&
                (typeof this.options.momentConfig.culture === 'string' && typeof this.options.momentConfig.format === 'string')
            ) {
                return true;
            } else {
                return false;
            }
        },

        dateClicked: function(e) {
            var $td = $(e.currentTarget).parents('td').first();
            var date;

            if ($td.hasClass('restricted')) {
                return;
            }

            this.$days.find('td.selected').removeClass('selected');
            $td.addClass('selected');

            date = new Date($td.attr('data-year'), $td.attr('data-month'), $td.attr('data-date'));
            this.selectedDate = date;
            this.$input.val(this.formatDate(date));
            this.inputValue = this.$input.val();
            this.hide();
            this.$input.focus();
            this.$element.trigger('dateClicked.fu.datepicker', date);
        },

        destroy: function() {
            this.$element.remove();
            // any external bindings
            // [none]

            // empty elements to return to original markup
            this.$days.find('tbody').empty();
            this.$wheelsYear.find('ul').empty();

            return this.$element[0].outerHTML;
        },

        disable: function() {
            this.$element.addClass('disabled');
            this.$element.find('input, button').attr('disabled', 'disabled');
            this.$inputGroupBtn.removeClass('open');
        },

        enable: function() {
            this.$element.removeClass('disabled');
            this.$element.find('input, button').removeAttr('disabled');
        },

        formatDate: function(date) {
            var padTwo = function(value) {
                var s = '0' + value;
                return s.substr(s.length - 2);
            };

            if (this.moment) {
                return moment(date).format(this.momentFormat);
            } else {
                return padTwo(date.getMonth() + 1) + '/' + padTwo(date.getDate()) + '/' + date.getFullYear();
            }
        },

        getCulture: function() {
            if (this.moment) {
                return moment.locale();
            } else {
                throw MOMENT_NOT_AVAILABLE;
            }
        },

        getDate: function() {
            return (!this.selectedDate) ? new Date(NaN) : this.selectedDate;
        },

        getFormat: function() {
            if (this.moment) {
                return this.momentFormat;
            } else {
                throw MOMENT_NOT_AVAILABLE;
            }
        },

        getFormattedDate: function() {
            return (!this.selectedDate) ? INVALID_DATE : this.formatDate(this.selectedDate);
        },

        getRestrictedDates: function() {
            return this.restricted;
        },

        inputChanged: function() {
            var inputVal = this.$input.val();
            var date;
            if (inputVal !== this.inputValue) {
                date = this.setDate(inputVal);
                if (date === null) {
                    this.$element.trigger('inputParsingFailed.fu.datepicker', inputVal);
                } else if (date === false) {
                    this.$element.trigger('inputRestrictedDate.fu.datepicker', date);
                } else {
                    this.$element.trigger('changed.fu.datepicker', date);
                }

            }
        },

        show: function() {
            var date = (this.selectedDate) ? this.selectedDate : new Date();
            this.changeView('calendar', date);
            this.$inputGroupBtn.addClass('open');
            this.$element.trigger('shown.fu.datepicker');
        },

        showDropdown: function(e) { //input mousedown handler, name retained for legacy support of showDropdown
            if (!this.$input.is(':focus') && !this.$inputGroupBtn.hasClass('open')) {
                this.show();
            }
        },

        hide: function() {
            this.$inputGroupBtn.removeClass('open');
            this.$element.trigger('hidden.fu.datepicker');
        },

        hideDropdown: function() { //for legacy support of hideDropdown
            this.hide();
        },

        isInvalidDate: function(date) {
            var dateString = date.toString();
            if (dateString === INVALID_DATE || dateString === 'NaN') {
                return true;
            }

            return false;
        },

        isRestricted: function(date, month, year) {
            var restricted = this.restrictedParsed;
            var i, from, l, to;

            if (this.sameYearOnly && this.yearRestriction !== null && year !== this.yearRestriction) {
                return true;
            }

            for (i = 0, l = restricted.length; i < l; i++) {
                from = restricted[i].from;
                to = restricted[i].to;
                if (
                    (year > from.year || (year === from.year && month > from.month) || (year === from.year && month === from.month && date >= from.date)) &&
                    (year < to.year || (year === to.year && month < to.month) || (year === to.year && month === to.month && date <= to.date))
                ) {
                    return true;
                }

            }

            return false;
        },

        monthClicked: function(e) {
            this.$wheelsMonth.find('.selected').removeClass('selected');
            $(e.currentTarget).parent().addClass('selected');
        },

        next: function() {
            var month = this.$headerTitle.attr('data-month');
            var year = this.$headerTitle.attr('data-year');
            month++;
            if (month > 11) {
                if (this.sameYearOnly) {
                    return;
                }

                month = 0;
                year++;
            }

            this.renderMonth(new Date(year, month, 1));
        },

        onYearScroll: function(e) {
            if (this.artificialScrolling) {
                return;
            }

            var $yearUl = $(e.currentTarget);
            var height = ($yearUl.css('box-sizing') === 'border-box') ? $yearUl.outerHeight() : $yearUl.height();
            var scrollHeight = $yearUl.get(0).scrollHeight;
            var scrollTop = $yearUl.scrollTop();
            var bottomPercentage = (height / (scrollHeight - scrollTop)) * 100;
            var topPercentage = (scrollTop / scrollHeight) * 100;
            var i, start;

            if (topPercentage < 5) {
                start = parseInt($yearUl.find('li:first').attr('data-year'), 10);
                for (i = (start - 1); i > (start - 11); i--) {
                    $yearUl.prepend('<li data-year="' + i + '"><button type="button">' + i + '</button></li>');
                }
                this.artificialScrolling = true;
                $yearUl.scrollTop(($yearUl.get(0).scrollHeight - scrollHeight) + scrollTop);
                this.artificialScrolling = false;
            } else if (bottomPercentage > 90) {
                start = parseInt($yearUl.find('li:last').attr('data-year'), 10);
                for (i = (start + 1); i < (start + 11); i++) {
                    $yearUl.append('<li data-year="' + i + '"><button type="button">' + i + '</button></li>');
                }
            }
        },

        //some code ripped from http://stackoverflow.com/questions/2182246/javascript-dates-in-ie-nan-firefox-chrome-ok
        parseDate: function(date) {
            var self = this;
            var BAD_DATE = new Date(NaN);
            var dt, isoExp, momentParse, momentParseWithFormat, tryMomentParseAll, month, parts, use;

            if (date) {
                if (this.moment) { //if we have moment, use that to parse the dates
                    momentParseWithFormat = function(d) {
                        var md = moment(d, self.momentFormat);
                        return (true === md.isValid()) ? md.toDate() : BAD_DATE;
                    };
                    momentParse = function(d) {
                        var md = moment(new Date(d));
                        return (true === md.isValid()) ? md.toDate() : BAD_DATE;
                    };

                    tryMomentParseAll = function(rawDateString, parseFunc1, parseFunc2) {
                        var pd = parseFunc1(rawDateString);
                        if (!self.isInvalidDate(pd)) {
                            return pd;
                        }

                        pd = parseFunc2(rawDateString);
                        if (!self.isInvalidDate(pd)) {
                            return pd;
                        }

                        return BAD_DATE;
                    };

                    if ('string' === typeof(date)) {
                        // Attempts to parse date strings using this.momentFormat, falling back on newing a date
                        return tryMomentParseAll(date, momentParseWithFormat, momentParse);
                    } else {
                        // Attempts to parse date by newing a date object directly, falling back on parsing using this.momentFormat
                        return tryMomentParseAll(date, momentParse, momentParseWithFormat);
                    }

                } else { //if moment isn't present, use previous date parsing strategy
                    if (typeof(date) === 'string') {
                        dt = new Date(Date.parse(date));
                        if (!this.isInvalidDate(dt)) {
                            return dt;
                        } else {
                            date = date.split('T')[0];
                            isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/;
                            parts = isoExp.exec(date);
                            if (parts) {
                                month = parseInt(parts[2], 10);
                                dt = new Date(parts[1], month - 1, parts[3]);
                                if (month === (dt.getMonth() + 1)) {
                                    return dt;
                                }

                            }

                        }

                    } else {
                        dt = new Date(date);
                        if (!this.isInvalidDate(dt)) {
                            return dt;
                        }

                    }

                }

            }

            return new Date(NaN);
        },

        prev: function() {
            var month = this.$headerTitle.attr('data-month');
            var year = this.$headerTitle.attr('data-year');
            month--;
            if (month < 0) {
                if (this.sameYearOnly) {
                    return;
                }

                month = 11;
                year--;
            }

            this.renderMonth(new Date(year, month, 1));
        },

        renderMonth: function(date) {
            date = date || new Date();

            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
            var lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            var lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
            var $month = this.$headerTitle.find('.month');
            var month = date.getMonth();
            var now = new Date();
            var nowDate = now.getDate();
            var nowMonth = now.getMonth();
            var nowYear = now.getFullYear();
            var selected = this.selectedDate;
            var $tbody = this.$days.find('tbody');
            var year = date.getFullYear();
            var curDate, curMonth, curYear, i, j, rows, stage, previousStage, lastStage, $td, $tr;

            if (selected) {
                selected = {
                    date: selected.getDate(),
                    month: selected.getMonth(),
                    year: selected.getFullYear()
                };
            }

            $month.find('.current').removeClass('current');
            $month.find('span[data-month="' + month + '"]').addClass('current');
            this.$headerTitle.find('.year').text(year);
            this.$headerTitle.attr({
                'data-month': month,
                'data-year': year
            });


            $tbody.empty();
            if (firstDay !== 0) {
                curDate = lastMonthDate - firstDay + 1;
                stage = -1;
            } else {
                curDate = 1;
                stage = 0;
            }

            rows = (lastDate <= (35 - firstDay)) ? 5 : 6;
            for (i = 0; i < rows; i++) {
                $tr = $('<tr></tr>');
                for (j = 0; j < 7; j++) {
                    $td = $('<td></td>');
                    if (stage === -1) {
                        $td.addClass('last-month');
                        if (previousStage !== stage) {
                            $td.addClass('first');
                        }
                    } else if (stage === 1) {
                        $td.addClass('next-month');
                        if (previousStage !== stage) {
                            $td.addClass('first');
                        }
                    }

                    curMonth = month + stage;
                    curYear = year;
                    if (curMonth < 0) {
                        curMonth = 11;
                        curYear--;
                    } else if (curMonth > 11) {
                        curMonth = 0;
                        curYear++;
                    }

                    $td.attr({
                        'data-date': curDate,
                        'data-month': curMonth,
                        'data-year': curYear
                    });
                    if (curYear === nowYear && curMonth === nowMonth && curDate === nowDate) {
                        $td.addClass('current-day');
                    } else if (curYear < nowYear || (curYear === nowYear && curMonth < nowMonth) ||
                        (curYear === nowYear && curMonth === nowMonth && curDate < nowDate)) {
                        $td.addClass('past');
                        if (!this.options.allowPastDates) {
                            $td.addClass('restricted').attr('title', this.restrictedText);
                        }

                    }

                    if (this.isRestricted(curDate, curMonth, curYear)) {
                        $td.addClass('restricted').attr('title', this.restrictedText);
                    }

                    if (selected && curYear === selected.year && curMonth === selected.month && curDate === selected.date) {
                        $td.addClass('selected');
                    }

                    if ($td.hasClass('restricted')) {
                        $td.html('<span><b class="datepicker-date">' + curDate + '</b></span>');
                    } else {
                        $td.html('<span><button type="button" class="datepicker-date">' + curDate + '</button></span>');
                    }

                    curDate++;
                    lastStage = previousStage;
                    previousStage = stage;
                    if (stage === -1 && curDate > lastMonthDate) {
                        curDate = 1;
                        stage = 0;
                        if (lastStage !== stage) {
                            $td.addClass('last');
                        }
                    } else if (stage === 0 && curDate > lastDate) {
                        curDate = 1;
                        stage = 1;
                        if (lastStage !== stage) {
                            $td.addClass('last');
                        }
                    }
                    if (i === (rows - 1) && j === 6) {
                        $td.addClass('last');
                    }

                    $tr.append($td);
                }
                $tbody.append($tr);
            }
        },

        renderWheel: function(date) {
            var month = date.getMonth();
            var $monthUl = this.$wheelsMonth.find('ul');
            var year = date.getFullYear();
            var $yearUl = this.$wheelsYear.find('ul');
            var i, $monthSelected, $yearSelected;

            if (this.sameYearOnly) {
                this.$wheelsMonth.addClass('full');
                this.$wheelsYear.addClass('hidden');
            } else {
                this.$wheelsMonth.removeClass('full');
                this.$wheelsYear.removeClass('hide hidden'); // .hide is deprecated
            }

            $monthUl.find('.selected').removeClass('selected');
            $monthSelected = $monthUl.find('li[data-month="' + month + '"]');
            $monthSelected.addClass('selected');
            $monthUl.scrollTop($monthUl.scrollTop() + ($monthSelected.position().top - $monthUl.outerHeight() / 2 - $monthSelected.outerHeight(true) / 2));

            $yearUl.empty();
            for (i = (year - 10); i < (year + 11); i++) {
                $yearUl.append('<li data-year="' + i + '"><button type="button">' + i + '</button></li>');
            }
            $yearSelected = $yearUl.find('li[data-year="' + year + '"]');
            $yearSelected.addClass('selected');
            this.artificialScrolling = true;
            $yearUl.scrollTop($yearUl.scrollTop() + ($yearSelected.position().top - $yearUl.outerHeight() / 2 - $yearSelected.outerHeight(true) / 2));
            this.artificialScrolling = false;
            $monthSelected.find('button').focus();
        },

        selectClicked: function() {
            var month = this.$wheelsMonth.find('.selected').attr('data-month');
            var year = this.$wheelsYear.find('.selected').attr('data-year');
            this.changeView('calendar', new Date(year, month, 1));
        },

        setCulture: function(cultureCode) {
            if (!cultureCode) {
                return false;
            }

            if (this.moment) {
                moment.locale(cultureCode);
            } else {
                throw MOMENT_NOT_AVAILABLE;
            }
        },

        setDate: function(date) {
            var parsed = this.parseDate(date);
            if (!this.isInvalidDate(parsed)) {
                if (!this.isRestricted(parsed.getDate(), parsed.getMonth(), parsed.getFullYear())) {
                    this.selectedDate = parsed;
                    this.renderMonth(parsed);
                    this.$input.val(this.formatDate(parsed));
                } else {
                    this.selectedDate = false;
                    this.renderMonth();
                }

            } else {
                this.selectedDate = null;
                this.renderMonth();
            }

            this.inputValue = this.$input.val();
            return this.selectedDate;
        },

        setFormat: function(format) {
            if (!format) {
                return false;
            }

            if (this.moment) {
                this.momentFormat = format;
            } else {
                throw MOMENT_NOT_AVAILABLE;
            }
        },

        setRestrictedDates: function(restricted) {
            var parsed = [];
            var self = this;
            var i, l;

            var parseItem = function(val) {
                if (val === -Infinity) {
                    return {
                        date: -Infinity,
                        month: -Infinity,
                        year: -Infinity
                    };
                } else if (val === Infinity) {
                    return {
                        date: Infinity,
                        month: Infinity,
                        year: Infinity
                    };
                } else {
                    val = self.parseDate(val);
                    return {
                        date: val.getDate(),
                        month: val.getMonth(),
                        year: val.getFullYear()
                    };
                }
            };

            this.restricted = restricted;
            for (i = 0, l = restricted.length; i < l; i++) {
                parsed.push({
                    from: parseItem(restricted[i].from),
                    to: parseItem(restricted[i].to)
                });
            }
            this.restrictedParsed = parsed;
        },

        titleClicked: function(e) {
            this.changeView('wheels', new Date(this.$headerTitle.attr('data-year'), this.$headerTitle.attr('data-month'), 1));
        },

        todayClicked: function(e) {
            var date = new Date();

            if ((date.getMonth() + '') !== this.$headerTitle.attr('data-month') || (date.getFullYear() + '') !== this.$headerTitle.attr('data-year')) {
                this.renderMonth(date);
            }
        },

        yearClicked: function(e) {
            this.$wheelsYear.find('.selected').removeClass('selected');
            $(e.currentTarget).parent().addClass('selected');
        }

    });

    //for control library consistency
    Datepicker.prototype.getValue = Datepicker.prototype.getDate;

    // DATEPICKER PLUGIN DEFINITION

    $.fn.datepicker = function(option) {
        var args = Array.prototype.slice.call(arguments, 1);
        var methodReturn;

        var $set = this.each(function() {
            var $this = $(this);
            var data = $this.data('fu.datepicker');
            var options = typeof option === 'object' && option;

            if (!data) {
                $this.data('fu.datepicker', (data = new Datepicker(this, options)));
            }

            if (typeof option === 'string') {
                methodReturn = data[option].apply(data, args);
            }
        });

        return (methodReturn === undefined) ? $set : methodReturn;
    };

    $.fn.datepicker.defaults = {
        allowPastDates: false,
        date: new Date(),
        formatDate: null,
        momentConfig: {
            culture: 'en',
            format: 'L' // more formats can be found here http://momentjs.com/docs/#/customization/long-date-formats/.
        },
        parseDate: null,
        restricted: [], //accepts an array of objects formatted as so: { from: {{date}}, to: {{date}} }  (ex: [ { from: new Date('12/11/2014'), to: new Date('03/31/2015') } ])
        restrictedText: 'Restricted',
        sameYearOnly: false
    };

    $.fn.datepicker.Constructor = Datepicker;

    $.fn.datepicker.noConflict = function() {
        $.fn.datepicker = old;
        return this;
    };

    // DATA-API

    /*
    $(document).on('mousedown.fu.datepicker.data-api', '[data-initialize=datepicker]', function (e) {
    	var $control = $(e.target).closest('.datepicker');
    	if (!$control.data('datepicker')) {
    		$control.datepicker($control.data());
    	}
    });

    //used to prevent the dropdown from closing when clicking within it's bounds
    $(document).on('click.fu.datepicker.data-api', '.datepicker .dropdown-menu', function (e) {
    	var $target = $(e.target);
    	if (!$target.is('.datepicker-date') || $target.closest('.restricted').length) {
    		e.stopPropagation();
    	}
    });

    //used to prevent the dropdown from closing when clicking on the input
    $(document).on('click.fu.datepicker.data-api', '.datepicker input', function (e) {
    	e.stopPropagation();
    });

    $(function () {
    	$('[data-initialize=datepicker]').each(function () {
    		var $this = $(this);
    		if ($this.data('datepicker')) {
    			return;
    		}

    		$this.datepicker($this.data());
    	});
    });
    */

    return $.fn.datepicker;
});
define('skylark-fuelux/dropdown-autoflip',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/query"
],function(langx,browser,eventer,noder,geom,$){

	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	$(document).on('click.fu.dropdown-autoflip', '[data-toggle=dropdown][data-flip]', function (event) {
		if ($(this).data().flip === "auto") {
			// have the drop down decide where to place itself
			_autoFlip($(this).next('.dropdown-menu'));
		}
	});

	// For pillbox suggestions dropdown
	$(document).on('suggested.fu.pillbox', function (event, element) {
		_autoFlip($(element));
		$(element).parent().addClass('open');
	});

	function _autoFlip(menu) {
		// hide while the browser thinks
		$(menu).css({
			visibility: "hidden"
		});

		// decide where to put menu
		if (dropUpCheck(menu)) {
			menu.parent().addClass("dropup");
		} else {
			menu.parent().removeClass("dropup");
		}

		// show again
		$(menu).css({
			visibility: "visible"
		});
	}

	function dropUpCheck(element) {
		// caching container
		var $container = _getContainer(element);

		// building object with measurementsances for later use
		var measurements = {};
		measurements.parentHeight = element.parent().outerHeight();
		measurements.parentOffsetTop = element.parent().offset().top;
		measurements.dropdownHeight = element.outerHeight();
		measurements.containerHeight = $container.overflowElement.outerHeight();

		// this needs to be different if the window is the container or another element is
		measurements.containerOffsetTop = (!!$container.isWindow) ? $container.overflowElement.scrollTop() : $container.overflowElement.offset().top;

		// doing the calculations
		measurements.fromTop = measurements.parentOffsetTop - measurements.containerOffsetTop;
		measurements.fromBottom = measurements.containerHeight - measurements.parentHeight - (measurements.parentOffsetTop - measurements.containerOffsetTop);

		// actual determination of where to put menu
		// false = drop down
		// true = drop up
		if (measurements.dropdownHeight < measurements.fromBottom) {
			return false;
		} else if (measurements.dropdownHeight < measurements.fromTop) {
			return true;
		} else if (measurements.dropdownHeight >= measurements.fromTop && measurements.dropdownHeight >= measurements.fromBottom) {
			// decide which one is bigger and put it there
			if (measurements.fromTop >= measurements.fromBottom) {
				return true;
			} else {
				return false;
			}

		}

	}

	function _getContainer(element) {
		var targetSelector = element.attr('data-target');
		var isWindow = true;
		var containerElement;

		if(!targetSelector) {
			// no selection so find the relevant ancestor
			langx.each(element.parents(), function (index, parentElement) {
				if ($(parentElement).css('overflow') !== 'visible') {
					containerElement = parentElement;
					isWindow = false;
					return false;
				}
			});
		}
		else if (targetSelector !== 'window') {
			containerElement = $(targetSelector);
			isWindow = false;
		}

		// fallback to window
		if (isWindow) {
			containerElement = window;
		}

		return {
				overflowElement: $(containerElement),
				isWindow: isWindow
		};
	}

	// register empty plugin
	$.fn.dropdownautoflip = function () {
		/* empty */
	};
	

});

define('skylark-fuelux/infinite-scroll',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query"
],function(langx,browser,eventer,noder,geom,velm,$){

	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	var old = $.fn.infinitescroll;

	// INFINITE SCROLL CONSTRUCTOR AND PROTOTYPE

	var InfiniteScroll = function (element, options) {
		this.$element = $(element);
		this.$element.addClass('infinitescroll');
		this.options = langx.mixin({}, $.fn.infinitescroll.defaults, options);

		this.curScrollTop = this.$element.scrollTop();
		this.curPercentage = this.getPercentage();
		this.fetchingData = false;

		this.$element.on('scroll.fu.infinitescroll', langx.proxy(this.onScroll, this));
		this.onScroll();
	};

	InfiniteScroll.prototype = {

		constructor: InfiniteScroll,

		destroy: function () {
			this.$element.remove();
			// any external bindings
			// [none]

			// empty elements to return to original markup
			this.$element.empty();

			return this.$element[0].outerHTML;
		},

		disable: function () {
			this.$element.off('scroll.fu.infinitescroll');
		},

		enable: function () {
			this.$element.on('scroll.fu.infinitescroll', langx.proxy(this.onScroll, this));
		},

		end: function (content) {
			var end = $('<div class="infinitescroll-end"></div>');
			if (content) {
				end.append(content);
			} else {
				end.append('---------');
			}

			this.$element.append(end);
			this.disable();
		},

		getPercentage: function () {
			var height = (this.$element.css('box-sizing') === 'border-box') ? this.$element.outerHeight() : this.$element.height();
			var scrollHeight = this.$element.get(0).scrollHeight;
			return (scrollHeight > height) ? ((height / (scrollHeight - this.curScrollTop)) * 100) : 0;
		},

		fetchData: function (force) {
			var load = $('<div class="infinitescroll-load"></div>');
			var self = this;
			var moreBtn;

			var fetch = function () {
				var helpers = {
					percentage: self.curPercentage,
					scrollTop: self.curScrollTop
				};
				var $loader = $('<div class="loader"></div>');
				load.append($loader);
				$loader.loader();
				if (self.options.dataSource) {
					self.options.dataSource(helpers, function (resp) {
						var end;
						load.remove();
						if (resp.content) {
							self.$element.append(resp.content);
						}

						if (resp.end) {
							end = (resp.end !== true) ? resp.end : undefined;
							self.end(end);
						}

						self.fetchingData = false;
					});
				}
			};

			this.fetchingData = true;
			this.$element.append(load);
			if (this.options.hybrid && force !== true) {
				moreBtn = $('<button type="button" class="btn btn-primary"></button>');
				if (typeof this.options.hybrid === 'object') {
					moreBtn.append(this.options.hybrid.label);
				} else {
					moreBtn.append('<span class="glyphicon glyphicon-repeat"></span>');
				}

				moreBtn.on('click.fu.infinitescroll', function () {
					moreBtn.remove();
					fetch();
				});
				load.append(moreBtn);
			} else {
				fetch();
			}
		},

		onScroll: function (e) {
			this.curScrollTop = this.$element.scrollTop();
			this.curPercentage = this.getPercentage();
			if (!this.fetchingData && this.curPercentage >= this.options.percentage) {
				this.fetchData();
			}
		}
	};

	// INFINITE SCROLL PLUGIN DEFINITION

	$.fn.infinitescroll = function (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.infinitescroll');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.infinitescroll', (data = new InfiniteScroll(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.infinitescroll.defaults = {
		dataSource: null,
		hybrid: false,//can be true or an object with structure: { 'label': (markup or jQuery obj) }
		percentage: 95//percentage scrolled to the bottom before more is loaded
	};

	$.fn.infinitescroll.Constructor = InfiniteScroll;

	$.fn.infinitescroll.noConflict = function () {
		$.fn.infinitescroll = old;
		return this;
	};

});

define('skylark-fuelux/loader',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){


	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */


	var old = $.fn.loader;

	// LOADER CONSTRUCTOR AND PROTOTYPE

	var Loader = sbswt.Loader = sbswt.WidgetBase.inherit({
		klassName: "Loader",

		init : function(element,options) {
			this.$element = $(element);
			this.options = langx.mixin({}, $.fn.loader.defaults, options);
		},
		destroy: function () {
			this.$element.remove();
			// any external bindings
			// [none]
			// empty elements to return to original markup
			// [none]
			// returns string of markup
			return this.$element[0].outerHTML;
		},

		ieRepaint: function () {},

		msieVersion: function () {},

		next: function () {},

		pause: function () {},

		play: function () {},

		previous: function () {},

		reset: function () {}
	});

	// LOADER PLUGIN DEFINITION

	$.fn.loader = function (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.loader');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.loader', (data = new Loader(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.loader.defaults = {};

	$.fn.loader.Constructor = Loader;

	$.fn.loader.noConflict = function () {
		$.fn.loader = old;
		return this;
	};

	// INIT LOADER ON DOMCONTENTLOADED
	/*
	$(function () {
		$('[data-initialize=loader]').each(function () {
			var $this = $(this);
			if (!$this.data('fu.loader')) {
				$this.loader($this.data());
			}
		});
	});
	*/

	return $.fn.loader;
});

define('skylark-fuelux/menu',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){

	var popup = null;
	var right_to_left ;

	var Menu = sbswt.Menu = sbswt.WidgetBase.inherit({
        klassName: "Menu",

        init : function(elm,options) {
        	if (!options) {
        		options = elm;
        		elm = null;
        	}
			var self = this,$el;

			this._options = langx.mixin({
					hide_onmouseleave	: 0,
					icons				: true

			},options);

			if (!elm) {
				$el = this.$el = $("<ul class='vakata-context'></ul>");
			} else {
				$el = this.$el = $(elm);
			}

			var to = false;
			$el.on("mouseenter", "li", function (e) {
					e.stopImmediatePropagation();

					if(noder.contains(this, e.relatedTarget)) {
						// премахнато заради delegate mouseleave по-долу
						// $(this).find(".vakata-context-hover").removeClass("vakata-context-hover");
						return;
					}

					if(to) { clearTimeout(to); }
					$el.find(".vakata-context-hover").removeClass("vakata-context-hover").end();

					$(this)
						.siblings().find("ul").hide().end().end()
						.parentsUntil(".vakata-context", "li").addBack().addClass("vakata-context-hover");
					self._show_submenu(this);
				})
				// тестово - дали не натоварва?
				.on("mouseleave", "li", function (e) {
					if(noder.contains(this, e.relatedTarget)) { return; }
					$(this).find(".vakata-context-hover").addBack().removeClass("vakata-context-hover");
				})
				.on("mouseleave", function (e) {
					$(this).find(".vakata-context-hover").removeClass("vakata-context-hover");
					if(self._options.hide_onmouseleave) {
						to = setTimeout(
							(function (t) {
								return function () { self.hide(); };
							}(this)), self._options.hide_onmouseleave);
					}
				})
				.on("click", "a", function (e) {
					e.preventDefault();
				//})
				//.on("mouseup", "a", function (e) {
					if(!$(this).blur().parent().hasClass("vakata-context-disabled") && self._execute($(this).attr("rel")) !== false) {
						self.hide();
					}
				})
				.on('keydown', 'a', function (e) {
						var o = null;
						switch(e.which) {
							case 13:
							case 32:
								e.type = "click";
								e.preventDefault();
								$(e.currentTarget).trigger(e);
								break;
							case 37:
								self.$el.find(".vakata-context-hover").last().closest("li").first().find("ul").hide().find(".vakata-context-hover").removeClass("vakata-context-hover").end().end().children('a').focus();
								e.stopImmediatePropagation();
								e.preventDefault();
								break;
							case 38:
								o = self.$el.find("ul:visible").addBack().last().children(".vakata-context-hover").removeClass("vakata-context-hover").prevAll("li:not(.vakata-context-separator)").first();
								if(!o.length) { o = self.$el.find("ul:visible").addBack().last().children("li:not(.vakata-context-separator)").last(); }
								o.addClass("vakata-context-hover").children('a').focus();
								e.stopImmediatePropagation();
								e.preventDefault();
								break;
							case 39:
								self.$el.find(".vakata-context-hover").last().children("ul").show().children("li:not(.vakata-context-separator)").removeClass("vakata-context-hover").first().addClass("vakata-context-hover").children('a').focus();
								e.stopImmediatePropagation();
								e.preventDefault();
								break;
							case 40:
								o = self.$el.find("ul:visible").addBack().last().children(".vakata-context-hover").removeClass("vakata-context-hover").nextAll("li:not(.vakata-context-separator)").first();
								if(!o.length) { o = self.$el.find("ul:visible").addBack().last().children("li:not(.vakata-context-separator)").first(); }
								o.addClass("vakata-context-hover").children('a').focus();
								e.stopImmediatePropagation();
								e.preventDefault();
								break;
							case 27:
								self.hide();
								e.preventDefault();
								break;
							default:
								//console.log(e.which);
								break;
						}
					})
				.on('keydown', function (e) {
					e.preventDefault();
					var a = self.$el.find('.vakata-contextmenu-shortcut-' + e.which).parent();
					if(a.parent().not('.vakata-context-disabled')) {
						a.click();
					}
				});

			this.render();
        },

        render : function() {
        	var items = this._options.items;
			if(this._parse(items)) {
				this.$el.html(this.html);
			}
			this.$el.width('');
        },

		_trigger : function (event_name) {
			$(document).trigger("context_" + event_name + ".sbswt", {
				"reference"	: this.reference,
				"element"	: this.$el,
				"position"	: {
					"x" : this.position_x,
					"y" : this.position_y
				}
			});
		},        

		_execute : function (i) {
			i = this.items[i];
			return i && (!i._disabled || (langx.isFunction(i._disabled) && !i._disabled({ "item" : i, "reference" : this.reference, "element" : this.$el }))) && i.action ? i.action.call(null, {
						"item"		: i,
						"reference"	: this.reference,
						"element"	: this.$el,
						"position"	: {
							"x" : this.position_x,
							"y" : this.position_y
						}
					}) : false;
		},
		_parse : function (o, is_callback) {
			var self = this,
				reference = self._options.reference;

			if(!o) { return false; }
			if(!is_callback) {
				self.html		= "";
				self.items	= [];
			}
			var str = "",
				sep = false,
				tmp;

			if(is_callback) { str += "<"+"ul>"; }
			langx.each(o, function (i, val) {
				if(!val) { return true; }
				self.items.push(val);
				if(!sep && val.separator_before) {
					str += "<"+"li class='vakata-context-separator'><"+"a href='#' " + (self._options.icons ? '' : 'style="margin-left:0px;"') + ">&#160;<"+"/a><"+"/li>";
				}
				sep = false;
				str += "<"+"li class='" + (val._class || "") + (val._disabled === true || (langx.isFunction(val._disabled) && val._disabled({ "item" : val, "reference" : reference, "element" : self.$el })) ? " vakata-contextmenu-disabled " : "") + "' "+(val.shortcut?" data-shortcut='"+val.shortcut+"' ":'')+">";
				str += "<"+"a href='#' rel='" + (self.items.length - 1) + "' " + (val.title ? "title='" + val.title + "'" : "") + ">";
				if(self._options.icons) {
					str += "<"+"i ";
					if(val.icon) {
						if(val.icon.indexOf("/") !== -1 || val.icon.indexOf(".") !== -1) { str += " style='background:url(\"" + val.icon + "\") center center no-repeat' "; }
						else { str += " class='" + val.icon + "' "; }
					}
					str += "><"+"/i><"+"span class='vakata-contextmenu-sep'>&#160;<"+"/span>";
				}
				str += (langx.isFunction(val.label) ? val.label({ "item" : i, "reference" : reference, "element" : self.$el }) : val.label) + (val.shortcut?' <span class="vakata-contextmenu-shortcut vakata-contextmenu-shortcut-'+val.shortcut+'">'+ (val.shortcut_label || '') +'</span>':'') + "<"+"/a>";
				if(val.submenu) {
					tmp = self._parse(val.submenu, true);
					if(tmp) { str += tmp; }
				}
				str += "<"+"/li>";
				if(val.separator_after) {
					str += "<"+"li class='vakata-context-separator'><"+"a href='#' " + (self._options.icons ? '' : 'style="margin-left:0px;"') + ">&#160;<"+"/a><"+"/li>";
					sep = true;
				}
			});
			str  = str.replace(/<li class\='vakata-context-separator'\><\/li\>$/,"");
			if(is_callback) { str += "</ul>"; }
			/**
			 * triggered on the document when the contextmenu is parsed (HTML is built)
			 * @event
			 * @plugin contextmenu
			 * @name context_parse.vakata
			 * @param {jQuery} reference the element that was right clicked
			 * @param {jQuery} element the DOM element of the menu itself
			 * @param {Object} position the x & y coordinates of the menu
			 */
			if(!is_callback) { self.html = str; self._trigger("parse"); }
			return str.length > 10 ? str : false;
		},
		_show_submenu : function (o) {
			o = $(o);
			if(!o.length || !o.children("ul").length) { return; }
			var e = o.children("ul"),
				xl = o.offset().left,
				x = xl + o.outerWidth(),
				y = o.offset().top,
				w = e.width(),
				h = e.height(),
				dw = $(window).width() + $(window).scrollLeft(),
				dh = $(window).height() + $(window).scrollTop();
			// може да се спести е една проверка - дали няма някой от класовете вече нагоре
			if(right_to_left) {
				o[x - (w + 10 + o.outerWidth()) < 0 ? "addClass" : "removeClass"]("vakata-context-left");
			}
			else {
				o[x + w > dw  && xl > dw - x ? "addClass" : "removeClass"]("vakata-context-right");
			}
			if(y + h + 10 > dh) {
				e.css("bottom","-1px");
			}

			//if does not fit - stick it to the side
			if (o.hasClass('vakata-context-right')) {
				if (xl < w) {
					e.css("margin-right", xl - w);
				}
			} else {
				if (dw - x < w) {
					e.css("margin-left", dw - x - w);
				}
			}

			e.show();
		},
		show : function (reference, position, data) {
			var o, e, x, y, w, h, dw, dh, cond = true;
			switch(cond) {
				case (!position && !reference):
					return false;
				case (!!position && !!reference):
					this.reference	= reference;
					this.position_x	= position.x;
					this.position_y	= position.y;
					break;
				case (!position && !!reference):
					this.reference	= reference;
					o = reference.offset();
					this.position_x	= o.left + reference.outerHeight();
					this.position_y	= o.top;
					break;
				case (!!position && !reference):
					this.position_x	= position.x;
					this.position_y	= position.y;
					break;
			}
			if(!!reference && !data && $(reference).data('vakata_contextmenu')) {
				data = $(reference).data('vakata_contextmenu');
			}

			if(this.items.length) {
				this.$el.appendTo(document.body);
				e = this.$el;
				x = this.position_x;
				y = this.position_y;
				w = e.width();
				h = e.height();
				dw = $(window).width() + $(window).scrollLeft();
				dh = $(window).height() + $(window).scrollTop();
				if(right_to_left) {
					x -= (e.outerWidth() - $(reference).outerWidth());
					if(x < $(window).scrollLeft() + 20) {
						x = $(window).scrollLeft() + 20;
					}
				}
				if(x + w + 20 > dw) {
					x = dw - (w + 20);
				}
				if(y + h + 20 > dh) {
					y = dh - (h + 20);
				}

				this.$el
					.css({ "left" : x, "top" : y })
					.show()
					.find('a').first().focus().parent().addClass("vakata-context-hover");
				this.is_visible = true;

				popup = this;

				/**
				 * triggered on the document when the contextmenu is shown
				 * @event
				 * @plugin contextmenu
				 * @name context_show.vakata
				 * @param {jQuery} reference the element that was right clicked
				 * @param {jQuery} element the DOM element of the menu itself
				 * @param {Object} position the x & y coordinates of the menu
				 */
				this._trigger("show");
			}
		},
		hide : function () {
			if(this.is_visible) {
				this.$el.hide().find("ul").hide().end().find(':focus').blur().end().detach();
				this.is_visible = false;
				popup = null;
				/**
				 * triggered on the document when the contextmenu is hidden
				 * @event
				 * @plugin contextmenu
				 * @name context_hide.vakata
				 * @param {jQuery} reference the element that was right clicked
				 * @param {jQuery} element the DOM element of the menu itself
				 * @param {Object} position the x & y coordinates of the menu
				 */
				this._trigger("hide");
			}
		}

    });	

	$(function () {
		right_to_left = $(document.body).css("direction") === "rtl";

		$(document)
			.on("mousedown.sbswt.popup", function (e) {
				if(popup && popup.$el[0] !== e.target  && !noder.contains(popup.$el[0], e.target)) {
					popup.hide();
				}
			})
			.on("context_show.sbswt.popup", function (e, data) {
				popup.$el.find("li:has(ul)").children("a").addClass("vakata-context-parent");
				if(right_to_left) {
					popup.$el.addClass("vakata-context-rtl").css("direction", "rtl");
				}
				// also apply a RTL class?
				popup.$el.find("ul").hide().end();
			});
	});

	Menu.popup = function (reference, position, data) {
		var m = new Menu({
			reference : reference,
			items : data
		});
		m.show(reference,position);
	};

	Menu.hide = function() {
		if (popup) {
			popup.hide();
		}
	}

	return Menu;

});

define('skylark-fuelux/picker',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){


	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */
	var old = $.fn.picker;

	// PLACARD CONSTRUCTOR AND PROTOTYPE


	var Picker = sbswt.Picker = sbswt.WidgetBase.inherit({
		klassName: "Picker",

		init : function(element,options) {
			var self = this;
			this.$element = $(element);
			this.options = langx.mixin({}, $.fn.picker.defaults, options);

			this.$accept = this.$element.find('.picker-accept');
			this.$cancel = this.$element.find('.picker-cancel');
			this.$trigger = this.$element.find('.picker-trigger');
			this.$footer = this.$element.find('.picker-footer');
			this.$header = this.$element.find('.picker-header');
			this.$popup = this.$element.find('.picker-popup');
			this.$body = this.$element.find('.picker-body');

			this.clickStamp = '_';

			this.isInput = this.$trigger.is('input');

			this.$trigger.on('keydown.fu.picker', langx.proxy(this.keyComplete, this));
			this.$trigger.on('focus.fu.picker', langx.proxy(function inputFocus(e){
				if(typeof e === "undefined" || $(e.target).is('input[type=text]')){
					langx.proxy(this.show(), this);
				}
			}, this));
			this.$trigger.on('click.fu.picker', langx.proxy(function triggerClick(e){
				if(!$(e.target).is('input[type=text]')){
					langx.proxy(this.toggle(), this);
				}else{
					langx.proxy(this.show(), this);
				}
			}, this));
			this.$accept.on('click.fu.picker', langx.proxy(this.complete, this, 'accepted'));
			this.$cancel.on('click.fu.picker', function (e) {
				e.preventDefault(); self.complete('cancelled');
			});
		},

		complete: function complete(action) {
			var EVENT_CALLBACK_MAP = {
				'accepted': 'onAccept',
				'cancelled': 'onCancel',
				'exited': 'onExit'
			};
			var func = this.options[ EVENT_CALLBACK_MAP[action] ];

			var obj = {
				contents: this.$body
			};

			if (func) {
				func(obj);
				this.$element.trigger(action + '.fu.picker', obj);
			} else {
				this.$element.trigger(action + '.fu.picker', obj);
				this.hide();
			}
		},

		keyComplete: function keyComplete(e) {
			if (this.isInput && e.keyCode === 13) {
				this.complete('accepted');
				this.$trigger.blur();
			} else if (e.keyCode === 27) {
				this.complete('exited');
				this.$trigger.blur();
			}
		},

		destroy: function destroy() {
			this.$element.remove();
			// remove any external bindings
			$(document).off('click.fu.picker.externalClick.' + this.clickStamp);
			// empty elements to return to original markup
			// [none]
			// return string of markup
			return this.$element[0].outerHTML;
		},

		disable: function disable() {
			this.$element.addClass('disabled');
			this.$trigger.attr('disabled', 'disabled');
		},

		enable: function enable() {
			this.$element.removeClass('disabled');
			this.$trigger.removeAttr('disabled');
		},

		toggle: function toggle() {
			if (this.$element.hasClass('showing')) {
				this.hide();
			}else{
				this.show();
			}
		},

		hide: function hide() {
			if (!this.$element.hasClass('showing')) {
				return;
			}

			this.$element.removeClass('showing');
			$(document).off('click.fu.picker.externalClick.' + this.clickStamp);
			this.$element.trigger('hidden.fu.picker');
		},

		externalClickListener: function externalClickListener(e, force) {
			if (force === true || this.isExternalClick(e)) {
				this.complete('exited');
			}
		},

		isExternalClick: function isExternalClick(e) {
			var el = this.$element.get(0);
			var exceptions = this.options.externalClickExceptions || [];
			var $originEl = $(e.target);
			var i, l;

			if (e.target === el || $originEl.parents('.picker').get(0) === el) {
				return false;
			} else {
				for (i = 0, l = exceptions.length; i < l; i++) {
					if ($originEl.is(exceptions[i]) || $originEl.parents(exceptions[i]).length > 0) {
						return false;
					}

				}
			}

			return true;
		},

		show: function show() {
			var other;

			other = $(document).find('.picker.showing');
			if (other.length > 0) {
				if (other.data('fu.picker') && other.data('fu.picker').options.explicit) {
					return;
				}

				other.picker('externalClickListener', {}, true);
			}

			this.$element.addClass('showing');

			_display(this);

			this.$element.trigger('shown.fu.picker');

			this.clickStamp = new Date().getTime() + (Math.floor(Math.random() * 100) + 1);
			if (!this.options.explicit) {
				$(document).on('click.fu.picker.externalClick.' + this.clickStamp, langx.proxy(this.externalClickListener, this));
			}
		}
	});

	var _isOffscreen = function _isOffscreen(picker) {
		var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		var scrollTop = $(document).scrollTop();
		var popupTop = picker.$popup.offset();
		var popupBottom = popupTop.top + picker.$popup.outerHeight(true);

		//if the bottom of the popup goes off the page, but the top does not, dropup.
		if (popupBottom > windowHeight + scrollTop || popupTop.top < scrollTop){
			return true;
		}else{//otherwise, prefer showing the top of the popup only vs the bottom
			return false;
		}
	};

	var _display = function _display(picker) {
		picker.$popup.css('visibility', 'hidden');

		_showBelow(picker);

		//if part of the popup is offscreen try to show it above
		if(_isOffscreen(picker)){
			_showAbove(picker);

			//if part of the popup is still offscreen, prefer cutting off the bottom
			if(_isOffscreen(picker)){
				_showBelow(picker);
			}
		}

		picker.$popup.css('visibility', 'visible');
	};

	var _showAbove = function _showAbove(picker) {
		picker.$popup.css('top', - picker.$popup.outerHeight(true) + 'px');
	};

	var _showBelow = function _showBelow(picker) {
		picker.$popup.css('top', picker.$trigger.outerHeight(true) + 'px');
	};


	// PLACARD PLUGIN DEFINITION

	$.fn.picker = function picker(option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.picker');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.picker', (data = new Picker(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.picker.defaults = {
		onAccept: undefined,
		onCancel: undefined,
		onExit: undefined,
		externalClickExceptions: [],
		explicit: false
	};

	$.fn.picker.Constructor = Picker;

	$.fn.picker.noConflict = function noConflict() {
		$.fn.picker = old;
		return this;
	};

	// DATA-API

	/*
	$(document).on('focus.fu.picker.data-api', '[data-initialize=picker]', function (e) {
		var $control = $(e.target).closest('.picker');
		if (!$control.data('fu.picker')) {
			$control.picker($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function () {
		$('[data-initialize=picker]').each(function () {
			var $this = $(this);
			if ($this.data('fu.picker')) return;
			$this.picker($this.data());
		});
	});
	*/

	return $.fn.picker;
});

define('skylark-fuelux/pillbox',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt",
  "./dropdown-autoflip"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){

	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	// -- END UMD WRAPPER PREFACE --

	// -- BEGIN MODULE CODE HERE --

	var old = $.fn.pillbox;

	var CONST = sbswt.CONST;
	var COMMA_KEYCODE = CONST.COMMA_KEYCODE;
	var ENTER_KEYCODE = CONST.ENTER_KEYCODE;
	var isBackspaceKey = sbswt.isBackspaceKey;
	var isDeleteKey = sbswt.isDeleteKey;
	var isTabKey = sbswt.isTabKey;
	var isUpArrow = sbswt.isUpArrow;
	var isDownArrow = sbswt.isDownArrow;
	var cleanInput = sbswt.cleanInput;
	var isShiftHeld = sbswt.isShiftHeld;

	// PILLBOX CONSTRUCTOR AND PROTOTYPE

	var Pillbox = sbswt.Pillbox = sbswt.WidgetBase.inherit({
		klassName: "Pillbox",

		init : function(element,options) {
			this.$element = $(element);
			this.$moreCount = this.$element.find('.pillbox-more-count');
			this.$pillGroup = this.$element.find('.pill-group');
			this.$addItem = this.$element.find('.pillbox-add-item');
			this.$addItemWrap = this.$addItem.parent();
			this.$suggest = this.$element.find('.suggest');
			this.$pillHTML = '<li class="btn btn-default pill">' +
			'	<span></span>' +
			'	<span class="glyphicon glyphicon-close">' +
			'		<span class="sr-only">Remove</span>' +
			'	</span>' +
			'</li>';

			this.options = langx.mixin({}, $.fn.pillbox.defaults, options);

			if (this.options.readonly === -1) {
				if (this.$element.attr('data-readonly') !== undefined) {
					this.readonly(true);
				}
			} else if (this.options.readonly) {
				this.readonly(true);
			}

			// EVENTS
			this.acceptKeyCodes = this._generateObject(this.options.acceptKeyCodes);
			// Create an object out of the key code array, so we don't have to loop through it on every key stroke

			this.$element.on('click.fu.pillbox', '.pill-group > .pill', langx.proxy(this.itemClicked, this));
			this.$element.on('click.fu.pillbox', langx.proxy(this.inputFocus, this));
			this.$element.on('keydown.fu.pillbox', '.pillbox-add-item', langx.proxy(this.inputEvent, this));
			if (this.options.onKeyDown) {
				this.$element.on('mousedown.fu.pillbox', '.suggest > li', langx.proxy(this.suggestionClick, this));
			}

			if (this.options.edit) {
				this.$element.addClass('pills-editable');
				this.$element.on('blur.fu.pillbox', '.pillbox-add-item', langx.proxy(this.cancelEdit, this));
			}
			this.$element.on('blur.fu.pillbox', '.pillbox-add-item', langx.proxy(this.inputEvent, this));
		},

		destroy: function destroy () {
			this.$element.remove();
			// any external bindings
			// [none]
			// empty elements to return to original markup
			// [none]
			// returns string of markup
			return this.$element[0].outerHTML;
		},

		items: function items () {
			var self = this;

			return this.$pillGroup.children('.pill').map(function getItemsData () {
				return self.getItemData($(this));
			}).get();
		},

		itemClicked: function itemClicked (e) {
			var $target = $(e.target);
			var $item;

			e.preventDefault();
			e.stopPropagation();
			this._closeSuggestions();

			if (!$target.hasClass('pill')) {
				$item = $target.parent();
				if (this.$element.attr('data-readonly') === undefined) {
					if ($target.hasClass('glyphicon-close')) {
						if (this.options.onRemove) {
							this.options.onRemove(this.getItemData($item, {
								el: $item
							}), langx.proxy(this._removeElement, this));
						} else {
							this._removeElement(this.getItemData($item, {
								el: $item
							}));
						}

						return false;
					} else if (this.options.edit) {
						if ($item.find('.pillbox-list-edit').length) {
							return false;
						}

						this.openEdit($item);
					}
				}
			} else {
				$item = $target;
			}

			this.$element.trigger('clicked.fu.pillbox', this.getItemData($item));

			return true;
		},

		readonly: function readonly (enable) {
			if (enable) {
				this.$element.attr('data-readonly', 'readonly');
			} else {
				this.$element.removeAttr('data-readonly');
			}

			if (this.options.truncate) {
				this.truncate(enable);
			}
		},

		suggestionClick: function suggestionClick (e) {
			var $item = $(e.currentTarget);
			var item = {
				text: $item.html(),
				value: $item.data('value')
			};

			e.preventDefault();
			this.$addItem.val('');

			if ($item.data('attr')) {
				item.attr = JSON.parse($item.data('attr'));
			}

			item.data = $item.data('data');

			this.addItems(item, true);

			// needs to be after addItems for IE
			this._closeSuggestions();
		},

		itemCount: function itemCount () {
			return this.$pillGroup.children('.pill').length;
		},

		// First parameter is 1 based index (optional, if index is not passed all new items will be appended)
		// Second parameter can be array of objects [{ ... }, { ... }] or you can pass n additional objects as args
		// object structure is as follows (attr and value are optional): { text: '', value: '', attr: {}, data: {} }
		addItems: function addItems () {
			var self = this;
			var items;
			var index;
			var isInternal;

			if (isFinite(String(arguments[0])) && !(arguments[0] instanceof Array)) {
				items = [].slice.call(arguments).slice(1);
				index = arguments[0];
			} else {
				items = [].slice.call(arguments).slice(0);
				isInternal = items[1] && !items[1].text;
			}

			// If first argument is an array, use that, otherwise they probably passed each thing through as a separate arg, so use items as-is
			if (items[0] instanceof Array) {
				items = items[0];
			}

			if (items.length) {
				langx.each(items, function normalizeItemsObject (i, value) {
					var data = {
						text: value.text,
						value: (value.value ? value.value : value.text),
						el: self.$pillHTML
					};

					if (value.attr) {
						data.attr = value.attr;
					}

					if (value.data) {
						data.data = value.data;
					}

					items[i] = data;
				});

				if (this.options.edit && this.currentEdit) {
					items[0].el = this.currentEdit.wrap('<div></div>').parent().html();
				}

				if (isInternal) {
					items.pop(1);
				}

				if (self.options.onAdd && isInternal) {
					if (this.options.edit && this.currentEdit) {
						self.options.onAdd(items[0], langx.proxy(self.saveEdit, this));
					} else {
						self.options.onAdd(items[0], langx.proxy(self.placeItems, this));
					}
				} else if (this.options.edit && this.currentEdit) {
					self.saveEdit(items);
				} else if (index) {
					self.placeItems(index, items);
				} else {
					self.placeItems(items, isInternal);
				}
			}
		},

		// First parameter is the index (1 based) to start removing items
		// Second parameter is the number of items to be removed
		removeItems: function removeItems (index, howMany) {
			var self = this;

			if (!index) {
				this.$pillGroup.find('.pill').remove();
				this._removePillTrigger({
					method: 'removeAll'
				});
			} else {
				var itemsToRemove = howMany ? howMany : 1;

				for (var item = 0; item < itemsToRemove; item++) {
					var $currentItem = self.$pillGroup.find('> .pill:nth-child(' + index + ')');

					if ($currentItem) {
						$currentItem.remove();
					} else {
						break;
					}
				}
			}
		},

		// First parameter is index (optional)
		// Second parameter is new arguments
		placeItems: function placeItems () {
			var items;
			var index;
			var $neighbor;
			var isInternal;

			if (isFinite(String(arguments[0])) && !(arguments[0] instanceof Array)) {
				items = [].slice.call(arguments).slice(1);
				index = arguments[0];
			} else {
				items = [].slice.call(arguments).slice(0);
				isInternal = items[1] && !items[1].text;
			}

			if (items[0] instanceof Array) {
				items = items[0];
			}

			if (items.length) {
				var newItems = [];
				langx.each(items, function prepareItemForAdd (i, item) {
					var $item = $(item.el);

					$item.attr('data-value', item.value);
					$item.find('span:first').html(item.text);

					// DOM attributes
					if (item.attr) {
						langx.each(item.attr, function handleDOMAttributes (key, value) {
							if (key === 'cssClass' || key === 'class') {
								$item.addClass(value);
							} else {
								$item.attr(key, value);
							}
						});
					}

					if (item.data) {
						$item.data('data', item.data);
					}

					newItems.push($item);
				});

				if (this.$pillGroup.children('.pill').length > 0) {
					if (index) {
						$neighbor = this.$pillGroup.find('.pill').eq(index);

						if ($neighbor.length) {
							$neighbor.before(newItems);
						} else {
							this.$pillGroup.children('.pill').last().after(newItems);
						}
					} else {
						this.$pillGroup.children('.pill').last().after(newItems);
					}
				} else {
					this.$pillGroup.prepend(newItems);
				}

				if (isInternal) {
					this.$element.trigger('added.fu.pillbox', {
						text: items[0].text,
						value: items[0].value
					});
				}
			}
		},

		inputEvent: function inputEvent (e) {
			var self = this;
			var text = self.options.cleanInput(this.$addItem.val());
			var isFocusOutEvent = e.type === 'focusout';
			var blurredAfterInput = (isFocusOutEvent && text.length > 0);
			// If we test for keycode only, it will match for `<` & `,` instead of just `,`
			// This way users can type `<3` and `1 < 3`, etc...
			var acceptKeyPressed = (this.acceptKeyCodes[e.keyCode] && !isShiftHeld(e));

			if (acceptKeyPressed || blurredAfterInput) {
				var attr;
				var value;

				if (this.options.onKeyDown && this._isSuggestionsOpen()) {
					var $selection = this.$suggest.find('.pillbox-suggest-sel');

					if ($selection.length) {
						text = self.options.cleanInput($selection.html());
						value = self.options.cleanInput($selection.data('value'));
						attr = $selection.data('attr');
					}
				}

				// ignore comma and make sure text that has been entered (protects against " ,". https://github.com/ExactTarget/fuelux/issues/593), unless allowEmptyPills is true.
				if (text.replace(/[ ]*\,[ ]*/, '').match(/\S/) || (this.options.allowEmptyPills && text.length)) {
					this._closeSuggestions();
					this.$addItem.val('').hide();

					if (attr) {
						this.addItems({
							text: text,
							value: value,
							attr: JSON.parse(attr)
						}, true);
					} else {
						this.addItems({
							text: text,
							value: value
						}, true);
					}

					setTimeout(function clearAddItemInput () {
						self.$addItem.show().attr({
							size: 10
						}).focus();
					}, 0);
				}

				e.preventDefault();
				return true;
			} else if (isBackspaceKey(e) || isDeleteKey(e)) {
				if (!text.length) {
					e.preventDefault();

					if (this.options.edit && this.currentEdit) {
						this.cancelEdit();
						return true;
					}

					this._closeSuggestions();
					var $lastItem = this.$pillGroup.children('.pill:last');

					if ($lastItem.hasClass('pillbox-highlight')) {
						this._removeElement(this.getItemData($lastItem, {
							el: $lastItem
						}));
					} else {
						$lastItem.addClass('pillbox-highlight');
					}

					return true;
				}
			} else if (text.length > 10) {
				if (this.$addItem.width() < (this.$pillGroup.width() - 6)) {
					this.$addItem.attr({
						size: text.length + 3
					});
				}
			}

			this.$pillGroup.find('.pill').removeClass('pillbox-highlight');

			if (this.options.onKeyDown && !isFocusOutEvent) {
				if (
					isTabKey(e) ||
					isUpArrow(e) ||
					isDownArrow(e)
				) {
					if (this._isSuggestionsOpen()) {
						this._keySuggestions(e);
					}

					return true;
				}

				// only allowing most recent event callback to register
				this.callbackId = e.timeStamp;
				this.options.onKeyDown({
					event: e,
					value: text
				}, function callOpenSuggestions (data) {
					self._openSuggestions(e, data);
				});
			}

			return true;
		},

		openEdit: function openEdit (el) {
			var targetChildIndex = el.index() + 1;
			var $addItemWrap = this.$addItemWrap.detach().hide();

			this.$pillGroup.find('.pill:nth-child(' + targetChildIndex + ')').before($addItemWrap);
			this.currentEdit = el.detach();

			$addItemWrap.addClass('editing');
			this.$addItem.val(el.find('span:first').html());
			$addItemWrap.show();
			this.$addItem.focus().select();
		},

		cancelEdit: function cancelEdit (e) {
			var $addItemWrap;
			if (!this.currentEdit) {
				return false;
			}

			this._closeSuggestions();
			if (e) {
				this.$addItemWrap.before(this.currentEdit);
			}

			this.currentEdit = false;

			$addItemWrap = this.$addItemWrap.detach();
			$addItemWrap.removeClass('editing');
			this.$addItem.val('');
			this.$pillGroup.append($addItemWrap);

			return true;
		},

		// Must match syntax of placeItem so addItem callback is called when an item is edited
		// expecting to receive an array back from the callback containing edited items
		saveEdit: function saveEdit () {
			var item = arguments[0][0] ? arguments[0][0] : arguments[0];

			this.currentEdit = $(item.el);
			this.currentEdit.data('value', item.value);
			this.currentEdit.find('span:first').html(item.text);

			this.$addItemWrap.hide();
			this.$addItemWrap.before(this.currentEdit);
			this.currentEdit = false;

			this.$addItem.val('');
			this.$addItemWrap.removeClass('editing');
			this.$pillGroup.append(this.$addItemWrap.detach().show());
			this.$element.trigger('edited.fu.pillbox', {
				value: item.value,
				text: item.text
			});
		},

		removeBySelector: function removeBySelector () {
			var selectors = [].slice.call(arguments).slice(0);
			var self = this;

			langx.each(selectors, function doRemove (i, sel) {
				self.$pillGroup.find(sel).remove();
			});

			this._removePillTrigger({
				method: 'removeBySelector',
				removedSelectors: selectors
			});
		},

		removeByValue: function removeByValue () {
			var values = [].slice.call(arguments).slice(0);
			var self = this;

			langx.each(values, function doRemove (i, val) {
				self.$pillGroup.find('> .pill[data-value="' + val + '"]').remove();
			});

			this._removePillTrigger({
				method: 'removeByValue',
				removedValues: values
			});
		},

		removeByText: function removeByText () {
			var text = [].slice.call(arguments).slice(0);
			var self = this;

			langx.each(text, function doRemove (i, matchingText) {
				self.$pillGroup.find('> .pill:contains("' + matchingText + '")').remove();
			});

			this._removePillTrigger({
				method: 'removeByText',
				removedText: text
			});
		},

		truncate: function truncate (enable) {
			var self = this;

			this.$element.removeClass('truncate');
			this.$addItemWrap.removeClass('truncated');
			this.$pillGroup.find('.pill').removeClass('truncated');

			if (enable) {
				this.$element.addClass('truncate');

				var availableWidth = this.$element.width();
				var containerFull = false;
				var processedPills = 0;
				var totalPills = this.$pillGroup.find('.pill').length;
				var widthUsed = 0;

				this.$pillGroup.find('.pill').each(function processPills () {
					var pill = $(this);
					if (!containerFull) {
						processedPills++;
						self.$moreCount.text(totalPills - processedPills);
						if ((widthUsed + pill.outerWidth(true) + self.$addItemWrap.outerWidth(true)) <= availableWidth) {
							widthUsed += pill.outerWidth(true);
						} else {
							self.$moreCount.text((totalPills - processedPills) + 1);
							pill.addClass('truncated');
							containerFull = true;
						}
					} else {
						pill.addClass('truncated');
					}
				});
				if (processedPills === totalPills) {
					this.$addItemWrap.addClass('truncated');
				}
			}
		},

		inputFocus: function inputFocus () {
			this.$element.find('.pillbox-add-item').focus();
		},

		getItemData: function getItemData (el, data) {
			return langx.mixin({
				text: el.find('span:first').html()
			}, el.data(), data);
		},

		_removeElement: function _removeElement (data) {
			data.el.remove();
			delete data.el;
			this.$element.trigger('removed.fu.pillbox', data);
		},

		_removePillTrigger: function _removePillTrigger (removedBy) {
			this.$element.trigger('removed.fu.pillbox', removedBy);
		},

		_generateObject: function _generateObject (data) {
			var obj = {};

			langx.each(data, function setObjectValue (index, value) {
				obj[value] = true;
			});

			return obj;
		},

		_openSuggestions: function _openSuggestions (e, data) {
			var $suggestionList = $('<ul>');

			if (this.callbackId !== e.timeStamp) {
				return false;
			}

			if (data.data && data.data.length) {
				langx.each(data.data, function appendSuggestions (index, value) {
					var val = value.value ? value.value : value.text;

					// markup concatentation is 10x faster, but does not allow data store
					var $suggestion = $('<li data-value="' + val + '">' + value.text + '</li>');

					if (value.attr) {
						$suggestion.data('attr', JSON.stringify(value.attr));
					}

					if (value.data) {
						$suggestion.data('data', value.data);
					}

					$suggestionList.append($suggestion);
				});

				// suggestion dropdown
				this.$suggest.html('').append($suggestionList.children());
				$(document).trigger('suggested.fu.pillbox', this.$suggest);
			}

			return true;
		},

		_closeSuggestions: function _closeSuggestions () {
			this.$suggest.html('').parent().removeClass('open');
		},

		_isSuggestionsOpen: function _isSuggestionsOpen () {
			return this.$suggest.parent().hasClass('open');
		},

		_keySuggestions: function _keySuggestions (e) {
			var $first = this.$suggest.find('li.pillbox-suggest-sel');
			var dir = isUpArrow(e);

			e.preventDefault();

			if (!$first.length) {
				$first = this.$suggest.find('li:first');
				$first.addClass('pillbox-suggest-sel');
			} else {
				var $next = dir ? $first.prev() : $first.next();

				if (!$next.length) {
					$next = dir ? this.$suggest.find('li:last') : this.$suggest.find('li:first');
				}

				if ($next) {
					$next.addClass('pillbox-suggest-sel');
					$first.removeClass('pillbox-suggest-sel');
				}
			}
		}
	});


	Pillbox.prototype.getValue = Pillbox.prototype.items;

	// PILLBOX PLUGIN DEFINITION

	$.fn.pillbox = function pillbox (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function set () {
			var $this = $(this);
			var data = $this.data('fu.pillbox');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.pillbox', (data = new Pillbox(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.pillbox.defaults = {
		edit: false,
		readonly: -1, // can be true or false. -1 means it will check for data-readonly="readonly"
		truncate: false,
		acceptKeyCodes: [
			ENTER_KEYCODE,
			COMMA_KEYCODE
		],
		allowEmptyPills: false,
		cleanInput: cleanInput

		// example on remove
		/* onRemove: function(data,callback){
			console.log('onRemove');
			callback(data);
		} */

		// example on key down
		/* onKeyDown: function(event, data, callback ){
			callback({data:[
				{text: Math.random(),value:'sdfsdfsdf'},
				{text: Math.random(),value:'sdfsdfsdf'}
			]});
		}
		*/
		// example onAdd
		/* onAdd: function( data, callback ){
			console.log(data, callback);
			callback(data);
		} */
	};

	$.fn.pillbox.Constructor = Pillbox;

	$.fn.pillbox.noConflict = function noConflict () {
		$.fn.pillbox = old;
		return this;
	};


	// DATA-API

	/*
	$(document).on('mousedown.fu.pillbox.data-api', '[data-initialize=pillbox]', function dataAPI (e) {
		var $control = $(e.target).closest('.pillbox');
		if (!$control.data('fu.pillbox')) {
			$control.pillbox($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function DOMReady () {
		$('[data-initialize=pillbox]').each(function init () {
			var $this = $(this);
			if ($this.data('fu.pillbox')) return;
			$this.pillbox($this.data());
		});
	});
	*/

	return $.fn.pillbox;
});

define('skylark-fuelux/placard',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){


	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	var old = $.fn.placard;
	var EVENT_CALLBACK_MAP = { 'accepted': 'onAccept', 'cancelled': 'onCancel' };


	// PLACARD CONSTRUCTOR AND PROTOTYPE

	var Placard = sbswt.Placard = sbswt.WidgetBase.inherit({
		klassName: "Placard",

		init : function(element,options) {
			var self = this;
			this.$element = $(element);
			this.options = langx.mixin({}, $.fn.placard.defaults, options);

			if(this.$element.attr('data-ellipsis') === 'true'){
				this.options.applyEllipsis = true;
			}

			this.$accept = this.$element.find('.placard-accept');
			this.$cancel = this.$element.find('.placard-cancel');
			this.$field = this.$element.find('.placard-field');
			this.$footer = this.$element.find('.placard-footer');
			this.$header = this.$element.find('.placard-header');
			this.$popup = this.$element.find('.placard-popup');

			this.actualValue = null;
			this.clickStamp = '_';
			this.previousValue = '';
			if (this.options.revertOnCancel === -1) {
				this.options.revertOnCancel = (this.$accept.length > 0);
			}

			// Placard supports inputs, textareas, or contenteditable divs. These checks determine which is being used
			this.isContentEditableDiv = this.$field.is('div');
			this.isInput = this.$field.is('input');
			this.divInTextareaMode = (this.isContentEditableDiv && this.$field.attr('data-textarea') === 'true');

			this.$field.on('focus.fu.placard', langx.proxy(this.show, this));
			this.$field.on('keydown.fu.placard', langx.proxy(this.keyComplete, this));
			this.$element.on('close.fu.placard', langx.proxy(this.hide, this));
			this.$accept.on('click.fu.placard', langx.proxy(this.complete, this, 'accepted'));
			this.$cancel.on('click.fu.placard', function (e) {
				e.preventDefault(); self.complete('cancelled');
			});

			this.applyEllipsis();
		},

		complete: function complete(action) {
			var func = this.options[ EVENT_CALLBACK_MAP[action] ];

			var obj = {
				previousValue: this.previousValue,
				value: this.getValue()
			};

			if (func) {
				func(obj);
				this.$element.trigger(action + '.fu.placard', obj);
			} else {
				if (action === 'cancelled' && this.options.revertOnCancel) {
					this.setValue(this.previousValue, true);
				}

				this.$element.trigger(action + '.fu.placard', obj);
				this.hide();
			}
		},

		keyComplete: function keyComplete(e) {
			if (((this.isContentEditableDiv && !this.divInTextareaMode) || this.isInput) && e.keyCode === 13) {
				this.complete('accepted');
				this.$field.blur();
			} else if (e.keyCode === 27) {
				this.complete('cancelled');
				this.$field.blur();
			}
		},

		destroy: function destroy() {
			this.$element.remove();
			// remove any external bindings
			$(document).off('click.fu.placard.externalClick.' + this.clickStamp);
			// set input value attribute
			this.$element.find('input').each(function () {
				$(this).attr('value', $(this).val());
			});
			// empty elements to return to original markup
			// [none]
			// return string of markup
			return this.$element[0].outerHTML;
		},

		disable: function disable() {
			this.$element.addClass('disabled');
			this.$field.attr('disabled', 'disabled');
			if (this.isContentEditableDiv) {
				this.$field.removeAttr('contenteditable');
			}
			this.hide();
		},

		applyEllipsis: function applyEllipsis() {
			var field, i, str;
			if (this.options.applyEllipsis) {
				field = this.$field.get(0);
				if ((this.isContentEditableDiv && !this.divInTextareaMode) || this.isInput) {
					field.scrollLeft = 0;
				} else {
					field.scrollTop = 0;
					if (field.clientHeight < field.scrollHeight) {
						this.actualValue = this.getValue();
						this.setValue('', true);
						str = '';
						i = 0;
						while (field.clientHeight >= field.scrollHeight) {
							str += this.actualValue[i];
							this.setValue(str + '...', true);
							i++;
						}
						str = (str.length > 0) ? str.substring(0, str.length - 1) : '';
						this.setValue(str + '...', true);
					}
				}

			}
		},

		enable: function enable() {
			this.$element.removeClass('disabled');
			this.$field.removeAttr('disabled');
			if (this.isContentEditableDiv) {
				this.$field.attr('contenteditable', 'true');
			}
		},

		externalClickListener: function externalClickListener(e, force) {
			if (force === true || this.isExternalClick(e)) {
				this.complete(this.options.externalClickAction);
			}
		},

		getValue: function getValue() {
			if (this.actualValue !== null) {
				return this.actualValue;
			} else if (this.isContentEditableDiv) {
				return this.$field.html();
			} else {
				return this.$field.val();
			}
		},

		hide: function hide() {
			if (!this.$element.hasClass('showing')) {
				return;
			}

			this.$element.removeClass('showing');
			this.applyEllipsis();
			$(document).off('click.fu.placard.externalClick.' + this.clickStamp);
			this.$element.trigger('hidden.fu.placard');
		},

		isExternalClick: function isExternalClick(e) {
			var el = this.$element.get(0);
			var exceptions = this.options.externalClickExceptions || [];
			var $originEl = $(e.target);
			var i, l;

			if (noder.contains(el,e.target)) {
				return false;
			} else {
				for (i = 0, l = exceptions.length; i < l; i++) {
					if ($originEl.is(exceptions[i]) || $originEl.parents(exceptions[i]).length > 0) {
						return false;
					}

				}
			}

			return true;
		},

		/**
		 * setValue() sets the Placard triggering DOM element's display value
		 *
		 * @param {String} the value to be displayed
		 * @param {Boolean} If you want to explicitly suppress the application
		 *					of ellipsis, pass `true`. This would typically only be
		 *					done from internal functions (like `applyEllipsis`)
		 *					that want to avoid circular logic. Otherwise, the
		 *					value of the option applyEllipsis will be used.
		 * @return {Object} jQuery object representing the DOM element whose
		 *					value was set
		 */
		setValue: function setValue(val, suppressEllipsis) {
			//if suppressEllipsis is undefined, check placards init settings
			if (typeof suppressEllipsis === 'undefined') {
				suppressEllipsis = !this.options.applyEllipsis;
			}

			if (this.isContentEditableDiv) {
				this.$field.empty().append(val);
			} else {
				this.$field.val(val);
			}

			if (!suppressEllipsis && !_isShown(this)) {
				this.applyEllipsis();
			}

			return this.$field;
		},

		show: function show() {
			if (_isShown(this)) { return; }
			if (!_closeOtherPlacards()) { return; }

			this.previousValue = (this.isContentEditableDiv) ? this.$field.html() : this.$field.val();

			if (this.actualValue !== null) {
				this.setValue(this.actualValue, true);
				this.actualValue = null;
			}

			this.showPlacard();
		},

		showPlacard: function showPlacard() {
			this.$element.addClass('showing');

			if (this.$header.length > 0) {
				this.$popup.css('top', '-' + this.$header.outerHeight(true) + 'px');
			}

			if (this.$footer.length > 0) {
				this.$popup.css('bottom', '-' + this.$footer.outerHeight(true) + 'px');
			}

			this.$element.trigger('shown.fu.placard');
			this.clickStamp = new Date().getTime() + (Math.floor(Math.random() * 100) + 1);
			if (!this.options.explicit) {
				$(document).on('click.fu.placard.externalClick.' + this.clickStamp, langx.proxy(this.externalClickListener, this));
			}
		}
		
	});

	var _isShown = function _isShown(placard) {
		return placard.$element.hasClass('showing');
	};

	var _closeOtherPlacards = function _closeOtherPlacards() {
		var otherPlacards;

		otherPlacards = $(document).find('.placard.showing');
		if (otherPlacards.length > 0) {
			if (otherPlacards.data('fu.placard') && otherPlacards.data('fu.placard').options.explicit) {
				return false;//failed
			}

			otherPlacards.placard('externalClickListener', {}, true);
		}

		return true;//succeeded
	};


	// PLACARD PLUGIN DEFINITION

	$.fn.placard = function (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.placard');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.placard', (data = new Placard(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.placard.defaults = {
		onAccept: undefined,
		onCancel: undefined,
		externalClickAction: 'cancelled',
		externalClickExceptions: [],
		explicit: false,
		revertOnCancel: -1,//negative 1 will check for an '.placard-accept' button. Also can be set to true or false
		applyEllipsis: false
	};

	$.fn.placard.Constructor = Placard;

	$.fn.placard.noConflict = function () {
		$.fn.placard = old;
		return this;
	};

	/*
	// DATA-API
	$(document).on('focus.fu.placard.data-api', '[data-initialize=placard]', function (e) {
		var $control = $(e.target).closest('.placard');
		if (!$control.data('fu.placard')) {
			$control.placard($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function () {
		$('[data-initialize=placard]').each(function () {
			var $this = $(this);
			if ($this.data('fu.placard')) return;
			$this.placard($this.data());
		});
	});
	*/
	
	return $.fn.placard;

});

define('skylark-fuelux/radio',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){


	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	var old = $.fn.radio;

	// RADIO CONSTRUCTOR AND PROTOTYPE
	var logError = function logError (error) {
		if (window && window.console && window.console.error) {
			window.console.error(error);
		}
	};

	var Radio = sbswt.Radio = sbswt.WidgetBase.inherit({
		klassName: "Radio",

		init : function(element,options) {
			this.options = langx.mixin({}, $.fn.radio.defaults, options);

			if (element.tagName.toLowerCase() !== 'label') {
				logError('Radio must be initialized on the `label` that wraps the `input` element. See https://github.com/ExactTarget/fuelux/blob/master/reference/markup/radio.html for example of proper markup. Call `.radio()` on the `<label>` not the `<input>`');
				return;
			}

			// cache elements
			this.$label = $(element);
			this.$radio = this.$label.find('input[type="radio"]');
			this.groupName = this.$radio.attr('name'); // don't cache group itself since items can be added programmatically

			if (!this.options.ignoreVisibilityCheck && this.$radio.css('visibility').match(/hidden|collapse/)) {
				logError('For accessibility reasons, in order for tab and space to function on radio, `visibility` must not be set to `hidden` or `collapse`. See https://github.com/ExactTarget/fuelux/pull/1996 for more details.');
			}

			// determine if a toggle container is specified
			var containerSelector = this.$radio.attr('data-toggle');
			this.$toggleContainer = $(containerSelector);

			// handle internal events
			this.$radio.on('change', langx.proxy(this.itemchecked, this));

			// set default state
			this.setInitialState();
		},

		setInitialState: function setInitialState () {
			var $radio = this.$radio;

			// get current state of input
			var checked = $radio.prop('checked');
			var disabled = $radio.prop('disabled');

			// sync label class with input state
			this.setCheckedState($radio, checked);
			this.setDisabledState($radio, disabled);
		},

		resetGroup: function resetGroup () {
			var $radios = $('input[name="' + this.groupName + '"]');
			$radios.each(function resetRadio (index, item) {
				var $radio = $(item);
				var $lbl = $radio.parent();
				var containerSelector = $radio.attr('data-toggle');
				var $containerToggle = $(containerSelector);


				$lbl.removeClass('checked');
				$containerToggle.addClass('hidden');
			});
		},

		setCheckedState: function setCheckedState (element, checked) {
			var $radio = element;
			var $lbl = $radio.parent();
			var containerSelector = $radio.attr('data-toggle');
			var $containerToggle = $(containerSelector);

			if (checked) {
				// reset all items in group
				this.resetGroup();

				$radio.prop('checked', true);
				$lbl.addClass('checked');
				$containerToggle.removeClass('hide hidden');
				$lbl.trigger('checked.fu.radio');
			} else {
				$radio.prop('checked', false);
				$lbl.removeClass('checked');
				$containerToggle.addClass('hidden');
				$lbl.trigger('unchecked.fu.radio');
			}

			$lbl.trigger('changed.fu.radio', checked);
		},

		setDisabledState: function setDisabledState (element, disabled) {
			var $radio = $(element);
			var $lbl = this.$label;

			if (disabled) {
				$radio.prop('disabled', true);
				$lbl.addClass('disabled');
				$lbl.trigger('disabled.fu.radio');
			} else {
				$radio.prop('disabled', false);
				$lbl.removeClass('disabled');
				$lbl.trigger('enabled.fu.radio');
			}

			return $radio;
		},

		itemchecked: function itemchecked (evt) {
			var $radio = $(evt.target);
			this.setCheckedState($radio, true);
		},

		check: function check () {
			this.setCheckedState(this.$radio, true);
		},

		uncheck: function uncheck () {
			this.setCheckedState(this.$radio, false);
		},

		isChecked: function isChecked () {
			var checked = this.$radio.prop('checked');
			return checked;
		},

		enable: function enable () {
			this.setDisabledState(this.$radio, false);
		},

		disable: function disable () {
			this.setDisabledState(this.$radio, true);
		},

		destroy: function destroy () {
			this.$label.remove();
			return this.$label[0].outerHTML;
		}

	});


	Radio.prototype.getValue = Radio.prototype.isChecked;

	// RADIO PLUGIN DEFINITION

	$.fn.radio = function radio (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function applyData () {
			var $this = $(this);
			var data = $this.data('fu.radio');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.radio', (data = new Radio(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.radio.defaults = {
		ignoreVisibilityCheck: false
	};

	$.fn.radio.Constructor = Radio;

	$.fn.radio.noConflict = function noConflict () {
		$.fn.radio = old;
		return this;
	};


	// DATA-API
	/*
	$(document).on('mouseover.fu.radio.data-api', '[data-initialize=radio]', function initializeRadios (e) {
		var $control = $(e.target);
		if (!$control.data('fu.radio')) {
			$control.radio($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function onReadyInitializeRadios () {
		$('[data-initialize=radio]').each(function initializeRadio () {
			var $this = $(this);
			if (!$this.data('fu.radio')) {
				$this.radio($this.data());
			}
		});
	});
	*/

	return $.fn.radio;
});

define('skylark-fuelux/selectlist',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){


	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	var old = $.fn.selectlist;
	// SELECT CONSTRUCTOR AND PROTOTYPE

	var Selectlist = sbswt.Selectlist = sbswt.WidgetBase.inherit({
		klassName: "Selectlist",

		init : function(element,options) {
			this.$element = $(element);
			this.options = langx.mixin({}, $.fn.selectlist.defaults, options);


			this.$button = this.$element.find('.btn.dropdown-toggle');
			this.$hiddenField = this.$element.find('.hidden-field');
			this.$label = this.$element.find('.selected-label');
			this.$dropdownMenu = this.$element.find('.dropdown-menu');

			this.$button.dropdown();

			this.$element.on('click.fu.selectlist', '.dropdown-menu a', langx.proxy(this.itemClicked, this));
			this.setDefaultSelection();

			if (options.resize === 'auto' || this.$element.attr('data-resize') === 'auto') {
				this.resize();
			}

			// if selectlist is empty or is one item, disable it
			var items = this.$dropdownMenu.children('li');
			if( items.length === 0) {
				this.disable();
				this.doSelect( $(this.options.emptyLabelHTML));
			}

			// support jumping focus to first letter in dropdown when key is pressed
			this.$element.on('shown.bs.dropdown', function () {
					var $this = $(this);
					// attach key listener when dropdown is shown
					$(document).on('keypress.fu.selectlist', function(e){

						// get the key that was pressed
						var key = String.fromCharCode(e.which);
						// look the items to find the first item with the first character match and set focus
						$this.find("li").each(function(idx,item){
							if ($(item).text().charAt(0).toLowerCase() === key) {
								$(item).children('a').focus();
								return false;
							}
						});

				});
			});

			// unbind key event when dropdown is hidden
			this.$element.on('hide.bs.dropdown', function () {
					$(document).off('keypress.fu.selectlist');
			});
		},

		destroy: function () {
			this.$element.remove();
			// any external bindings
			// [none]
			// empty elements to return to original markup
			// [none]
			// returns string of markup
			return this.$element[0].outerHTML;
		},

		doSelect: function ($item) {
			var $selectedItem;
			this.$selectedItem = $selectedItem = $item;

			this.$hiddenField.val(this.$selectedItem.attr('data-value'));
			this.$label.html($(this.$selectedItem.children()[0]).html());

			// clear and set selected item to allow declarative init state
			// unlike other controls, selectlist's value is stored internal, not in an input
			this.$element.find('li').each(function () {
				if ($selectedItem.is($(this))) {
					$(this).attr('data-selected', true);
				} else {
					$(this).removeData('selected').removeAttr('data-selected');
				}
			});
		},

		itemClicked: function (e) {
			this.$element.trigger('clicked.fu.selectlist', this.$selectedItem);

			e.preventDefault();
			// ignore if a disabled item is clicked
			if ($(e.currentTarget).parent('li').is('.disabled, :disabled')) { return; }

			// is clicked element different from currently selected element?
			if (!($(e.target).parent().is(this.$selectedItem))) {
				this.itemChanged(e);
			}

			// return focus to control after selecting an option
			this.$element.find('.dropdown-toggle').focus();
		},

		itemChanged: function (e) {
			//selectedItem needs to be <li> since the data is stored there, not in <a>
			this.doSelect($(e.target).closest('li'));

			// pass object including text and any data-attributes
			// to onchange event
			var data = this.selectedItem();
			// trigger changed event
			this.$element.trigger('changed.fu.selectlist', data);
		},

		resize: function () {
			var width = 0;
			var newWidth = 0;
			var sizer = $('<div/>').addClass('selectlist-sizer');


			if (Boolean($(document).find('html').hasClass('fuelux'))) {
				// default behavior for fuel ux setup. means fuelux was a class on the html tag
				$(document.body).append(sizer);
			} else {
				// fuelux is not a class on the html tag. So we'll look for the first one we find so the correct styles get applied to the sizer
				$('.fuelux:first').append(sizer);
			}

			sizer.append(this.$element.clone());

			this.$element.find('a').each(function () {
				sizer.find('.selected-label').text($(this).text());
				newWidth = sizer.find('.selectlist').outerWidth();
				newWidth = newWidth + sizer.find('.sr-only').outerWidth();
				if (newWidth > width) {
					width = newWidth;
				}
			});

			if (width <= 1) {
				return;
			}

			this.$button.css('width', width);
			this.$dropdownMenu.css('width', width);

			sizer.remove();
		},

		selectedItem: function () {
			var txt = this.$selectedItem.text();
			return langx.mixin({
				text: txt
			}, this.$selectedItem.data());
		},

		selectByText: function (text) {
			var $item = $([]);
			this.$element.find('li').each(function () {
				if ((this.textContent || this.innerText || $(this).text() || '').toLowerCase() === (text || '').toLowerCase()) {
					$item = $(this);
					return false;
				}
			});
			this.doSelect($item);
		},

		selectByValue: function (value) {
			var selector = 'li[data-value="' + value + '"]';
			this.selectBySelector(selector);
		},

		selectByIndex: function (index) {
			// zero-based index
			var selector = 'li:eq(' + index + ')';
			this.selectBySelector(selector);
		},

		selectBySelector: function (selector) {
			var $item = this.$element.find(selector);
			this.doSelect($item);
		},

		setDefaultSelection: function () {
			var $item = this.$element.find('li[data-selected=true]').eq(0);

			if ($item.length === 0) {
				$item = this.$element.find('li').has('a').eq(0);
			}

			this.doSelect($item);
		},

		enable: function () {
			this.$element.removeClass('disabled');
			this.$button.removeClass('disabled');
		},

		disable: function () {
			this.$element.addClass('disabled');
			this.$button.addClass('disabled');
		}

	});	


	Selectlist.prototype.getValue = Selectlist.prototype.selectedItem;


	// SELECT PLUGIN DEFINITION

	$.fn.selectlist = function (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.selectlist');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.selectlist', (data = new Selectlist(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.selectlist.defaults = {
		emptyLabelHTML: '<li data-value=""><a href="#">No items</a></li>'
	};

	$.fn.selectlist.Constructor = Selectlist;

	$.fn.selectlist.noConflict = function () {
		$.fn.selectlist = old;
		return this;
	};


	// DATA-API

	/*
	$(document).on('mousedown.fu.selectlist.data-api', '[data-initialize=selectlist]', function (e) {
		var $control = $(e.target).closest('.selectlist');
		if (!$control.data('fu.selectlist')) {
			$control.selectlist($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function () {
		$('[data-initialize=selectlist]').each(function () {
			var $this = $(this);
			if (!$this.data('fu.selectlist')) {
				$this.selectlist($this.data());
			}
		});
	});

	*/

	return $.fn.selectlist;
});

define('skylark-fuelux/spinbox',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){


	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	var old = $.fn.spinbox;

	// SPINBOX CONSTRUCTOR AND PROTOTYPE

	var Spinbox = sbswt.Spinbox = sbswt.WidgetBase.inherit({
		klassName: "Spinbox",

		init : function(element,options) {
			this.$element = $(element);
			this.$element.find('.btn').on('click', function (e) {
				//keep spinbox from submitting if they forgot to say type="button" on their spinner buttons
				e.preventDefault();
			});
			this.options = langx.mixin({}, $.fn.spinbox.defaults, options);
			this.options.step = this.$element.data('step') || this.options.step;

			if (this.options.value < this.options.min) {
				this.options.value = this.options.min;
			} else if (this.options.max < this.options.value) {
				this.options.value = this.options.max;
			}

			this.$input = this.$element.find('.spinbox-input');
			this.$input.on('focusout.fu.spinbox', this.$input, langx.proxy(this.change, this));
			this.$element.on('keydown.fu.spinbox', this.$input, langx.proxy(this.keydown, this));
			this.$element.on('keyup.fu.spinbox', this.$input, langx.proxy(this.keyup, this));

			if (this.options.hold) {
				this.$element.on('mousedown.fu.spinbox', '.spinbox-up', langx.proxy(function () {
					this.startSpin(true);
				}, this));
				this.$element.on('mouseup.fu.spinbox', '.spinbox-up, .spinbox-down', langx.proxy(this.stopSpin, this));
				this.$element.on('mouseout.fu.spinbox', '.spinbox-up, .spinbox-down', langx.proxy(this.stopSpin, this));
				this.$element.on('mousedown.fu.spinbox', '.spinbox-down', langx.proxy(function () {
					this.startSpin(false);
				}, this));
			} else {
				this.$element.on('click.fu.spinbox', '.spinbox-up', langx.proxy(function () {
					this.step(true);
				}, this));
				this.$element.on('click.fu.spinbox', '.spinbox-down', langx.proxy(function () {
					this.step(false);
				}, this));
			}

			this.switches = {
				count: 1,
				enabled: true
			};

			if (this.options.speed === 'medium') {
				this.switches.speed = 300;
			} else if (this.options.speed === 'fast') {
				this.switches.speed = 100;
			} else {
				this.switches.speed = 500;
			}

			this.options.defaultUnit = _isUnitLegal(this.options.defaultUnit, this.options.units) ? this.options.defaultUnit : '';
			this.unit = this.options.defaultUnit;

			this.lastValue = this.options.value;

			this.render();

			if (this.options.disabled) {
				this.disable();
			}
		},

		destroy: function destroy() {
			this.$element.remove();
			// any external bindings
			// [none]
			// set input value attrbute
			this.$element.find('input').each(function () {
				$(this).attr('value', $(this).val());
			});
			// empty elements to return to original markup
			// [none]
			// returns string of markup
			return this.$element[0].outerHTML;
		},

		render: function render() {
			this._setValue(this.getDisplayValue());
		},

		change: function change() {
			this._setValue(this.getDisplayValue());

			this.triggerChangedEvent();
		},

		stopSpin: function stopSpin() {
			if (this.switches.timeout !== undefined) {
				clearTimeout(this.switches.timeout);
				this.switches.count = 1;
				this.triggerChangedEvent();
			}
		},

		triggerChangedEvent: function triggerChangedEvent() {
			var currentValue = this.getValue();
			if (currentValue === this.lastValue) return;
			this.lastValue = currentValue;

			// Primary changed event
			this.$element.trigger('changed.fu.spinbox', currentValue);
		},

		startSpin: function startSpin(type) {
			if (!this.options.disabled) {
				var divisor = this.switches.count;

				if (divisor === 1) {
					this.step(type);
					divisor = 1;
				} else if (divisor < 3) {
					divisor = 1.5;
				} else if (divisor < 8) {
					divisor = 2.5;
				} else {
					divisor = 4;
				}

				this.switches.timeout = setTimeout(langx.proxy(function () {
					this.iterate(type);
				}, this), this.switches.speed / divisor);
				this.switches.count++;
			}
		},

		iterate: function iterate(type) {
			this.step(type);
			this.startSpin(type);
		},

		step: function step(isIncrease) {
			//refresh value from display before trying to increment in case they have just been typing before clicking the nubbins
			this._setValue(this.getDisplayValue());
			var newVal;

			if (isIncrease) {
				newVal = this.options.value + this.options.step;
			} else {
				newVal = this.options.value - this.options.step;
			}

			newVal = newVal.toFixed(5);

			this._setValue(newVal + this.unit);
		},

		getDisplayValue: function getDisplayValue() {
			var inputValue = this.parseInput(this.$input.val());
			var value = (!!inputValue) ? inputValue : this.options.value;
			return value;
		},

		setDisplayValue: function setDisplayValue(value) {
			this.$input.val(value);
		},

		getValue: function getValue() {
			var val = this.options.value;
			if (this.options.decimalMark !== '.'){
				val = (val + '').split('.').join(this.options.decimalMark);
			}
			return val + this.unit;
		},

		setValue: function setValue(val) {
			return this._setValue(val, true);
		},

		_setValue: function _setValue(val, shouldSetLastValue) {
			//remove any i18n on the number
			if (this.options.decimalMark !== '.') {
				val = this.parseInput(val);
			}

			//are we dealing with united numbers?
			if(typeof val !== "number"){
				var potentialUnit = val.replace(/[0-9.-]/g, '');
				//make sure unit is valid, or else drop it in favor of current unit, or default unit (potentially nothing)
				this.unit = _isUnitLegal(potentialUnit, this.options.units) ? potentialUnit : this.options.defaultUnit;
			}

			var intVal = this.getIntValue(val);

			//make sure we are dealing with a number
			if (isNaN(intVal) && !isFinite(intVal)) {
				return this._setValue(this.options.value, shouldSetLastValue);
			}

			//conform
			intVal = _applyLimits.call(this, intVal);

			//cache the pure int value
			this.options.value = intVal;

			//prepare number for display
			val = intVal + this.unit;

			if (this.options.decimalMark !== '.'){
				val = (val + '').split('.').join(this.options.decimalMark);
			}

			//display number
			this.setDisplayValue(val);

			if (shouldSetLastValue) {
				this.lastValue = val;
			}

			return this;
		},

		value: function value(val) {
			if (val || val === 0) {
				return this.setValue(val);
			} else {
				return this.getValue();
			}
		},

		parseInput: function parseInput(value) {
			value = (value + '').split(this.options.decimalMark).join('.');

			return value;
		},

		getIntValue: function getIntValue(value) {
			//if they didn't pass in a number, try and get the number
			value = (typeof value === "undefined") ? this.getValue() : value;
			// if there still isn't a number, abort
			if(typeof value === "undefined"){return;}

			if (typeof value === 'string'){
				value = this.parseInput(value);
			}

			value = parseFloat(value, 10);

			return value;
		},

		disable: function disable() {
			this.options.disabled = true;
			this.$element.addClass('disabled');
			this.$input.attr('disabled', '');
			this.$element.find('button').addClass('disabled');
		},

		enable: function enable() {
			this.options.disabled = false;
			this.$element.removeClass('disabled');
			this.$input.removeAttr('disabled');
			this.$element.find('button').removeClass('disabled');
		},

		keydown: function keydown(event) {
			var keyCode = event.keyCode;
			if (keyCode === 38) {
				this.step(true);
			} else if (keyCode === 40) {
				this.step(false);
			} else if (keyCode === 13) {
				this.change();
			}
		},

		keyup: function keyup(event) {
			var keyCode = event.keyCode;

			if (keyCode === 38 || keyCode === 40) {
				this.triggerChangedEvent();
			}
		}

	});	

	// Truly private methods
	var _limitToStep = function _limitToStep(number, step) {
		return Math.round(number / step) * step;
	};

	var _isUnitLegal = function _isUnitLegal(unit, validUnits) {
		var legalUnit = false;
		var suspectUnit = unit.toLowerCase();

		langx.each(validUnits, function (i, validUnit) {
			validUnit = validUnit.toLowerCase();
			if (suspectUnit === validUnit) {
				legalUnit = true;
				return false;//break out of the loop
			}
		});

		return legalUnit;
	};

	var _applyLimits = function _applyLimits(value) {
		// if unreadable
		if (isNaN(parseFloat(value))) {
			return value;
		}

		// if not within range return the limit
		if (value > this.options.max) {
			if (this.options.cycle) {
				value = this.options.min;
			} else {
				value = this.options.max;
			}
		} else if (value < this.options.min) {
			if (this.options.cycle) {
				value = this.options.max;
			} else {
				value = this.options.min;
			}
		}

		if (this.options.limitToStep && this.options.step) {
			value = _limitToStep(value, this.options.step);

			//force round direction so that it stays within bounds
			if(value > this.options.max){
				value = value - this.options.step;
			} else if(value < this.options.min) {
				value = value + this.options.step;
			}
		}

		return value;
	};

	// SPINBOX PLUGIN DEFINITION

	$.fn.spinbox = function spinbox(option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.spinbox');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.spinbox', (data = new Spinbox(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	// value needs to be 0 for this.render();
	$.fn.spinbox.defaults = {
		value: 0,
		min: 0,
		max: 999,
		step: 1,
		hold: true,
		speed: 'medium',
		disabled: false,
		cycle: false,
		units: [],
		decimalMark: '.',
		defaultUnit: '',
		limitToStep: false
	};

	$.fn.spinbox.Constructor = Spinbox;

	$.fn.spinbox.noConflict = function noConflict() {
		$.fn.spinbox = old;
		return this;
	};


	// DATA-API

	/*
	$(document).on('mousedown.fu.spinbox.data-api', '[data-initialize=spinbox]', function (e) {
		var $control = $(e.target).closest('.spinbox');
		if (!$control.data('fu.spinbox')) {
			$control.spinbox($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function () {
		$('[data-initialize=spinbox]').each(function () {
			var $this = $(this);
			if (!$this.data('fu.spinbox')) {
				$this.spinbox($this.data());
			}
		});
	});
	*/

	return $.fn.spinbox;
});

define('skylark-fuelux/scheduler',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt",
  "./combobox",
  "./datepicker",
  "./radio",
  "./selectlist",
  "./spinbox"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){

	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	// -- END UMD WRAPPER PREFACE --

	// -- BEGIN MODULE CODE HERE --

	var old = $.fn.scheduler;

	// SCHEDULER CONSTRUCTOR AND PROTOTYPE

	var Scheduler = sbswt.Scheduler = sbswt.WidgetBase.inherit({
		klassName: "Scheduler",

		init : function(element,options) {
			var self = this;

			this.$element = $(element);
			this.options = langx.mixin({}, $.fn.scheduler.defaults, options);

			// cache elements
			this.$startDate = this.$element.find('.start-datetime .start-date');
			this.$startTime = this.$element.find('.start-datetime .start-time');

			this.$timeZone = this.$element.find('.timezone-container .timezone');

			this.$repeatIntervalPanel = this.$element.find('.repeat-every-panel');
			this.$repeatIntervalSelect = this.$element.find('.repeat-options');

			this.$repeatIntervalSpinbox = this.$element.find('.repeat-every');
			this.$repeatIntervalTxt = this.$element.find('.repeat-every-text');

			this.$end = this.$element.find('.repeat-end');
			this.$endSelect = this.$end.find('.end-options');
			this.$endAfter = this.$end.find('.end-after');
			this.$endDate = this.$end.find('.end-on-date');

			// panels
			this.$recurrencePanels = this.$element.find('.repeat-panel');


			this.$repeatIntervalSelect.selectlist();

			//initialize sub-controls
			this.$element.find('.selectlist').selectlist();
			this.$startDate.datepicker(this.options.startDateOptions);

			var startDateResponse = (typeof this.options.startDateChanged === "function") ? this.options.startDateChanged : this._guessEndDate;
			this.$startDate.on('change changed.fu.datepicker dateClicked.fu.datepicker', langx.proxy(startDateResponse, this));

			this.$startTime.combobox();
			// init start time
			if (this.$startTime.find('input').val() === '') {
				this.$startTime.combobox('selectByIndex', 0);
			}

			// every 0 days/hours doesn't make sense, change if not set
			if (this.$repeatIntervalSpinbox.find('input').val() === '0') {
				this.$repeatIntervalSpinbox.spinbox({
					'value': 1,
					'min': 1,
					'limitToStep': true
				});
			} else {
				this.$repeatIntervalSpinbox.spinbox({
					'min': 1,
					'limitToStep': true
				});
			}

			this.$endAfter.spinbox({
				'value': 1,
				'min': 1,
				'limitToStep': true
			});
			this.$endDate.datepicker(this.options.endDateOptions);
			this.$element.find('.radio-custom').radio();

			// bind events: 'change' is a Bootstrap JS fired event
			this.$repeatIntervalSelect.on('changed.fu.selectlist', langx.proxy(this.repeatIntervalSelectChanged, this));
			this.$endSelect.on('changed.fu.selectlist', langx.proxy(this.endSelectChanged, this));
			this.$element.find('.repeat-days-of-the-week .btn-group .btn').on('change.fu.scheduler', function (e, data) {
				self.changed(e, data, true);
			});
			this.$element.find('.combobox').on('changed.fu.combobox', langx.proxy(this.changed, this));
			this.$element.find('.datepicker').on('changed.fu.datepicker', langx.proxy(this.changed, this));
			this.$element.find('.datepicker').on('dateClicked.fu.datepicker', langx.proxy(this.changed, this));
			this.$element.find('.selectlist').on('changed.fu.selectlist', langx.proxy(this.changed, this));
			this.$element.find('.spinbox').on('changed.fu.spinbox', langx.proxy(this.changed, this));
			this.$element.find('.repeat-monthly .radio-custom, .repeat-yearly .radio-custom').on('change.fu.scheduler', langx.proxy(this.changed, this));
		},

		destroy: function destroy() {
			var markup;
			// set input value attribute
			this.$element.find('input').each(function () {
				$(this).attr('value', $(this).val());
			});

			// empty elements to return to original markup and store
			this.$element.find('.datepicker .calendar').empty();

			markup = this.$element[0].outerHTML;

			// destroy components
			this.$element.find('.combobox').combobox('destroy');
			this.$element.find('.datepicker').datepicker('destroy');
			this.$element.find('.selectlist').selectlist('destroy');
			this.$element.find('.spinbox').spinbox('destroy');
			this.$element.find('.radio-custom').radio('destroy');
			this.$element.remove();

			// any external bindings
			// [none]

			return markup;
		},

		changed: function changed(e, data, propagate) {
			if (!propagate) {
				e.stopPropagation();
			}

			this.$element.trigger('changed.fu.scheduler', {
				data: (data !== undefined) ? data : $(e.currentTarget).data(),
				originalEvent: e,
				value: this.getValue()
			});
		},

		disable: function disable() {
			this.toggleState('disable');
		},

		enable: function enable() {
			this.toggleState('enable');
		},

		setUtcTime: function setUtcTime(day, time, offset) {
			var dateSplit = day.split('-');
			var timeSplit = time.split(':');
			function z(n) {
				return (n < 10 ? '0' : '') + n;
			}

			var utcDate = new Date(Date.UTC(dateSplit[0], (dateSplit[1] - 1), dateSplit[2], timeSplit[0], timeSplit[1], (timeSplit[2] ? timeSplit[2] : 0)));

			if (offset === 'Z') {
				utcDate.setUTCHours(utcDate.getUTCHours() + 0);
			} else {
				var expression = [];
				expression[0] = '(.)'; // Any Single Character 1
				expression[1] = '.*?'; // Non-greedy match on filler
				expression[2] = '\\d'; // Uninteresting and ignored: d
				expression[3] = '.*?'; // Non-greedy match on filler
				expression[4] = '(\\d)'; // Any Single Digit 1

				var p = new RegExp(expression.join(''), ["i"]);
				var offsetMatch = p.exec(offset);
				if (offsetMatch !== null) {
					var offsetDirection = offsetMatch[1];
					var offsetInteger = offsetMatch[2];
					var modifier = (offsetDirection === '+') ? 1 : -1;

					utcDate.setUTCHours(utcDate.getUTCHours() + (modifier * parseInt(offsetInteger, 10)));
				}

			}

			var localDifference = utcDate.getTimezoneOffset();
			utcDate.setMinutes(localDifference);
			return utcDate;
		},

		// called when the end range changes
		// (Never, After, On date)
		endSelectChanged: function endSelectChanged(e, data) {
			var selectedItem, val;

			if (!data) {
				selectedItem = this.$endSelect.selectlist('selectedItem');
				val = selectedItem.value;
			} else {
				val = data.value;
			}

			// hide all panels
			this.$endAfter.parent().addClass('hidden');
			this.$endAfter.parent().attr('aria-hidden', 'true');

			this.$endDate.parent().addClass('hidden');
			this.$endDate.parent().attr('aria-hidden', 'true');

			if (val === 'after') {
				this.$endAfter.parent().removeClass('hide hidden'); // jQuery deprecated hide in 3.0. Use hidden instead. Leaving hide here to support previous markup
				this.$endAfter.parent().attr('aria-hidden', 'false');
			} else if (val === 'date') {
				this.$endDate.parent().removeClass('hide hidden');	// jQuery deprecated hide in 3.0. Use hidden instead. Leaving hide here to support previous markup
				this.$endDate.parent().attr('aria-hidden', 'false');
			}
		},

		_guessEndDate: function _guessEndDate() {
			var interval = this.$repeatIntervalSelect.selectlist('selectedItem').value;
			var end = new Date(this.$endDate.datepicker('getDate'));
			var start = new Date(this.$startDate.datepicker('getDate'));
			var increment = this.$repeatIntervalSpinbox.find('input').val();

			if(interval !== "none" && end <= start){
				// if increment spinbox is hidden, user has no idea what it is set to and it is probably not set to
				// something they intended. Safest option is to set date forward by an increment of 1.
				// this will keep monthly & yearly from auto-incrementing by more than a single interval
				if(!this.$repeatIntervalSpinbox.is(':visible')){
					increment = 1;
				}

				// treat weekdays as weekly. This treats all "weekdays" as a single set, of which a single increment
				// is one week.
				if(interval === "weekdays"){
					increment = 1;
					interval = "weekly";
				}

				end = _incrementDate(start, end, interval, increment);

				this.$endDate.datepicker('setDate', end);
			}
		},

		getValue: function getValue() {
			// FREQ = frequency (secondly, minutely, hourly, daily, weekdays, weekly, monthly, yearly)
			// BYDAY = when picking days (MO,TU,WE,etc)
			// BYMONTH = when picking months (Jan,Feb,March) - note the values should be 1,2,3...
			// BYMONTHDAY = when picking days of the month (1,2,3...)
			// BYSETPOS = when picking First,Second,Third,Fourth,Last (1,2,3,4,-1)

			var interval = this.$repeatIntervalSpinbox.spinbox('value');
			var pattern = '';
			var repeat = this.$repeatIntervalSelect.selectlist('selectedItem').value;
			var startTime;

			if (this.$startTime.combobox('selectedItem').value) {
				startTime = this.$startTime.combobox('selectedItem').value;
				startTime = startTime.toLowerCase();

			} else {
				startTime = this.$startTime.combobox('selectedItem').text.toLowerCase();
			}

			var timeZone = this.$timeZone.selectlist('selectedItem');
			var day, days, hasAm, hasPm, month, pos, startDateTime, type;

			startDateTime = '' + _getFormattedDate(this.$startDate.datepicker('getDate'), '-');

			startDateTime += 'T';
			hasAm = (startTime.search('am') >= 0);
			hasPm = (startTime.search('pm') >= 0);
			startTime = langx.trim(startTime.replace(/am/g, '').replace(/pm/g, '')).split(':');
			startTime[0] = parseInt(startTime[0], 10);
			startTime[1] = parseInt(startTime[1], 10);
			if (hasAm && startTime[0] > 11) {
				startTime[0] = 0;
			} else if (hasPm && startTime[0] < 12) {
				startTime[0] += 12;
			}

			startDateTime += (startTime[0] < 10) ? '0' + startTime[0] : startTime[0];
			startDateTime += ':';
			startDateTime += (startTime[1] < 10) ? '0' + startTime[1] : startTime[1];

			startDateTime += (timeZone.offset === '+00:00') ? 'Z' : timeZone.offset;

			if (repeat === 'none') {
				pattern = 'FREQ=DAILY;INTERVAL=1;COUNT=1;';
			} else if (repeat === 'secondly') {
				pattern = 'FREQ=SECONDLY;';
				pattern += 'INTERVAL=' + interval + ';';
			} else if (repeat === 'minutely') {
				pattern = 'FREQ=MINUTELY;';
				pattern += 'INTERVAL=' + interval + ';';
			} else if (repeat === 'hourly') {
				pattern = 'FREQ=HOURLY;';
				pattern += 'INTERVAL=' + interval + ';';
			} else if (repeat === 'daily') {
				pattern += 'FREQ=DAILY;';
				pattern += 'INTERVAL=' + interval + ';';
			} else if (repeat === 'weekdays') {
				pattern += 'FREQ=WEEKLY;';
				pattern += 'BYDAY=MO,TU,WE,TH,FR;';
				pattern += 'INTERVAL=1;';
			} else if (repeat === 'weekly') {
				days = [];
				this.$element.find('.repeat-days-of-the-week .btn-group input:checked').each(function () {
					days.push($(this).data().value);
				});

				pattern += 'FREQ=WEEKLY;';
				pattern += 'BYDAY=' + days.join(',') + ';';
				pattern += 'INTERVAL=' + interval + ';';
			} else if (repeat === 'monthly') {
				pattern += 'FREQ=MONTHLY;';
				pattern += 'INTERVAL=' + interval + ';';
				type = this.$element.find('input[name=repeat-monthly]:checked').val();

				if (type === 'bymonthday') {
					day = parseInt(this.$element.find('.repeat-monthly-date .selectlist').selectlist('selectedItem').text, 10);
					pattern += 'BYMONTHDAY=' + day + ';';
				} else if (type === 'bysetpos') {
					days = this.$element.find('.repeat-monthly-day .month-days').selectlist('selectedItem').value;
					pos = this.$element.find('.repeat-monthly-day .month-day-pos').selectlist('selectedItem').value;
					pattern += 'BYDAY=' + days + ';';
					pattern += 'BYSETPOS=' + pos + ';';
				}

			} else if (repeat === 'yearly') {
				pattern += 'FREQ=YEARLY;';
				type = this.$element.find('input[name=repeat-yearly]:checked').val();

				if (type === 'bymonthday') {
					// there are multiple .year-month classed elements in scheduler markup
					month = this.$element.find('.repeat-yearly-date .year-month').selectlist('selectedItem').value;
					day = this.$element.find('.repeat-yearly-date .year-month-day').selectlist('selectedItem').text;
					pattern += 'BYMONTH=' + month + ';';
					pattern += 'BYMONTHDAY=' + day + ';';
				} else if (type === 'bysetpos') {
					days = this.$element.find('.repeat-yearly-day .year-month-days').selectlist('selectedItem').value;
					pos = this.$element.find('.repeat-yearly-day .year-month-day-pos').selectlist('selectedItem').value;
					// there are multiple .year-month classed elements in scheduler markup
					month = this.$element.find('.repeat-yearly-day .year-month').selectlist('selectedItem').value;

					pattern += 'BYDAY=' + days + ';';
					pattern += 'BYSETPOS=' + pos + ';';
					pattern += 'BYMONTH=' + month + ';';
				}

			}

			var end = this.$endSelect.selectlist('selectedItem').value;
			var duration = '';

			// if both UNTIL and COUNT are not specified, the recurrence will repeat forever
			// http://tools.ietf.org/html/rfc2445#section-4.3.10
			if (repeat !== 'none') {
				if (end === 'after') {
					duration = 'COUNT=' + this.$endAfter.spinbox('value') + ';';
				} else if (end === 'date') {
					duration = 'UNTIL=' + _getFormattedDate(this.$endDate.datepicker('getDate'), '') + ';';
				}

			}

			pattern += duration;
			// remove trailing semicolon
			pattern = pattern.substring(pattern.length - 1) === ';' ? pattern.substring(0, pattern.length - 1) : pattern;

			var data = {
				startDateTime: startDateTime,
				timeZone: timeZone,
				recurrencePattern: pattern
			};

			return data;
		},

		// called when the repeat interval changes
		// (None, Hourly, Daily, Weekdays, Weekly, Monthly, Yearly
		repeatIntervalSelectChanged: function repeatIntervalSelectChanged(e, data) {
			var selectedItem, val, txt;

			if (!data) {
				selectedItem = this.$repeatIntervalSelect.selectlist('selectedItem');
				val = selectedItem.value || "";
				txt = selectedItem.text || "";
			} else {
				val = data.value;
				txt = data.text;
			}

			// set the text
			this.$repeatIntervalTxt.text(txt);

			switch (val.toLowerCase()) {
				case 'hourly':
				case 'daily':
				case 'weekly':
				case 'monthly':
					this.$repeatIntervalPanel.removeClass('hide hidden'); // jQuery deprecated hide in 3.0. Use hidden instead. Leaving hide here to support previous markup
					this.$repeatIntervalPanel.attr('aria-hidden', 'false');
					break;
				default:
					this.$repeatIntervalPanel.addClass('hidden'); // jQuery deprecated hide in 3.0. Use hidden instead. Leaving hide here to support previous markup
					this.$repeatIntervalPanel.attr('aria-hidden', 'true');
					break;
			}

			// hide all panels
			this.$recurrencePanels.addClass('hidden');
			this.$recurrencePanels.attr('aria-hidden', 'true');

			// show panel for current selection
			this.$element.find('.repeat-' + val).removeClass('hide hidden'); // jQuery deprecated hide in 3.0. Use hidden instead. Leaving hide here to support previous markup
			this.$element.find('.repeat-' + val).attr('aria-hidden', 'false');

			// the end selection should only be shown when
			// the repeat interval is not "None (run once)"
			if (val === 'none') {
				this.$end.addClass('hidden');
				this.$end.attr('aria-hidden', 'true');
			} else {
				this.$end.removeClass('hide hidden'); // jQuery deprecated hide in 3.0. Use hidden instead. Leaving hide here to support previous markup
				this.$end.attr('aria-hidden', 'false');
			}

			this._guessEndDate();
		},

		_parseAndSetRecurrencePattern: function(recurrencePattern, startTime) {
			var recur = {};
			var i = 0;
			var item = '';
			var commaPatternSplit;

			var $repeatMonthlyDate, $repeatYearlyDate, $repeatYearlyDay;

			var semiColonPatternSplit = recurrencePattern.toUpperCase().split(';');
			for (i = 0; i < semiColonPatternSplit.length; i++) {
				if (semiColonPatternSplit[i] !== '') {
					item = semiColonPatternSplit[i].split('=');
					recur[item[0]] = item[1];
				}
			}

			if (recur.FREQ === 'DAILY') {
				if (recur.BYDAY === 'MO,TU,WE,TH,FR') {
					item = 'weekdays';
				} else {
					if (recur.INTERVAL === '1' && recur.COUNT === '1') {
						item = 'none';
					} else {
						item = 'daily';
					}
				}
			} else if (recur.FREQ === 'SECONDLY') {
				item = 'secondly';
			} else if (recur.FREQ === 'MINUTELY') {
				item = 'minutely';
			} else if (recur.FREQ === 'HOURLY') {
				item = 'hourly';
			} else if (recur.FREQ === 'WEEKLY') {
				item = 'weekly';

				if (recur.BYDAY) {
					if (recur.BYDAY === 'MO,TU,WE,TH,FR') {
						item = 'weekdays';
					} else {
						var el = this.$element.find('.repeat-days-of-the-week .btn-group');
						el.find('label').removeClass('active');
						commaPatternSplit = recur.BYDAY.split(',');
						for (i = 0; i < commaPatternSplit.length; i++) {
							el.find('input[data-value="' + commaPatternSplit[i] + '"]').prop('checked',true).parent().addClass('active');
						}
					}
				}
			} else if (recur.FREQ === 'MONTHLY') {
				this.$element.find('.repeat-monthly input').removeAttr('checked').removeClass('checked');
				this.$element.find('.repeat-monthly label.radio-custom').removeClass('checked');
				if (recur.BYMONTHDAY) {
					$repeatMonthlyDate = this.$element.find('.repeat-monthly-date');
					$repeatMonthlyDate.find('input').addClass('checked').prop('checked', true);
					$repeatMonthlyDate.find('label.radio-custom').addClass('checked');
					$repeatMonthlyDate.find('.selectlist').selectlist('selectByValue', recur.BYMONTHDAY);
				} else if (recur.BYDAY) {
					var $repeatMonthlyDay = this.$element.find('.repeat-monthly-day');
					$repeatMonthlyDay.find('input').addClass('checked').prop('checked', true);
					$repeatMonthlyDay.find('label.radio-custom').addClass('checked');
					if (recur.BYSETPOS) {
						$repeatMonthlyDay.find('.month-day-pos').selectlist('selectByValue', recur.BYSETPOS);
					}

					$repeatMonthlyDay.find('.month-days').selectlist('selectByValue', recur.BYDAY);
				}

				item = 'monthly';
			} else if (recur.FREQ === 'YEARLY') {
				this.$element.find('.repeat-yearly input').removeAttr('checked').removeClass('checked');
				this.$element.find('.repeat-yearly label.radio-custom').removeClass('checked');
				if (recur.BYMONTHDAY) {
					$repeatYearlyDate = this.$element.find('.repeat-yearly-date');
					$repeatYearlyDate.find('input').addClass('checked').prop('checked', true);
					$repeatYearlyDate.find('label.radio-custom').addClass('checked');
					if (recur.BYMONTH) {
						$repeatYearlyDate.find('.year-month').selectlist('selectByValue', recur.BYMONTH);
					}

					$repeatYearlyDate.find('.year-month-day').selectlist('selectByValue', recur.BYMONTHDAY);
				} else if (recur.BYSETPOS) {
					$repeatYearlyDay = this.$element.find('.repeat-yearly-day');
					$repeatYearlyDay.find('input').addClass('checked').prop('checked', true);
					$repeatYearlyDay.find('label.radio-custom').addClass('checked');
					$repeatYearlyDay.find('.year-month-day-pos').selectlist('selectByValue', recur.BYSETPOS);

					if (recur.BYDAY) {
						$repeatYearlyDay.find('.year-month-days').selectlist('selectByValue', recur.BYDAY);
					}

					if (recur.BYMONTH) {
						$repeatYearlyDay.find('.year-month').selectlist('selectByValue', recur.BYMONTH);
					}
				}

				item = 'yearly';
			} else {
				item = 'none';
			}

			if (recur.COUNT) {
				this.$endAfter.spinbox('value', parseInt(recur.COUNT, 10));
				this.$endSelect.selectlist('selectByValue', 'after');
			} else if (recur.UNTIL) {
				var untilSplit, untilDate;

				if (recur.UNTIL.length === 8) {
					untilSplit = recur.UNTIL.split('');
					untilSplit.splice(4, 0, '-');
					untilSplit.splice(7, 0, '-');
					untilDate = untilSplit.join('');
				}

				var timeZone = this.$timeZone.selectlist('selectedItem');
				var timezoneOffset = (timeZone.offset === '+00:00') ? 'Z' : timeZone.offset;

				var utcEndHours = this.setUtcTime(untilDate, startTime.time24HourFormat, timezoneOffset);
				this.$endDate.datepicker('setDate', utcEndHours);

				this.$endSelect.selectlist('selectByValue', 'date');
			} else {
				this.$endSelect.selectlist('selectByValue', 'never');
			}

			this.endSelectChanged();

			if (recur.INTERVAL) {
				this.$repeatIntervalSpinbox.spinbox('value', parseInt(recur.INTERVAL, 10));
			}

			this.$repeatIntervalSelect.selectlist('selectByValue', item);
			this.repeatIntervalSelectChanged();
		},

		_parseStartDateTime: function(startTimeISO8601) {
			var startTime = {};
			var startDate, startDateTimeISO8601FormatSplit, hours, minutes, period;

			startTime.time24HourFormat = startTimeISO8601.split('+')[0].split('-')[0];

			if (startTimeISO8601.search(/\+/) > -1) {
				startTime.timeZoneOffset = '+' + langx.trim(startTimeISO8601.split('+')[1]);
			} else if (startTimeISO8601.search(/\-/) > -1) {
				startTime.timeZoneOffset = '-' + langx.trim(startTimeISO8601.split('-')[1]);
			} else {
				startTime.timeZoneOffset = '+00:00';
			}

			startTime.time24HourFormatSplit = startTime.time24HourFormat.split(':');
			hours = parseInt(startTime.time24HourFormatSplit[0], 10);
			minutes = (startTime.time24HourFormatSplit[1]) ? parseInt(startTime.time24HourFormatSplit[1].split('+')[0].split('-')[0].split('Z')[0], 10) : 0;
			period = (hours < 12) ? 'AM' : 'PM';

			if (hours === 0) {
				hours = 12;
			} else if (hours > 12) {
				hours -= 12;
			}

			minutes = (minutes < 10) ? '0' + minutes : minutes;
			startTime.time12HourFormat = hours + ':' + minutes;
			startTime.time12HourFormatWithPeriod = hours + ':' + minutes + ' ' + period;

			return startTime;
		},

		_parseTimeZone: function(options, startTime) {
			startTime.timeZoneQuerySelector = '';
			if (options.timeZone) {
				if (typeof (options.timeZone) === 'string') {
					startTime.timeZoneQuerySelector += 'li[data-name="' + options.timeZone + '"]';
				} else {
					langx.each(options.timeZone, function(key, value) {
						startTime.timeZoneQuerySelector += 'li[data-' + key + '="' + value + '"]';
					});
				}
				startTime.timeZoneOffset = options.timeZone.offset;
			} else if (options.startDateTime) {
				// Time zone has not been specified via options object, therefore use the timeZoneOffset from _parseAndSetStartDateTime
				startTime.timeZoneOffset = (startTime.timeZoneOffset === '+00:00') ? 'Z' : startTime.timeZoneOffset;
				startTime.timeZoneQuerySelector += 'li[data-offset="' + startTime.timeZoneOffset + '"]';
			} else {
				startTime.timeZoneOffset = 'Z';
			}

			return startTime.timeZoneOffset;
		},

		_setTimeUI: function(time12HourFormatWithPeriod) {
			this.$startTime.find('input').val(time12HourFormatWithPeriod);
			this.$startTime.combobox('selectByText', time12HourFormatWithPeriod);
		},

		_setTimeZoneUI: function(querySelector) {
			this.$timeZone.selectlist('selectBySelector', querySelector);
		},

		setValue: function setValue(options) {
			var startTime = {};
			var startDateTime, startDate, startTimeISO8601, timeOffset, utcStartHours;

			// TIME
			if (options.startDateTime) {
				startDateTime = options.startDateTime.split('T');
				startDate = startDateTime[0];
				startTimeISO8601 = startDateTime[1];

				if(startTimeISO8601) {
					startTime = this._parseStartDateTime(startTimeISO8601);
					this._setTimeUI(startTime.time12HourFormatWithPeriod);
				}
				else {
					startTime.time12HourFormat = '00:00';
					startTime.time24HourFormat = '00:00';
				}
			} else {
				startTime.time12HourFormat = '00:00';
				startTime.time24HourFormat = '00:00';
				var currentDate = this.$startDate.datepicker('getDate');
				startDate = currentDate.getFullYear() + '-' + currentDate.getMonth() + '-' + currentDate.getDate();
			}

			// TIMEZONE
			this._parseTimeZone(options, startTime);
			if (startTime.timeZoneQuerySelector) {
				this._setTimeZoneUI(startTime.timeZoneQuerySelector);
			}

			// RECURRENCE PATTERN
			if(options.recurrencePattern) {
				this._parseAndSetRecurrencePattern(options.recurrencePattern, startTime);
			}

			utcStartHours = this.setUtcTime(startDate, startTime.time24HourFormat, startTime.timeZoneOffset);
			this.$startDate.datepicker('setDate', utcStartHours);
		},

		toggleState: function toggleState(action) {
			this.$element.find('.combobox').combobox(action);
			this.$element.find('.datepicker').datepicker(action);
			this.$element.find('.selectlist').selectlist(action);
			this.$element.find('.spinbox').spinbox(action);
			this.$element.find('.radio-custom').radio(action);

			if (action === 'disable') {
				action = 'addClass';
			} else {
				action = 'removeClass';
			}

			this.$element.find('.repeat-days-of-the-week .btn-group')[action]('disabled');
		},

		value: function value(options) {
			if (options) {
				return this.setValue(options);
			} else {
				return this.getValue();
			}
		}

	});

	var _getFormattedDate = function _getFormattedDate(dateObj, dash) {
		var fdate = '';
		var item;

		fdate += dateObj.getFullYear();
		fdate += dash;
		item = dateObj.getMonth() + 1;//because 0 indexing makes sense when dealing with months /sarcasm
		fdate += (item < 10) ? '0' + item : item;
		fdate += dash;
		item = dateObj.getDate();
		fdate += (item < 10) ? '0' + item : item;

		return fdate;
	};

	var ONE_SECOND = 1000;
	var ONE_MINUTE = ONE_SECOND * 60;
	var ONE_HOUR = ONE_MINUTE * 60;
	var ONE_DAY = ONE_HOUR * 24;
	var ONE_WEEK = ONE_DAY * 7;
	var ONE_MONTH = ONE_WEEK * 5;// No good way to increment by one month using vanilla JS. Since this is an end date, we only need to ensure that this date occurs after at least one or more repeat increments, but there is no reason for it to be exact.
	var ONE_YEAR = ONE_WEEK * 52;
	var INTERVALS = {
		secondly: ONE_SECOND,
		minutely: ONE_MINUTE,
		hourly: ONE_HOUR,
		daily: ONE_DAY,
		weekly: ONE_WEEK,
		monthly: ONE_MONTH,
		yearly: ONE_YEAR
	};

	var _incrementDate = function _incrementDate(start, end, interval, increment) {
		return new Date(start.getTime() + (INTERVALS[interval] * increment));
	};


	// SCHEDULER PLUGIN DEFINITION

	$.fn.scheduler = function scheduler(option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.scheduler');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.scheduler', (data = new Scheduler(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.scheduler.defaults = {};

	$.fn.scheduler.Constructor = Scheduler;

	$.fn.scheduler.noConflict = function noConflict() {
		$.fn.scheduler = old;
		return this;
	};


	// DATA-API
	/*

	$(document).on('mousedown.fu.scheduler.data-api', '[data-initialize=scheduler]', function (e) {
		var $control = $(e.target).closest('.scheduler');
		if (!$control.data('fu.scheduler')) {
			$control.scheduler($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function () {
		$('[data-initialize=scheduler]').each(function () {
			var $this = $(this);
			if ($this.data('scheduler')) return;
			$this.scheduler($this.data());
		});
	});
	*/

	return $.fn.scheduler;
});

define('skylark-fuelux/search',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){


	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	var old = $.fn.search;

	// SEARCH CONSTRUCTOR AND PROTOTYPE

	var Search = sbswt.Search = sbswt.WidgetBase.inherit({
		klassName: "Search",

		init : function(element,options) {
			this.$element = $(element);
			this.$repeater = $(element).closest('.repeater');
			this.options = langx.mixin({}, $.fn.search.defaults, options);

			if (this.$element.attr('data-searchOnKeyPress') === 'true'){
				this.options.searchOnKeyPress = true;
			}

			this.$button = this.$element.find('button');
			this.$input = this.$element.find('input');
			this.$icon = this.$element.find('.glyphicon, .fuelux-icon');

			this.$button.on('click.fu.search', langx.proxy(this.buttonclicked, this));
			this.$input.on('keyup.fu.search', langx.proxy(this.keypress, this));

			if (this.$repeater.length > 0) {
				this.$repeater.on('rendered.fu.repeater', langx.proxy(this.clearPending, this));
			}

			this.activeSearch = '';
		},
		destroy: function () {
			this.$element.remove();
			// any external bindings
			// [none]
			// set input value attrbute
			this.$element.find('input').each(function () {
				$(this).attr('value', $(this).val());
			});
			// empty elements to return to original markup
			// [none]
			// returns string of markup
			return this.$element[0].outerHTML;
		},

		search: function (searchText) {
			if (this.$icon.hasClass('glyphicon')) {
				this.$icon.removeClass('glyphicon-search').addClass('glyphicon-remove');
			}
			if (this.$icon.hasClass('fuelux-icon')) {
				this.$icon.removeClass('fuelux-icon-search').addClass('fuelux-icon-remove');
			}

			this.activeSearch = searchText;
			this.$element.addClass('searched pending');
			this.$element.trigger('searched.fu.search', searchText);
		},

		clear: function () {
			if (this.$icon.hasClass('glyphicon')) {
				this.$icon.removeClass('glyphicon-remove').addClass('glyphicon-search');
			}
			if (this.$icon.hasClass('fuelux-icon')) {
				this.$icon.removeClass('fuelux-icon-remove').addClass('fuelux-icon-search');
			}

			if (this.$element.hasClass('pending')) {
				this.$element.trigger('canceled.fu.search');
			}

			this.activeSearch = '';
			this.$input.val('');
			this.$element.trigger('cleared.fu.search');
			this.$element.removeClass('searched pending');
		},

		clearPending: function () {
			this.$element.removeClass('pending');
		},

		action: function () {
			var val = this.$input.val();

			if (val && val.length > 0) {
				this.search(val);
			} else {
				this.clear();
			}
		},

		buttonclicked: function (e) {
			e.preventDefault();
			if ($(e.currentTarget).is('.disabled, :disabled')) return;

			if (this.$element.hasClass('pending') || this.$element.hasClass('searched')) {
				this.clear();
			} else {
				this.action();
			}
		},

		keypress: function (e) {
			var ENTER_KEY_CODE = 13;
			var TAB_KEY_CODE = 9;
			var ESC_KEY_CODE = 27;

			if (e.which === ENTER_KEY_CODE) {
				e.preventDefault();
				this.action();
			} else if (e.which === TAB_KEY_CODE) {
				e.preventDefault();
			} else if (e.which === ESC_KEY_CODE) {
				e.preventDefault();
				this.clear();
			} else if (this.options.searchOnKeyPress) {
				// search on other keypress
				this.action();
			}
		},

		disable: function () {
			this.$element.addClass('disabled');
			this.$input.attr('disabled', 'disabled');

			if (!this.options.allowCancel) {
				this.$button.addClass('disabled');
			}
		},

		enable: function () {
			this.$element.removeClass('disabled');
			this.$input.removeAttr('disabled');
			this.$button.removeClass('disabled');
		}
	});

	// SEARCH PLUGIN DEFINITION

	$.fn.search = function (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.search');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.search', (data = new Search(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.search.defaults = {
		clearOnEmpty: false,
		searchOnKeyPress: false,
		allowCancel: false
	};

	$.fn.search.Constructor = Search;

	$.fn.search.noConflict = function () {
		$.fn.search = old;
		return this;
	};


	// DATA-API
	/*
	$(document).on('mousedown.fu.search.data-api', '[data-initialize=search]', function (e) {
		var $control = $(e.target).closest('.search');
		if (!$control.data('fu.search')) {
			$control.search($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function () {
		$('[data-initialize=search]').each(function () {
			var $this = $(this);
			if ($this.data('fu.search')) return;
			$this.search($this.data());
		});
	});
	*/

	return 	$.fn.search;
});

define('skylark-fuelux/toolbar',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){

	var Toolbar = sbswt.Toolbar = sbswt.WidgetBase.inherit({
        klassName: "Toolbar",

        init : function(elm,options) {
			var self = this;
			this._options = langx.mixin({
					autoredraw: true,
					buttons: {},
					context: {},
					list: [],
					show: true,
			},options);


			this.$container = $('<nav class="navbar"/>');
			this.$el = $(elm).append(this.$container);

			this.$container.on('mousedown.bs.dropdown.data-api', '[data-toggle="dropdown"]',function(e) {
				$(this).dropdown();
			}); 

			this.render();
        },


		render : function () {
			function createToolbarItems(items,container) {
				langx.each(items,function(i,item)  {
					var type = item.type;
					if (!type) {
						type = "button";
					}
					switch (type) {
						case "buttongroup":
							// Create an element with the HTML
							createButtonGroup(item,container);
							break;
						case "button":
							createButton(item,container)
							break;
						case "dropdown":
						case "dropup":
							createDrop(item,container)
							break;
						case "input":
							createInput(item,container)
							break;
						default:
							throw "Wrong widget button type";
					}
				});

			}

			function createButtonGroup(item,container) {
				var  group = $("<div/>", { class: "btn-group", role: "group" });
				container.append(group);
				createToolbarItems(item.items,group);
				return group;
			}

			function createButton(item,container) {
				// Create button
				var button = $('<button type="button" class="btn btn-default"/>'),
					attrs = langx.mixin({},item);

				// If has icon
				if ("icon" in item) {
					button.append($("<span/>", { class: item.icon }));
					delete attrs.icon;
				}
				// If has text
				if ("text" in attrs) {
					button.append(" " + item.text);
					delete attrs.text;
				}

				button.attr(attrs);

				// Add button to the group
				container.append(button);

			}

			function createDrop(item,container) {
				// Create button
				var dropdown_group = $('<div class="btn-group" role="group"/>');
				var dropdown_button = $('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"/>');
				var dropdown_list = $('<ul class="dropdown-menu"/>');

				var	attrs = langx.mixin({},item);

				if(item.type === "dropup") {
					dropdown_group.addClass("dropup");
				}

				// If has icon
				if ("icon" in item) {
					dropdown_button.append($("<span/>", { class: item.icon }));
					delete attrs.icon;
				}
				// If has text
				if ("text" in item) {
					dropdown_button.append(" " + item.text);
					delete attrs.text;
				}
				// Add caret
				dropdown_button.append(' <span class="caret"/>');

				// Add list of options
				for(var i in item.list) {
					var dropdown_option = item.list[i];
					var dropdown_option_li = $('<li/>');

					// If has icon
					if ("icon" in dropdown_option) {
						dropdown_option_li.append($("<span/>", { class: dropdown_option.icon }));
					}

					// If has text
					if ("text" in dropdown_option) {
						dropdown_option_li.append(" " + dropdown_option.text);
					}
					// Set attributes
					dropdown_option_li.attr(dropdown_option);

					// Add to dropdown list
					dropdown_list.append(dropdown_option_li);
				}
				
				// Set attributes
				dropdown_group.attr(attrs);

				dropdown_group.append(dropdown_button);
				dropdown_group.append(dropdown_list);
				container.append(dropdown_group);

			}

			function createInput(item,container) {
				var input_group = $('<div class="input-group"/>');
				var input_element = $('<input class="form-control"/>');
				
				var	attrs = langx.mixin({},item);

				// Add prefix addon
				if("prefix" in item) {
					var input_prefix = $('<span class="input-group-addon"/>');
					input_prefix.html(item.prefix);
					input_group.append(input_prefix);

					delete attrs.prefix;
				}
				
				// Add input
				input_group.append(input_element);

				// Add sufix addon
				if("sufix" in item) {
					var input_sufix = $('<span class="input-group-addon"/>');
					input_sufix.html(item.sufix);
					input_group.append(input_sufix);

					delete attrs.sufix;
				}

				attrs.type = attrs.inputType;

				delete attrs.inputType;

				// Set attributes
				input_element.attr(attrs);

				container.append(input_group);

			}

			var items = this._options.items;
			if (items) {
				createToolbarItems(items,this.$container);
			}
		}

	});


	$.fn.toolbar = function (options) {
		options = options || {};

		return this.each(function () {
			return new Toolbar(this, langx.mixin({}, options,true));
		});
	};

	return Toolbar;

});

define('skylark-fuelux/wizard',[
  "skylark-utils/langx",
  "skylark-utils/browser",
  "skylark-utils/eventer",
  "skylark-utils/noder",
  "skylark-utils/geom",
  "skylark-utils/velm",
  "skylark-utils/query",
  "./sbswt"
],function(langx,browser,eventer,noder,geom,velm,$,sbswt){

	/*
	 * Fuel UX Checkbox
	 * https://github.com/ExactTarget/fuelux
	 *
	 * Copyright (c) 2014 ExactTarget
	 * Licensed under the BSD New license.
	 */

	var old = $.fn.wizard;

	// WIZARD CONSTRUCTOR AND PROTOTYPE

	var Wizard = sbswt.Wizard = sbswt.WidgetBase.inherit({
		klassName: "Wizard",

		init : function(element,options) {
			this.$element = $(element);
			this.options = langx.mixin({}, $.fn.wizard.defaults, options);
			this.options.disablePreviousStep = (this.$element.attr('data-restrict') === 'previous') ? true : this.options.disablePreviousStep;
			this.currentStep = this.options.selectedItem.step;
			this.numSteps = this.$element.find('.steps li').length;
			this.$prevBtn = this.$element.find('button.btn-prev');
			this.$nextBtn = this.$element.find('button.btn-next');

			var kids = this.$nextBtn.children().detach();
			this.nextText = langx.trim(this.$nextBtn.text());
			this.$nextBtn.append(kids);

			var steps = this.$element.children('.steps-container');
			// maintains backwards compatibility with < 3.8, will be removed in the future
			if (steps.length === 0) {
				steps = this.$element;
				this.$element.addClass('no-steps-container');
				if (window && window.console && window.console.warn) {
					window.console.warn('please update your wizard markup to include ".steps-container" as seen in http://getfuelux.com/javascript.html#wizard-usage-markup');
				}
			}
			steps = steps.find('.steps');

			// handle events
			this.$prevBtn.on('click.fu.wizard', langx.proxy(this.previous, this));
			this.$nextBtn.on('click.fu.wizard', langx.proxy(this.next, this));
			steps.on('click.fu.wizard', 'li.complete', langx.proxy(this.stepclicked, this));

			this.selectedItem(this.options.selectedItem);

			if (this.options.disablePreviousStep) {
				this.$prevBtn.attr('disabled', true);
				this.$element.find('.steps').addClass('previous-disabled');
			}
		},

		destroy: function () {
			this.$element.remove();
			// any external bindings [none]
			// empty elements to return to original markup [none]
			// returns string of markup
			return this.$element[0].outerHTML;
		},

		//index is 1 based
		//second parameter can be array of objects [{ ... }, { ... }] or you can pass n additional objects as args
		//object structure is as follows (all params are optional): { badge: '', label: '', pane: '' }
		addSteps: function (index) {
			var items = [].slice.call(arguments).slice(1);
			var $steps = this.$element.find('.steps');
			var $stepContent = this.$element.find('.step-content');
			var i, l, $pane, $startPane, $startStep, $step;

			index = (index === -1 || (index > (this.numSteps + 1))) ? this.numSteps + 1 : index;
			if (items[0] instanceof Array) {
				items = items[0];
			}

			$startStep = $steps.find('li:nth-child(' + index + ')');
			$startPane = $stepContent.find('.step-pane:nth-child(' + index + ')');
			if ($startStep.length < 1) {
				$startStep = null;
			}

			for (i = 0, l = items.length; i < l; i++) {
				$step = $('<li data-step="' + index + '"><span class="badge badge-info"></span></li>');
				$step.append(items[i].label || '').append('<span class="chevron"></span>');
				$step.find('.badge').append(items[i].badge || index);

				$pane = $('<div class="step-pane" data-step="' + index + '"></div>');
				$pane.append(items[i].pane || '');

				if (!$startStep) {
					$steps.append($step);
					$stepContent.append($pane);
				} else {
					$startStep.before($step);
					$startPane.before($pane);
				}

				index++;
			}

			this.syncSteps();
			this.numSteps = $steps.find('li').length;
			this.setState();
		},

		//index is 1 based, howMany is number to remove
		removeSteps: function (index, howMany) {
			var action = 'nextAll';
			var i = 0;
			var $steps = this.$element.find('.steps');
			var $stepContent = this.$element.find('.step-content');
			var $start;

			howMany = (howMany !== undefined) ? howMany : 1;

			if (index > $steps.find('li').length) {
				$start = $steps.find('li:last');
			} else {
				$start = $steps.find('li:nth-child(' + index + ')').prev();
				if ($start.length < 1) {
					action = 'children';
					$start = $steps;
				}

			}

			$start[action]().each(function () {
				var item = $(this);
				var step = item.attr('data-step');
				if (i < howMany) {
					item.remove();
					$stepContent.find('.step-pane[data-step="' + step + '"]:first').remove();
				} else {
					return false;
				}

				i++;
			});

			this.syncSteps();
			this.numSteps = $steps.find('li').length;
			this.setState();
		},

		setState: function () {
			var canMovePrev = (this.currentStep > 1);//remember, steps index is 1 based...
			var isFirstStep = (this.currentStep === 1);
			var isLastStep = (this.currentStep === this.numSteps);

			// disable buttons based on current step
			if (!this.options.disablePreviousStep) {
				this.$prevBtn.attr('disabled', (isFirstStep === true || canMovePrev === false));
			}

			// change button text of last step, if specified
			var last = this.$nextBtn.attr('data-last');
			if (last) {
				this.lastText = last;
				// replace text
				var text = this.nextText;
				if (isLastStep === true) {
					text = this.lastText;
					// add status class to wizard
					this.$element.addClass('complete');
				} else {
					this.$element.removeClass('complete');
				}

				var kids = this.$nextBtn.children().detach();
				this.$nextBtn.text(text).append(kids);
			}

			// reset classes for all steps
			var $steps = this.$element.find('.steps li');
			$steps.removeClass('active').removeClass('complete');
			$steps.find('span.badge').removeClass('badge-info').removeClass('badge-success');

			// set class for all previous steps
			var prevSelector = '.steps li:lt(' + (this.currentStep - 1) + ')';
			var $prevSteps = this.$element.find(prevSelector);
			$prevSteps.addClass('complete');
			$prevSteps.find('span.badge').addClass('badge-success');

			// set class for current step
			var currentSelector = '.steps li:eq(' + (this.currentStep - 1) + ')';
			var $currentStep = this.$element.find(currentSelector);
			$currentStep.addClass('active');
			$currentStep.find('span.badge').addClass('badge-info');

			// set display of target element
			var $stepContent = this.$element.find('.step-content');
			var target = $currentStep.attr('data-step');
			$stepContent.find('.step-pane').removeClass('active');
			$stepContent.find('.step-pane[data-step="' + target + '"]:first').addClass('active');

			// reset the wizard position to the left
			this.$element.find('.steps').first().attr('style', 'margin-left: 0');

			// check if the steps are wider than the container div
			var totalWidth = 0;
			this.$element.find('.steps > li').each(function () {
				totalWidth += $(this).outerWidth();
			});
			var containerWidth = 0;
			if (this.$element.find('.actions').length) {
				containerWidth = this.$element.width() - this.$element.find('.actions').first().outerWidth();
			} else {
				containerWidth = this.$element.width();
			}

			if (totalWidth > containerWidth) {
				// set the position so that the last step is on the right
				var newMargin = totalWidth - containerWidth;
				this.$element.find('.steps').first().attr('style', 'margin-left: -' + newMargin + 'px');

				// set the position so that the active step is in a good
				// position if it has been moved out of view
				if (this.$element.find('li.active').first().position().left < 200) {
					newMargin += this.$element.find('li.active').first().position().left - 200;
					if (newMargin < 1) {
						this.$element.find('.steps').first().attr('style', 'margin-left: 0');
					} else {
						this.$element.find('.steps').first().attr('style', 'margin-left: -' + newMargin + 'px');
					}

				}

			}

			// only fire changed event after initializing
			if (typeof (this.initialized) !== 'undefined') {
				var e = eventer.create('changed.fu.wizard');
				this.$element.trigger(e, {
					step: this.currentStep
				});
			}

			this.initialized = true;
		},

		stepclicked: function (e) {
			var li = $(e.currentTarget);
			var index = this.$element.find('.steps li').index(li);

			if (index < this.currentStep && this.options.disablePreviousStep) {//enforce restrictions
				return;
			} else {
				var evt = eventer.create('stepclicked.fu.wizard');
				this.$element.trigger(evt, {
					step: index + 1
				});
				if (evt.isDefaultPrevented()) {
					return;
				}

				this.currentStep = (index + 1);
				this.setState();
			}
		},

		syncSteps: function () {
			var i = 1;
			var $steps = this.$element.find('.steps');
			var $stepContent = this.$element.find('.step-content');

			$steps.children().each(function () {
				var item = $(this);
				var badge = item.find('.badge');
				var step = item.attr('data-step');

				if (!isNaN(parseInt(badge.html(), 10))) {
					badge.html(i);
				}

				item.attr('data-step', i);
				$stepContent.find('.step-pane[data-step="' + step + '"]:last').attr('data-step', i);
				i++;
			});
		},

		previous: function () {
			if (this.options.disablePreviousStep || this.currentStep === 1) {
				return;
			}

			var e = eventer.create('actionclicked.fu.wizard');
			this.$element.trigger(e, {
				step: this.currentStep,
				direction: 'previous'
			});
			if (e.isDefaultPrevented()) {
				return;
			}// don't increment ...what? Why?

			this.currentStep -= 1;
			this.setState();

			// only set focus if focus is still on the $nextBtn (avoid stomping on a focus set programmatically in actionclicked callback)
			if (this.$prevBtn.is(':focus')) {
				var firstFormField = this.$element.find('.active').find('input, select, textarea')[0];

				if (typeof firstFormField !== 'undefined') {
					// allow user to start typing immediately instead of having to click on the form field.
					$(firstFormField).focus();
				} else if (this.$element.find('.active input:first').length === 0 && this.$prevBtn.is(':disabled')) {
					//only set focus on a button as the last resort if no form fields exist and the just clicked button is now disabled
					this.$nextBtn.focus();
				}

			}
		},

		next: function () {
			var e = eventer.create('actionclicked.fu.wizard');
			this.$element.trigger(e, {
				step: this.currentStep,
				direction: 'next'
			});
			if (e.isDefaultPrevented()) {
				return;
			}// respect preventDefault in case dev has attached validation to step and wants to stop propagation based on it.

			if (this.currentStep < this.numSteps) {
				this.currentStep += 1;
				this.setState();
			} else {//is last step
				this.$element.trigger('finished.fu.wizard');
			}

			// only set focus if focus is still on the $nextBtn (avoid stomping on a focus set programmatically in actionclicked callback)
			if (this.$nextBtn.is(':focus')) {
				var firstFormField = this.$element.find('.active').find('input, select, textarea')[0];

				if (typeof firstFormField !== 'undefined') {
					// allow user to start typing immediately instead of having to click on the form field.
					$(firstFormField).focus();
				} else if (this.$element.find('.active input:first').length === 0 && this.$nextBtn.is(':disabled')) {
					//only set focus on a button as the last resort if no form fields exist and the just clicked button is now disabled
					this.$prevBtn.focus();
				}

			}
		},

		selectedItem: function (selectedItem) {
			var retVal, step;

			if (selectedItem) {
				step = selectedItem.step || -1;
				//allow selection of step by data-name
				step = Number(this.$element.find('.steps li[data-name="' + step + '"]').first().attr('data-step')) || Number(step);

				if (1 <= step && step <= this.numSteps) {
					this.currentStep = step;
					this.setState();
				} else {
					step = this.$element.find('.steps li.active:first').attr('data-step');
					if (!isNaN(step)) {
						this.currentStep = parseInt(step, 10);
						this.setState();
					}

				}

				retVal = this;
			} else {
				retVal = {
					step: this.currentStep
				};
				if (this.$element.find('.steps li.active:first[data-name]').length) {
					retVal.stepname = this.$element.find('.steps li.active:first').attr('data-name');
				}

			}

			return retVal;
		}

	});


	// WIZARD PLUGIN DEFINITION

	$.fn.wizard = function (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.wizard');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.wizard', (data = new Wizard(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.wizard.defaults = {
		disablePreviousStep: false,
		selectedItem: {
			step: -1
		}//-1 means it will attempt to look for "active" class in order to set the step
	};

	$.fn.wizard.Constructor = Wizard;

	$.fn.wizard.noConflict = function () {
		$.fn.wizard = old;
		return this;
	};


	// DATA-API

	/*
	$(document).on('mouseover.fu.wizard.data-api', '[data-initialize=wizard]', function (e) {
		var $control = $(e.target).closest('.wizard');
		if (!$control.data('fu.wizard')) {
			$control.wizard($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function () {
		$('[data-initialize=wizard]').each(function () {
			var $this = $(this);
			if ($this.data('fu.wizard')) return;
			$this.wizard($this.data());
		});
	});
	*/

	return $.fn.wizard ;

});

define('skylark-fuelux/main',[
    "skylark-utils/query",
    "./checkbox",
    "./combobox",
    "./datepicker",
    "./dropdown-autoflip",
    "./infinite-scroll",
    "./loader",
    "./menu",
    "./picker",
    "./pillbox",
    "./placard",
    "./radio",
    "./scheduler",
    "./search",
    "./selectlist",
    "./spinbox",
    "./toolbar",
    "./wizard"
], function($) {
    return $;
});
define('skylark-fuelux', ['skylark-fuelux/main'], function (main) { return main; });


},this);