/**
 * skylark-bs-swt - The skylark bootstrap standard widget tookit
 * @author Hudaokeji, Inc.
 * @version v0.9.0-beta
 * @link https://github.com/skylarkui/skylark-bs-swt/
 * @license MIT
 */
define(["skylark-utils/langx","skylark-utils/browser","skylark-utils/eventer","skylark-utils/noder","skylark-utils/geom","skylark-utils/query"],function(t,e,i,s,n,r){r.fn.repeater&&(r.fn.repeater.Constructor.prototype.list_clearSelectedItems=function(){this.$canvas.find(".repeater-list-check").remove(),this.$canvas.find(".repeater-list table tbody tr.selected").removeClass("selected")},r.fn.repeater.Constructor.prototype.list_highlightColumn=function(t,e){var i=this.$canvas.find(".repeater-list-wrapper > table tbody");(this.viewOptions.list_highlightSortedColumn||e)&&(i.find("td.sorted").removeClass("sorted"),i.find("tr").each(function(){var e=r(this).find("td:nth-child("+(t+1)+")").filter(function(){return!r(this).parent().hasClass("empty")});e.addClass("sorted")}))},r.fn.repeater.Constructor.prototype.list_getSelectedItems=function(){var t=[];return this.$canvas.find(".repeater-list .repeater-list-wrapper > table tbody tr.selected").each(function(){var e=r(this);t.push({data:e.data("item_data"),element:e})}),t},r.fn.repeater.Constructor.prototype.getValue=r.fn.repeater.Constructor.prototype.list_getSelectedItems,r.fn.repeater.Constructor.prototype.list_positionHeadings=function(){var t=this.$element.find(".repeater-list-wrapper"),e=t.offset().left,i=t.scrollLeft();i>0?t.find(".repeater-list-heading").each(function(){var t=r(this),i=t.parents("th:first").offset().left-e+"px";t.addClass("shifted").css("left",i)}):t.find(".repeater-list-heading").each(function(){r(this).removeClass("shifted").css("left","")})},r.fn.repeater.Constructor.prototype.list_setSelectedItems=function(t,e){var i,s,n,a,l=this.viewOptions.list_selectable,o=this,d=t;r.isArray(d)||(d=[d]);var c=function(t){n=r(this),i=n.data("item_data")||{},i[d[s].property]===d[s].value&&h(n,d[s].selected,t)},h=function(t,i,s){var n,r=void 0===i||i;r?(e||"multi"===l||o.list_clearSelectedItems(),t.hasClass("selected")||(t.addClass("selected"),(o.viewOptions.list_frozenColumns||"multi"===o.viewOptions.list_selectable)&&(n=o.$element.find(".frozen-column-wrapper tr:nth-child("+(s+1)+")"),n.addClass("selected"),n.find(".repeater-select-checkbox").addClass("checked")),o.viewOptions.list_actions&&o.$element.find(".actions-column-wrapper tr:nth-child("+(s+1)+")").addClass("selected"),t.find("td:first").prepend('<div class="repeater-list-check"><span class="glyphicon glyphicon-ok"></span></div>'))):(o.viewOptions.list_frozenColumns&&(n=o.$element.find(".frozen-column-wrapper tr:nth-child("+(s+1)+")"),n.addClass("selected"),n.find(".repeater-select-checkbox").removeClass("checked")),o.viewOptions.list_actions&&o.$element.find(".actions-column-wrapper tr:nth-child("+(s+1)+")").removeClass("selected"),t.find(".repeater-list-check").remove(),t.removeClass("selected"))};for(a=e===!0||"multi"===l?d.length:l&&d.length>0?1:0,s=0;s<a;s++)void 0!==d[s].index?(n=this.$canvas.find(".repeater-list .repeater-list-wrapper > table tbody tr:nth-child("+(d[s].index+1)+")"),n.length>0&&h(n,d[s].selected,d[s].index)):void 0!==d[s].property&&void 0!==d[s].value&&this.$canvas.find(".repeater-list .repeater-list-wrapper > table tbody tr").each(c)},r.fn.repeater.Constructor.prototype.list_sizeHeadings=function(){var t=this.$element.find(".repeater-list table");t.find("thead th").each(function(){var t=r(this),e=t.find(".repeater-list-heading");e.css({height:t.outerHeight()}),e.outerWidth(e.data("forced-width")||t.outerWidth())})},r.fn.repeater.Constructor.prototype.list_setFrozenColumns=function(){var t=this.$canvas.find(".table-frozen"),e=this.$element.find(".repeater-canvas"),i=this.$element.find(".repeater-list .repeater-list-wrapper > table"),s=this.$element.find(".repeater-list"),n=this.viewOptions.list_frozenColumns,a=this;if("multi"===this.viewOptions.list_selectable&&(n+=1,e.addClass("multi-select-enabled")),t.length<1){var l=r('<div class="frozen-column-wrapper"></div>').insertBefore(i),o=i.clone().addClass("table-frozen");o.find("th:not(:lt("+n+"))").remove(),o.find("td:not(:nth-child(n+0):nth-child(-n+"+n+"))").remove();var d=o.clone().removeClass("table-frozen");d.find("tbody").remove();var c=r('<div class="frozen-thead-wrapper"></div>').append(d),h=c.find("th label.checkbox-custom.checkbox-inline");h.attr("id",h.attr("id")+"_cloned"),l.append(o),s.append(c),this.$canvas.addClass("frozen-enabled")}this.list_sizeFrozenColumns(),r(".frozen-thead-wrapper .repeater-list-heading").on("click",function(){var t=r(this).parent("th").index();t+=1,a.$element.find(".repeater-list-wrapper > table thead th:nth-child("+t+") .repeater-list-heading")[0].click()})},r.fn.repeater.Constructor.prototype.list_positionColumns=function(){var t=this.$element.find(".repeater-canvas"),e=t.scrollTop(),i=t.scrollLeft(),s=this.viewOptions.list_frozenColumns||"multi"===this.viewOptions.list_selectable,n=this.viewOptions.list_actions,r=this.$element.find(".repeater-canvas").outerWidth(),a=this.$element.find(".repeater-list .repeater-list-wrapper > table").outerWidth(),l=this.$element.find(".table-actions")?this.$element.find(".table-actions").outerWidth():0,o=a-(r-l)>=i;e>0?t.find(".repeater-list-heading").css("top",e):t.find(".repeater-list-heading").css("top","0"),i>0?(s&&(t.find(".frozen-thead-wrapper").css("left",i),t.find(".frozen-column-wrapper").css("left",i)),n&&o&&(t.find(".actions-thead-wrapper").css("right",-i),t.find(".actions-column-wrapper").css("right",-i))):(s&&(t.find(".frozen-thead-wrapper").css("left","0"),t.find(".frozen-column-wrapper").css("left","0")),n&&(t.find(".actions-thead-wrapper").css("right","0"),t.find(".actions-column-wrapper").css("right","0")))},r.fn.repeater.Constructor.prototype.list_createItemActions=function(){var t,e,i="",s=this,n=this.$element.find(".repeater-list .repeater-list-wrapper > table"),a=this.$canvas.find(".table-actions");for(t=0,e=this.viewOptions.list_actions.items.length;t<e;t++){var l=this.viewOptions.list_actions.items[t],o=l.html;i+='<li><a href="#" data-action="'+l.name+'" class="action-item"> '+o+"</a></li>"}var d='<div class="btn-group"><button type="button" class="btn btn-xs btn-default dropdown-toggle repeater-actions-button" data-toggle="dropdown" data-flip="auto" aria-expanded="false"><span class="caret"></span></button><ul class="dropdown-menu dropdown-menu-right" role="menu">'+i+"</ul></div>";if(a.length<1){var c=r('<div class="actions-column-wrapper" style="width: '+this.list_actions_width+'px"></div>').insertBefore(n),h=n.clone().addClass("table-actions");if(h.find("th:not(:last-child)").remove(),h.find("tr td:not(:last-child)").remove(),"multi"===this.viewOptions.list_selectable||"action"===this.viewOptions.list_selectable)h.find("thead tr").html('<th><div class="repeater-list-heading">'+d+"</div></th>"),"action"!==this.viewOptions.list_selectable&&h.find("thead .btn").attr("disabled","disabled");else{var p=this.viewOptions.list_actions.label||'<span class="actions-hidden">a</span>';h.find("thead tr").addClass("empty-heading").html("<th>"+p+'<div class="repeater-list-heading">'+p+"</div></th>")}var f=h.find("td");f.each(function(t){r(this).html(d),r(this).find("a").attr("data-row",t+1)}),c.append(h),this.$canvas.addClass("actions-enabled")}this.list_sizeActionsTable(),this.$element.find(".table-actions tbody .action-item").on("click",function(t){if(!s.isDisabled){var e=r(this).data("action"),i=r(this).data("row"),n={actionName:e,rows:[i]};s.list_getActionItems(n,t)}}),this.$element.find(".table-actions thead .action-item").on("click",function(t){if(!s.isDisabled){var e=r(this).data("action"),i={actionName:e,rows:[]},n=".repeater-list-wrapper > table .selected";"action"===s.viewOptions.list_selectable&&(n=".repeater-list-wrapper > table tr"),s.$element.find(n).each(function(t){i.rows.push(t+1)}),s.list_getActionItems(i,t)}})},r.fn.repeater.Constructor.prototype.list_getActionItems=function(t,e){for(var i=[],s=r.grep(this.viewOptions.list_actions.items,function(e){return e.name===t.actionName})[0],n=0,a=t.rows.length;n<a;n++){var l=this.$canvas.find(".repeater-list-wrapper > table tbody tr:nth-child("+t.rows[n]+")");i.push({item:l,rowData:l.data("item_data")})}if(1===i.length&&(i=i[0]),s.clickAction){var o=function(){};s.clickAction(i,o,e)}},r.fn.repeater.Constructor.prototype.list_sizeActionsTable=function(){var t=this.$element.find(".repeater-list table.table-actions"),e=t.find("thead tr th"),i=this.$element.find(".repeater-list-wrapper > table");e.outerHeight(i.find("thead tr th").outerHeight()),e.find(".repeater-list-heading").outerHeight(e.outerHeight()),t.find("tbody tr td:first-child").each(function(t){r(this).outerHeight(i.find("tbody tr:eq("+t+") td").outerHeight())})},r.fn.repeater.Constructor.prototype.list_sizeFrozenColumns=function(){var t=this.$element.find(".repeater-list .repeater-list-wrapper > table");this.$element.find(".repeater-list table.table-frozen tr").each(function(e){r(this).height(t.find("tr:eq("+e+")").height())});var e=t.find("td:eq(0)").outerWidth();this.$element.find(".frozen-column-wrapper, .frozen-thead-wrapper").width(e)},r.fn.repeater.Constructor.prototype.list_frozenOptionsInitialize=function(){function t(t){n.list_revertingCheckbox=!0,t.checkbox("toggle"),delete n.list_revertingCheckbox}var e=this.$element.find(".frozen-column-wrapper .checkbox-inline"),i=this.$element.find(".header-checkbox .checkbox-custom"),s=this.$element.find(".repeater-list table"),n=this;this.$element.find("tr.selectable").on("mouseover mouseleave",function(t){var e=r(this).index();e+=1,"mouseover"===t.type?s.find("tbody tr:nth-child("+e+")").addClass("hovered"):s.find("tbody tr:nth-child("+e+")").removeClass("hovered")}),i.checkbox(),e.checkbox();var a=this.$element.find(".table-frozen tbody .checkbox-inline"),l=this.$element.find(".frozen-thead-wrapper thead .checkbox-inline input");a.on("change",function(e){if(e.preventDefault(),!n.list_revertingCheckbox)if(n.isDisabled)t(r(e.currentTarget));else{var i=r(this).attr("data-row");i=parseInt(i,10)+1,n.$element.find(".repeater-list-wrapper > table tbody tr:nth-child("+i+")").click();var s=n.$element.find(".table-frozen tbody .checkbox-inline.checked").length;0===s?(l.prop("checked",!1),l.prop("indeterminate",!1)):s===a.length?(l.prop("checked",!0),l.prop("indeterminate",!1)):(l.prop("checked",!1),l.prop("indeterminate",!0))}}),l.on("change",function(i){n.list_revertingCheckbox||(n.isDisabled?t(r(i.currentTarget)):r(this).is(":checked")?(n.$element.find(".repeater-list-wrapper > table tbody tr:not(.selected)").click(),n.$element.trigger("selected.fu.repeaterList",e)):(n.$element.find(".repeater-list-wrapper > table tbody tr.selected").click(),n.$element.trigger("deselected.fu.repeaterList",e)))})},r.fn.repeater.defaults=t.mixin({},r.fn.repeater.defaults,{list_columnRendered:null,list_columnSizing:!0,list_columnSyncing:!0,list_highlightSortedColumn:!0,list_infiniteScroll:!1,list_noItemsHTML:"no items found",list_selectable:!1,list_sortClearing:!1,list_rowRendered:null,list_frozenColumns:0,list_actions:!1}),r.fn.repeater.viewTypes.list={cleared:function(){this.viewOptions.list_columnSyncing&&this.list_sizeHeadings()},dataOptions:function(t){return this.list_sortDirection&&(t.sortDirection=this.list_sortDirection),this.list_sortProperty&&(t.sortProperty=this.list_sortProperty),t},enabled:function(t){this.viewOptions.list_actions&&(t.status?(this.$canvas.find(".repeater-actions-button").removeAttr("disabled"),v.call(this)):this.$canvas.find(".repeater-actions-button").attr("disabled","disabled"))},initialize:function(t,e){this.list_sortDirection=null,this.list_sortProperty=null,this.list_specialBrowserClass=u(),this.list_actions_width=void 0!==this.viewOptions.list_actions.width?this.viewOptions.list_actions.width:37,this.list_noItems=!1,e()},resize:function(){f.call(this,this.$element.find(".repeater-list-wrapper > table thead tr")),this.viewOptions.list_actions&&this.list_sizeActionsTable(),(this.viewOptions.list_frozenColumns||"multi"===this.viewOptions.list_selectable)&&this.list_sizeFrozenColumns(),this.viewOptions.list_columnSyncing&&this.list_sizeHeadings()},selected:function(){var t,e=this.viewOptions.list_infiniteScroll;this.list_firstRender=!0,this.$loader.addClass("noHeader"),e&&(t="object"==typeof e?e:{},this.infiniteScrolling(!0,t))},before:function(t){var e,i=t.container.find(".repeater-list"),s=this;return t.data.count>0?this.list_noItems=!1:this.list_noItems=!0,i.length<1&&(i=r('<div class="repeater-list '+this.list_specialBrowserClass+'" data-preserve="shallow"><div class="repeater-list-wrapper" data-infinite="true" data-preserve="shallow"><table aria-readonly="true" class="table" data-preserve="shallow" role="grid"></table></div></div>'),i.find(".repeater-list-wrapper").on("scroll.fu.repeaterList",function(){s.viewOptions.list_columnSyncing&&s.list_positionHeadings()}),(s.viewOptions.list_frozenColumns||s.viewOptions.list_actions||"multi"===s.viewOptions.list_selectable)&&t.container.on("scroll.fu.repeaterList",function(){s.list_positionColumns()}),t.container.append(i)),t.container.removeClass("actions-enabled actions-enabled multi-select-enabled"),e=i.find("table"),p.call(this,e,t.data),h.call(this,e,t.data),!1},renderItem:function(t){return c.call(this,t.container,t.subset,t.index),!1},after:function(){var t;return!this.viewOptions.list_frozenColumns&&"multi"!==this.viewOptions.list_selectable||this.list_noItems||this.list_setFrozenColumns(),this.viewOptions.list_actions&&!this.list_noItems&&(this.list_createItemActions(),this.list_sizeActionsTable()),!this.viewOptions.list_frozenColumns&&!this.viewOptions.list_actions&&"multi"!==this.viewOptions.list_selectable||this.list_noItems||(this.list_positionColumns(),this.list_frozenOptionsInitialize()),this.viewOptions.list_columnSyncing&&(this.list_sizeHeadings(),this.list_positionHeadings()),t=this.$canvas.find(".repeater-list-wrapper > table .repeater-list-heading.sorted"),t.length>0&&this.list_highlightColumn(t.data("fu_item_index")),!1}});var a=function(t,e){if(!e)return!1;if(!t||e.length!==t.length)return!0;for(var i=0,s=e.length;i<s;i++){if(!t[i])return!0;for(var n in e[i])if(e[i].hasOwnProperty(n)&&t[i][n]!==e[i][n])return!0}return!1},l=function(t,e,i,s,n){var a=s[n].className,l=e[i][s[n].property],o=r("<td></td>"),d=s[n]._auto_width,c=s[n].property;if(this.viewOptions.list_actions!==!1&&"@_ACTIONS_@"===c&&(l='<div class="repeater-list-actions-placeholder" style="width: '+this.list_actions_width+'px"></div>'),l=void 0!==l?l:"",o.addClass(void 0!==a?a:"").append(l),void 0!==d&&o.outerWidth(d),t.append(o),"multi"===this.viewOptions.list_selectable&&"@_CHECKBOX_@"===s[n].property){var h='<label data-row="'+i+'" class="checkbox-custom checkbox-inline body-checkbox repeater-select-checkbox"><input class="sr-only" type="checkbox"></label>';o.html(h)}return o},o=function(t,e,i){var s,n,a,l,o,d="glyphicon-chevron-down",c=".glyphicon.rlc:first",h="glyphicon-chevron-up",p=r('<div class="repeater-list-heading"><span class="glyphicon rlc"></span></div>'),f=(this.$element.attr("id")+"_"||"")+"checkall",u='<div class="repeater-list-heading header-checkbox"><label id="'+f+'" class="checkbox-custom checkbox-inline"><input class="sr-only" type="checkbox" value=""><span class="checkbox-label">&nbsp;</span></label></div>',v=r("<th></th>"),m=this;if(p.data("fu_item_index",i),p.prepend(e[i].label),v.html(p.html()).find("[id]").removeAttr("id"),"@_CHECKBOX_@"!==e[i].property?v.append(p):v.append(u),s=v.add(p),l=p.find(c),o=l.add(v.find(c)),this.viewOptions.list_actions&&"@_ACTIONS_@"===e[i].property){var _=this.list_actions_width;v.css("width",_),p.css("width",_)}n=e[i].className,void 0!==n&&s.addClass(n),a=e[i].sortable,a&&(s.addClass("sortable"),p.on("click.fu.repeaterList",function(){m.isDisabled||(m.list_sortProperty="string"==typeof a?a:e[i].property,p.hasClass("sorted")?l.hasClass(h)?(o.removeClass(h).addClass(d),m.list_sortDirection="desc"):m.viewOptions.list_sortClearing?(s.removeClass("sorted"),o.removeClass(d),m.list_sortDirection=null,m.list_sortProperty=null):(o.removeClass(d).addClass(h),m.list_sortDirection="asc"):(t.find("th, .repeater-list-heading").removeClass("sorted"),o.removeClass(d).addClass(h),m.list_sortDirection="asc",s.addClass("sorted")),m.render({clearInfinite:!0,pageIncrement:null}))})),"asc"!==e[i].sortDirection&&"desc"!==e[i].sortDirection||(t.find("th, .repeater-list-heading").removeClass("sorted"),s.addClass("sortable sorted"),"asc"===e[i].sortDirection?(o.addClass(h),this.list_sortDirection="asc"):(o.addClass(d),this.list_sortDirection="desc"),this.list_sortProperty="string"==typeof a?a:e[i].property),t.append(v)},d=function(t){var e="multi"===t.viewOptions.list_selectable,i=t.viewOptions.list_actions,s=t.$element;if(!t.isDisabled){var n=r(this),a=r(this).index()+1,l=s.find(".frozen-column-wrapper tr:nth-child("+a+")"),o=s.find(".actions-column-wrapper tr:nth-child("+a+")"),d=s.find(".frozen-column-wrapper tr:nth-child("+a+") .checkbox-inline");n.is(".selected")?(n.removeClass("selected"),e?(d.click(),l.removeClass("selected"),i&&o.removeClass("selected")):n.find(".repeater-list-check").remove(),s.trigger("deselected.fu.repeaterList",n)):(e?(d.click(),n.addClass("selected"),l.addClass("selected"),i&&o.addClass("selected")):(t.$canvas.find(".repeater-list-check").remove(),t.$canvas.find(".repeater-list tbody tr.selected").each(function(){r(this).removeClass("selected"),s.trigger("deselected.fu.repeaterList",r(this))}),n.find("td:first").prepend('<div class="repeater-list-check"><span class="glyphicon glyphicon-ok"></span></div>'),n.addClass("selected"),l.addClass("selected")),s.trigger("selected.fu.repeaterList",n)),v.call(t)}},c=function(t,e,i){var s=r("<tr></tr>");if(this.viewOptions.list_selectable&&(s.data("item_data",e[i]),"action"!==this.viewOptions.list_selectable)){s.addClass("selectable"),s.attr("tabindex",0);var n=this;s.on("click.fu.repeaterList",function(){d.call(this,n)}),s.keyup(function(t){13===t.keyCode&&s.trigger("click.fu.repeaterList")})}this.viewOptions.list_actions&&!this.viewOptions.list_selectable&&s.data("item_data",e[i]);for(var a=[],o=0,c=this.list_columns.length;o<c;o++)a.push(l.call(this,s,e,i,this.list_columns,o));if(t.append(s),this.viewOptions.list_columnRendered)for(var h=0,p=a.length;h<p;h++)"@_CHECKBOX_@"!==this.list_columns[h].property&&"@_ACTIONS_@"!==this.list_columns[h].property&&this.viewOptions.list_columnRendered({container:s,columnAttr:this.list_columns[h].property,item:a[h],rowData:e[i]},function(){});this.viewOptions.list_rowRendered&&this.viewOptions.list_rowRendered({container:t,item:s,rowData:e[i]},function(){})},h=function(t,e){var i,s=t.find("tbody");s.length<1&&(s=r('<tbody data-container="true"></tbody>'),t.append(s)),"string"==typeof e.error&&e.error.length>0?(i=r('<tr class="empty text-danger"><td colspan="'+this.list_columns.length+'"></td></tr>'),i.find("td").append(e.error),s.append(i)):e.items&&e.items.length<1&&(i=r('<tr class="empty"><td colspan="'+this.list_columns.length+'"></td></tr>'),i.find("td").append(this.viewOptions.list_noItemsHTML),s.append(i))},p=function(t,e){var i,s,n,l=e.columns||[],d=t.find("thead");if(this.list_firstRender||a(this.list_columns,l)||0===d.length){if(d.remove(),"multi"===this.viewOptions.list_selectable&&!this.list_noItems){var c={label:"c",property:"@_CHECKBOX_@",sortable:!1};l.splice(0,0,c)}if(this.list_columns=l,this.list_firstRender=!1,this.$loader.removeClass("noHeader"),this.viewOptions.list_actions){var h={label:this.viewOptions.list_actions.label||'<span class="actions-hidden">a</span>',property:"@_ACTIONS_@",sortable:!1,width:this.list_actions_width};l.push(h)}for(d=r('<thead data-preserve="deep"><tr></tr></thead>'),n=d.find("tr"),i=0,s=l.length;i<s;i++)o.call(this,n,l,i);if(t.prepend(d),"multi"===this.viewOptions.list_selectable&&!this.list_noItems){var p=this.$element.find(".repeater-list-wrapper .header-checkbox").outerWidth(),u=r.grep(l,function(t){return"@_CHECKBOX_@"===t.property})[0];u.width=p}f.call(this,n)}},f=function(t){var e,i,s,n,a=[],l=this;if(this.viewOptions.list_columnSizing&&(e=0,n=0,t.find("th").each(function(){var t,i=r(this);if(void 0!==l.list_columns[e].width)t=l.list_columns[e].width,i.outerWidth(t),n+=i.outerWidth(),l.list_columns[e]._auto_width=t;else{var s=i.find(".repeater-list-heading").outerWidth();a.push({col:i,index:e,minWidth:s})}e++}),i=a.length,i>0)){var o=this.$canvas.find(".repeater-list-wrapper").outerWidth();for(s=Math.floor((o-n)/i),e=0;e<i;e++)a[e].minWidth>s&&(s=a[e].minWidth),a[e].col.outerWidth(s),this.list_columns[a[e].index]._auto_width=s}},u=function(){var t=window.navigator.userAgent,e=t.indexOf("MSIE "),i=t.indexOf("Firefox");return e>0?"ie-"+parseInt(t.substring(e+5,t.indexOf(".",e)),10):i>0?"firefox":""},v=function(){var t,e=".repeater-list-wrapper > table .selected",i=this.$element.find(".table-actions");"action"===this.viewOptions.list_selectable&&(e=".repeater-list-wrapper > table tr"),t=this.$canvas.find(e),t.length>0?i.find("thead .btn").removeAttr("disabled"):i.find("thead .btn").attr("disabled","disabled")}});
//# sourceMappingURL=sourcemaps/repeater-list.js.map
