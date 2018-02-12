/**
 * skylark-bs-swt - The skylark bootstrap standard widget tookit
 * @author Hudaokeji, Inc.
 * @version v0.9.0-beta
 * @link https://github.com/skylarkui/skylark-bs-swt/
 * @license MIT
 */
define(["skylark-utils/langx","skylark-utils/browser","skylark-utils/eventer","skylark-utils/noder","skylark-utils/geom","skylark-utils/velm","skylark-utils/query","../../tree","../../sbswt"],function(e,t,i,r,s,n,d,a,o){var l=/^\s*$/g,h=/[\\:&!^|()\[\]<>@*'+~#";,= \/${}%]/g,c=function(e){return(e||"").replace(h,"\\$&")},g="data-jstreegrid",u="data-jstreegrid-column",p="jstree-search",f="_DATA_",m=!1,v=10,_=function(e,t){return"jstree_"+e+"_grid_"+c(t)+"_col"},j=function(e){return d.makeArray(e.map(function(){return this.id}))},w=function(e,t,i,r){if(void 0==r&&(r=d()),null===t||void 0===t||0===t.length)return r;var s,n=d(),a=[].concat(i);return"string"==typeof t?(s=_(e,t),n=a.map(function(e){return"#"+s+e}).join(", ")):(n=[],t.forEach(function(t,i){var r=_(e,t);n=n.concat(a.map(function(e){return"#"+r+e}))}),n=n.join(", ")),1==a.length?r.find(n):d(n)},x=!1,C=null,y=0,b=0,S=/<\/?[^>]+>/gi,k=function(e,t,i,r,s){var n,a;if(r.data=d.extend(!0,{},t.data),t&&t.children_d&&s)for(n=0,a=t.children_d.length;n<a;n++)k(e,e.get_node(t.children_d[n]),i,i.get_node(r.children_d[n]),s)},W=function(e,t){var i,r=e.get_node(t),s=r.children;return i=!s||s.length<=0||!r.state.opened?t:W(e,s[s.length-1])},M=function(e,t,i){var r,s=e.hasClass("jstree-anchor")?e:e.children("[class~='jstree-anchor']"),n=i.settings.grid.columns[0];r="",n.title&&(n.title===f?r=i.get_text(t):t.attr(n.title)&&(r=t.attr(n.title))),r=r.replace(S,""),r&&s.attr("title",r)},z=function(e,t){var i;return i=void 0!==e&&null!==e?"function"==typeof e?e(t):null!==t.data&&void 0!==t.data&&void 0!==t.data[e]?t.data[e]:"":""};return d.jstree.defaults.grid={width:"auto"},d.jstree.plugins.grid=function(e,t){function r(){function e(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return e()+e()+"-"+e()+"-"+e()+"-"+e()+"-"+e()+e()+e()}this._initialize=function(){if(!this._initialized){var e,t,i=this.settings.grid||{},r=this.element,s=this._gridSettings={columns:i.columns||[],treeClass:"jstree-grid-col-0",context:i.contextmenu||!1,columnWidth:i.columnWidth,defaultConf:{"*display":"inline","*+display":"inline"},isThemeroller:!!this._data.themeroller,treeWidthDiff:0,resizable:i.resizable,draggable:i.draggable,stateful:i.stateful,indent:0,sortOrder:"text",sortAsc:!0,caseInsensitive:i.caseInsensitive,fixedHeader:i.fixedHeader!==!1,width:i.width,height:i.height,gridcontextmenu:i.gridcontextmenu,treecol:0,gridcols:[]},n=s.columns,a=0,o=!1;s.gridcontextmenu===!0?s.gridcontextmenu=function(e,t,i,r,s,n,d){return{edit:{label:"Edit",action:function(t){var r=n.get_node(i);e._edit(r,s,d)}}}}:s.gridcontextmenu===!1&&(s.gridcontextmenu=!1);for(var t=0,l=i.columns.length;t<l;t++)i.columns[t].tree?(a=t,s.treecol=a):s.gridcols.push(t);this.uniq=Math.ceil(1e3*Math.random()),this.rootid=r.attr("id");var h=/msie/.test(navigator.userAgent.toLowerCase());if(h){var c=parseFloat(navigator.appVersion.split("MSIE")[1]);c<8&&(s.defaultConf.display="inline",s.defaultConf.zoom="1")}m||(m=!0,e=[".jstree-grid-cell {vertical-align: top; overflow:hidden;margin-left:0;position:relative;width: 100%;padding-left:7px;white-space: nowrap;}",".jstree-grid-cell span {margin-right:0px;margin-right:0px;*display:inline;*+display:inline;white-space: nowrap;}",".jstree-grid-separator {position:absolute; top:0; right:0; height:24px; margin-left: -2px; border-width: 0 2px 0 0; *display:inline; *+display:inline; margin-right:0px;width:0px;}",".jstree-grid-header-cell {overflow: hidden; white-space: nowrap;padding: 1px 3px 2px 5px; cursor: default;}",".jstree-grid-header-themeroller {border: 0; padding: 1px 3px;}",".jstree-grid-header-regular {position:relative; background-color: #EBF3FD; z-index: 1;}",".jstree-grid-hidden {display: none;}",".jstree-grid-resizable-separator {cursor: col-resize; width: 2px;}",".jstree-grid-separator-regular {border-color: #d0d0d0; border-style: solid;}",".jstree-grid-cell-themeroller {border: none !important; background: transparent !important;}",".jstree-grid-wrapper {table-layout: fixed; width: 100%; overflow: auto; position: relative;}",".jstree-grid-midwrapper {display: table-row;}",".jstree-grid-width-auto {width:auto;display:block;}",".jstree-grid-column {display: table-cell; overflow: hidden;}",".jstree-grid-ellipsis {text-overflow: ellipsis;}",".jstree-grid-col-0 {width: 100%;}"],d('<style type="text/css">'+e.join("\n")+"</style>").appendTo("head")),this.gridWrapper=d("<div></div>").addClass("jstree-grid-wrapper").insertAfter(r),this.midWrapper=d("<div></div>").addClass("jstree-grid-midwrapper").appendTo(this.gridWrapper),i.width&&this.gridWrapper.width(i.width),i.height&&this.gridWrapper.height(i.height);for(var t=0,l=n.length;t<l;t++)d("<div></div>").addClass("jstree-default jstree-grid-column jstree-grid-column-"+t+" jstree-grid-column-root-"+this.rootid).appendTo(this.midWrapper);this.midWrapper.children("div:eq("+a+")").append(r),r.addClass("jstree-grid-cell"),s.fixedHeader&&this.gridWrapper.scroll(function(){d(this).find(".jstree-grid-header").css("top",d(this).scrollTop())});var g=d.proxy(this.settings.sort,this);if(this.settings.sort=function(e,t){var i,r=this.colrefs;if("text"===s.sortOrder){var n=this.get_text(e).toLowerCase().localeCompare(this.get_text(t).toLowerCase());i=s.caseInsensitive?1===n:1===g(e,t)}else{var d=this.get_node(e),a=this.get_node(t),o=r[s.sortOrder].value,l="function"==typeof o?o(d):d.data[o],h="function"==typeof o?o(a):a.data[o];"undefined"!=typeof h&&(i=s.caseInsensitive?l.toLowerCase()>h.toLowerCase():l>h)}return s.sortAsc||(i=!i),i?1:-1},s.draggable)if(d.ui&&d.ui.sortable){var u,p;d(this.midWrapper).sortable({axis:"x",handle:".jstree-grid-header",cancel:".jstree-grid-separator",start:function(e,t){u=t.item.index()},stop:function(e,t){p=t.item.index(),s.columns.splice(p,0,s.columns.splice(u,1)[0])}})}else console.warn("[jstree-grid] draggable option requires jQuery UI");this.searchColumn=function(e){var t={};if("object"==typeof e)for(var i in e)e.hasOwnProperty(i)&&i%1===0&&i<n.length&&i>=0&&(t[i]=e[i]);o=t,0!==Object.keys(t).length?this.search("someValue"):this.search(""),o=!1};for(var t=0,l=n.length;t<l;t++){var f=n[t];"function"!=typeof f.search_callback&&(f.search_callback=function(e,t,i,r){var s=new d.vakata.search(e,(!0),{caseSensitive:v.case_sensitive,fuzzy:v.fuzzy});return s.search(t).isMatch})}var v=this.settings.search,_=v.search_callback;_||(_=function(e,t){var i,r,s=new d.vakata.search(e,(!0),{caseSensitive:v.case_sensitive,fuzzy:v.fuzzy}),o=s.search(t.text).isMatch;if(!o)for(var i=0,l=n.length;i<l&&!(a!==i&&(r=n[i],o=s.search(z(r.value,t)).isMatch));i++);return o}),v.search_callback=function(e,t){var i=!1;if(o){for(var s in o)if(o.hasOwnProperty(s)){var d=o[s];if(""==d)continue;var l=n[s];if(i=a==s?l.search_callback(d,t.text,t,l):l.search_callback(d,z(l.value,t),t,l),!i)break}r.trigger("columnSearch_grid.jstree")}else i=_(e,t),r.trigger("omniSearch_grid.jstree");return i},this._initialized=!0}},this.init=function(e,i){t.init.call(this,e,i),this._initialize()},this.bind=function(){t.bind.call(this),this._initialize(),this.element.on("move_node.jstree create_node.jstree clean_node.jstree change_node.jstree",d.proxy(function(e,t){var i=this.get_node(t||"#",!0),s=r();this._detachColumns(s),this._prepare_grid(i),this._reattachColumns(s)},this)).on("delete_node.jstree",d.proxy(function(e,t){if(void 0!==t.node.id){var i=(this.gridWrapper,[t.node.id]);t.node&&t.node.children_d&&(i=i.concat(t.node.children_d)),w(this.uniq,i,this._gridSettings.gridcols).remove()}},this)).on("show_node.jstree",d.proxy(function(e,t){this._hideOrShowTree(t.node,!1)},this)).on("hide_node.jstree",d.proxy(function(e,t){this._hideOrShowTree(t.node,!0)},this)).on("close_node.jstree",d.proxy(function(e,t){this._hide_grid(t.node)},this)).on("open_node.jstree",d.proxy(function(e,t){},this)).on("load_node.jstree",d.proxy(function(e,t){},this)).on("loaded.jstree",d.proxy(function(e){this._prepare_headers(),this.element.trigger("loaded_grid.jstree")},this)).on("ready.jstree",d.proxy(function(e,t){var i,r=this.element.find("[class~='jstree-anchor']:first").outerHeight(),s=this.element.attr("class")||"";d('<style type="text/css">div.jstree-grid-cell-root-'+this.rootid+" {line-height: "+r+"px; height: "+r+"px;}</style>").appendTo("head"),i=s.split(/\s+/).map(function(e){var t=e.match(/^jstree(-|$)/);return t?"":e}),this.gridWrapper.addClass(i.join(" "))},this)).on("move_node.jstree",d.proxy(function(e,t){var i=t.new_instance.element;i.find("li > a").each(d.proxy(function(e,t){},this))},this)).on("hover_node.jstree",d.proxy(function(e,t,i){var r=t.node.id;null!==this._hover_node&&void 0!==this._hover_node&&w(this.uniq,this._hover_node,this._gridSettings.gridcols).removeClass("jstree-hovered"),this._hover_node=r,w(this.uniq,r,this._gridSettings.gridcols).addClass("jstree-hovered")},this)).on("dehover_node.jstree",d.proxy(function(e,t,i){var r=t.node.id;this._hover_node=null,w(this.uniq,r,this._gridSettings.gridcols).removeClass("jstree-hovered")},this)).on("select_node.jstree",d.proxy(function(e,t,i){var r=t.node.id;w(this.uniq,r,this._gridSettings.gridcols).addClass("jstree-clicked"),this.get_node(t.node.id,!0).children("div.jstree-grid-cell").addClass("jstree-clicked")},this)).on("deselect_node.jstree",d.proxy(function(e,t,i){var r=t.node.id;w(this.uniq,r,this._gridSettings.gridcols).removeClass("jstree-clicked")},this)).on("deselect_all.jstree",d.proxy(function(e,t,i){var r=t.node||[];w(this.uniq,r,this._gridSettings.gridcols).removeClass("jstree-clicked")},this)).on("search.jstree",d.proxy(function(e,t){var i,s,n=this.gridWrapper,a=this,o=(new Date).getTime(),l=j(t.nodes.filter(".jstree-node"));if(this.holdingCells={},t.nodes.length){var h=r(),c=n.find("div.jstree-grid-cell-regular");this._detachColumns(h),this._data.search.som&&(this._data.search.smc&&(i=t.nodes.add(t.nodes.find(".jstree-node"))),i=(i||t.nodes).add(t.nodes.parentsUntil(".jstree")),c.hide(),i.filter(".jstree-node").each(function(e,t){var i=t.id;if(i){a._prepare_grid(t);for(var e=0,r=a._gridSettings.gridcols.length;e<r;e++)e!==a._gridSettings.treecol&&w(a.uniq,i,a._gridSettings.gridcols[e],d(a._domManipulation.columns[e])).show()}}));for(var g=0,u=this._gridSettings.gridcols.length;g<u;g++)g!==this._gridSettings.treecol&&w(a.uniq,l,this._gridSettings.gridcols[g],d(this._domManipulation.columns[g])).addClass(p);this._reattachColumns(h),s=(new Date).getTime(),this.element.trigger("search-complete.jstree-grid",[{time:s-o}])}return!0},this)).on("clear_search.jstree",d.proxy(function(e,t){var i=this.gridWrapper,r=j(t.nodes.filter(".jstree-node"));return i.find("div.jstree-grid-cell").show(),w(this.uniq,r,this._gridSettings.gridcols).removeClass(p),!0},this)).on("copy_node.jstree",function(e,t){var i=t.new_instance,r=t.old_instance,s=i.get_node(t.node,!0);return k(r,t.original,i,t.node,!0),i._detachColumns(s.id),i._prepare_grid(s),i._reattachColumns(s.id),!0}).on("show_ellipsis.jstree",d.proxy(function(e,t){return this.gridWrapper.find(".jstree-grid-cell").add(".jstree-grid-header",this.gridWrapper).addClass("jstree-grid-ellipsis"),!0},this)).on("hide_ellipsis.jstree",d.proxy(function(e,t){return this.gridWrapper.find(".jstree-grid-cell").add(".jstree-grid-header",this.gridWrapper).removeClass("jstree-grid-ellipsis"),!0},this)),this._gridSettings.isThemeroller&&this.element.on("select_node.jstree",d.proxy(function(e,t){t.rslt.obj.children("[class~='jstree-anchor']").nextAll("div").addClass("ui-state-active")},this)).on("deselect_node.jstree deselect_all.jstree",d.proxy(function(e,t){t.rslt.obj.children("[class~='jstree-anchor']").nextAll("div").removeClass("ui-state-active")},this)).on("hover_node.jstree",d.proxy(function(e,t){t.rslt.obj.children("[class~='jstree-anchor']").nextAll("div").addClass("ui-state-hover")},this)).on("dehover_node.jstree",d.proxy(function(e,t){t.rslt.obj.children("[class~='jstree-anchor']").nextAll("div").removeClass("ui-state-hover")},this)),this._gridSettings.stateful&&this.element.on("resize_column.jstree-grid",d.proxy(function(e,t,i){localStorage["jstree-root-"+this.rootid+"-column-"+t]=i},this))},this.teardown=function(){var e=this.gridWrapper,i=this.element,r=e.parent();i.detach(),e.remove(),r.append(i),t.teardown.call(this)},this._clean_grid=function(e,t){var i=this.gridWrapper;e?w(this.uniq,t,this._gridSettings.gridcols).remove():i.find("div.jstree-grid-cell-regular").remove()},this._prepare_headers=function(){var e,t,i,r,s,n,a,o,l,h,c,g=this,p=this._gridSettings,f=p.columns||[],m=p.columnWidth,_=p.resizable||!1,j=p.isThemeroller,w=j?"themeroller":"regular",S=!1,k=this.gridparent,W=this.rootid,M=p.defaultConf,z=0,q=0;this.parent=k,this.colrefs={};for(var t=0,A=f.length;t<A;t++){s=f[t].headerClass||"",n=f[t].columnClass||"",a=f[t].header||"";do c=String(Math.floor(1e4*Math.random()));while(void 0!==this.colrefs[c]);o=f[t].value?c:"text",this.colrefs[o]=f[t],a&&(S=!0),r=p.stateful&&localStorage["jstree-root-"+W+"-column-"+t]?localStorage["jstree-root-"+W+"-column-"+t]:f[t].width||m;var T=f[t].minWidth||r,O=f[t].maxWidth||r;z=j?7:10,"auto"!==r&&"string"!=typeof r&&(r-=z),i=this.midWrapper.children("div.jstree-grid-column-"+t),l=d("<div></div>").css(M).addClass("jstree-grid-div-"+this.uniq+"-"+t+" "+(j?"ui-widget-header ":"")+" jstree-grid-header jstree-grid-header-cell jstree-grid-header-"+w+" "+s+" "+n).html(a),l.addClass((j?"ui-widget-header ":"")+"jstree-grid-header jstree-grid-header-"+w),this.settings.core.themes.ellipsis===!0&&l.addClass("jstree-grid-ellipsis"),l.prependTo(i),l.attr(u,o),q+=l.outerWidth(),h=d("<div class='jstree-grid-separator jstree-grid-separator-"+w+(j?" ui-widget-header":"")+(_?" jstree-grid-resizable-separator":"")+"'>&nbsp;</div>").appendTo(l),i.width(r),i.css("min-width",T),i.css("max-width",O)}l.addClass((j?"ui-widget-header ":"")+"jstree-grid-header jstree-grid-header-last jstree-grid-header-"+w),void 0===f[f.length-1].width&&(q-=r,i.css({width:"auto"}),l.addClass("jstree-grid-width-auto").next(".jstree-grid-separator").remove()),S?p.header=e:d("div.jstree-grid-header").hide(),!this.bound&&_&&(this.bound=!0,d(document).mouseup(function(){var e,t,i,r,s,n;x&&(n=C.prevAll(".jstree-grid-column").length,s=C.closest(".jstree-grid-wrapper").find(".jstree"),e=d.jstree.reference(s),t=e.settings.grid.columns,r=C.parent().children("div.jstree-grid-column"),(isNaN(n)||n<0)&&(e._gridSettings.treeWidthDiff=s.find("ins:eq(0)").width()+s.find("[class~='jstree-anchor']:eq(0)").width()-e._gridSettings.columns[0].width),i=e._gridSettings.columns[n].width=parseFloat(C.css("width")),x=!1,C=null,s.trigger("resize_column.jstree-grid",[n,i]))}).mousemove(function(e){if(x){b=e.pageX;var t,i,r,s=b-y;0!==s&&(t=C.width(),i=parseFloat(C.css("width")),i||(i=C.innerWidth()),s=s<0?Math.max(s,-t):s,r=i+s,(s>0||t>0)&&r>v&&(C.width(r+"px"),C.css("min-width",r+"px"),C.css("max-width",r+"px"),y=b))}}),this.gridWrapper.on("selectstart",".jstree-grid-resizable-separator",function(){return!1}).on("mousedown",".jstree-grid-resizable-separator",function(e){return x=!0,y=e.pageX,C=d(this).closest("div.jstree-grid-column"),!1}).on("dblclick",".jstree-grid-resizable-separator",function(e){var t,i,r=d(this),s=r.closest("div.jstree-grid-column"),n=parseFloat(s.css("width")),a=0,o=s.prevAll(".jstree-grid-column").length,l=s.width();s.find(".jstree-grid-cell").each(function(){var e,t=d(this);t.css("position","absolute"),t.css("width","auto"),e=t.outerWidth(),t.css("position","relative"),e>a&&(a=e)}),t=a-n,t=t<0?Math.max(t,-l):t,i=n+t+"px",s.width(i),s.css("min-width",i),s.css("max-width",i),d(this).closest(".jstree-grid-wrapper").find(".jstree").trigger("resize_column.jstree-grid",[o,i])}).on("click",".jstree-grid-separator",function(e){e.stopPropagation()})),this.gridWrapper.on("click",".jstree-grid-header-cell",function(e){if(g.sort){var t,i=d(this).attr(u);p.sortOrder===i&&p.sortAsc===!0?(p.sortAsc=!1,t="&darr;"):(p.sortOrder=i,p.sortAsc=!0,t="&uarr;"),d(this.closest(".jstree-grid-wrapper")).find(".jstree-grid-sort-icon").remove(),d("<span></span>").addClass("jstree-grid-sort-icon").appendTo(d(this)).html(t);var r=g.get_node("#");g.sort(r,!0),g.redraw_node(r,!0)}})},this._domManipulation=null,this._detachColumns=function(e){if(null==this._domManipulation){var t=this._gridSettings.columns||[],i=(this._gridSettings.treecol,this.midWrapper);this._domManipulation={id:e,columns:{}};for(var r=0,s=t.length;r<s;r++)this._domManipulation.columns[r]=i.children(".jstree-grid-column-"+r)[0],this._domManipulation.columns[r].parentNode.removeChild(this._domManipulation.columns[r])}return this._domManipulation},this._reattachColumns=function(e){if(null==this._domManipulation)return!1;if(this._domManipulation.id===e){for(var t=this._gridSettings.columns||[],i=(this._gridSettings.treecol,this.midWrapper),r=0,s=t.length;r<s;r++)i[0].appendChild(this._domManipulation.columns[r]);this._domManipulation=null}return!0},this.open_node=function(e,i,s){var n=d.isArray(e),a=null;if(n||(a=this.get_node(e),"#"!==a.id)){var o=n?r():a.id;this._detachColumns(o);var l=t.open_node.call(this,e,i,s);return this._reattachColumns(o),l}},this.redraw_node=function(e,i,s,n){var a=d.isArray(e)?r():this.get_node(e).id;return this._detachColumns(a),e=t.redraw_node.call(this,e,i,s,n),e&&this._prepare_grid(e),this._reattachColumns(a),e},this.refresh=function(){return this._clean_grid(),t.refresh.apply(this,arguments)},this.set_id=function(e,i){var r,s=this.uniq;e&&(r=e.id);var n=t.set_id.apply(this,arguments);if(n&&void 0!==r){var a=(this.gridWrapper,[r]);e&&e.children_d&&(a=a.concat(e.children_d)),w(s,a,this._gridSettings.gridcols).attr(g,e.id).removeClass(_(s,r)).addClass(_(s,e.id)).each(function(t,i){d(i).attr("id",_(s,e.id)+(t+1))})}return n},this._hideOrShowTree=function(e,t){this._detachColumns(e.id),this._hideOrShowNode(e,t,this._gridSettings.columns||[],this._gridSettings.treecol),this._reattachColumns(e.id)},this._hideOrShowNode=function(e,t,i,r){for(var s=0,n=i.length;s<n;s++)if(s!==r){var a=w(this.uniq,e.id,s,d(this._domManipulation.columns[s]));t?a.addClass("jstree-grid-hidden"):a.removeClass("jstree-grid-hidden")}if(e.state.opened&&e.children)for(var s=0,n=e.children.length;s<n;s++)this._hideOrShowNode(this.get_node(e.children[s]),t,i,r)},this._hide_grid=function(e){if(!e)return!0;this._detachColumns(e.id);for(var t=e.children?e.children:[],i=this._gridSettings.columns||[],r=this._gridSettings.treecol,s=0,n=t.length;s<n;s++){for(var a=this.get_node(t[s]),o=0,l=i.length;o<l;o++)o!==r&&w(this.uniq,a.id,o,d(this._domManipulation.columns[o])).remove();a.state.opened&&this._hide_grid(a)}this._reattachColumns(e.id)},this.holdingCells={},this.getHoldingCells=function(e,t,i){if(e.state.hidden||!e.state.opened)return d();var r,s,n=d(),a=e.children||[],o=this.uniq;for(s=0;s<a.length;s++)r=_(o,a[s])+t,i[r]&&(n=n.add(i[r]).add(this.getHoldingCells(this.get_node(a[s]),t,i)));return n},this._edit=function(e,t,i){if(!e)return!1;if(e.data||(e.data={}),!i)return!1;i=d(i),"div"===i.prop("tagName").toLowerCase()&&(i=i.children("span:first"));var s=this._data.core.rtl,n=this.element.width(),a=e.data[t.value],o=d("<div />",{css:{position:"absolute",top:"-200px",left:s?"0px":"-1000px",visibility:"hidden"}}).appendTo("body"),l=d("<input />",{value:a,"class":"jstree-rename-input",css:{padding:"0",border:"1px solid silver","box-sizing":"border-box",display:"inline-block",height:this._data.core.li_height+"px",lineHeight:this._data.core.li_height+"px",width:"150px"},blur:d.proxy(function(){var s=l.val();if(""===s||s===a)s=a;else{e.data[t.value]=s,this.element.trigger("update_cell.jstree-grid",{node:e,col:t.value,value:s,old:a});var n=r();this._detachColumns(n),this._prepare_grid(this.get_node(e,!0)),this._reattachColumns(n)}l.remove(),i.show()},this),keydown:function(e){var t=e.which;27===t&&(this.value=a),27!==t&&13!==t&&37!==t&&38!==t&&39!==t&&40!==t&&32!==t||e.stopImmediatePropagation(),27!==t&&13!==t||(e.preventDefault(),this.blur())},click:function(e){e.stopImmediatePropagation()},mousedown:function(e){e.stopImmediatePropagation()},keyup:function(e){l.width(Math.min(o.text("pW"+this.value).width(),n))},keypress:function(e){if(13===e.which)return!1}}),h={fontFamily:i.css("fontFamily")||"",fontSize:i.css("fontSize")||"",fontWeight:i.css("fontWeight")||"",fontStyle:i.css("fontStyle")||"",fontStretch:i.css("fontStretch")||"",fontVariant:i.css("fontVariant")||"",letterSpacing:i.css("letterSpacing")||"",wordSpacing:i.css("wordSpacing")||""};i.hide(),i.parent().append(l),l.css(h).width(Math.min(o.text("pW"+l[0].value).width(),n))[0].select()},this.grid_hide_column=function(e){this.midWrapper.find(".jstree-grid-column-"+e).hide()},this.grid_show_column=function(e){this.midWrapper.find(".jstree-grid-column-"+e).show()},this._prepare_grid=function(e){var t,r,s,n,a,o,h,c,u,f,m,v,j,x,C,y,b,k,q,A,T,O,P,N,L,D,I,V,F,H,B,E=this._gridSettings,U=E.treeClass,$=this,X=E.columns||[],Q=E.isThemeroller,Y=this.uniq,G=E.treecol,J=this.element,K=this.rootid,R=Q?"themeroller":"regular",Z=this.get_node(e),ee=E.columnWidth,te=E.defaultConf,ie=function(e,t,r,s,n){return function(n){var a=i.create("select_cell.jstree-grid");e.trigger(a,[{value:r,column:s.header,node:t,grid:d(this),sourceName:s.value}]),a.isDefaultPrevented()||t.children(".jstree-anchor").trigger("click.jstree",n)}},re=function(e,t,i,r,s){return function(n){E.gridcontextmenu&&(n.preventDefault(),d.vakata.context.show(this,{x:n.pageX,y:n.pageY},E.gridcontextmenu($,e,t,i,r,s,n.target)))}},se=function(e,t){return function(){t.hover_node(e)}},ne=function(e,t){return function(){t.dehover_node(e)}},de=this.midWrapper,ae=Z.id,oe=this.get_node(Z.parent).children,le=d.inArray(ae,oe),he=this.holdingCells,ce=!1;if(t=d(e),u=t.children("[class~='jstree-anchor']"),F=u.hasClass(p),H=u.hasClass("jstree-clicked"),1===u.length){B=!Z.state.opened,y=_(Y,ae),b="#"===Z.parent?null:Z.parent,u.addClass(U),M(u,t,$),f=u,A=le<=0?Z.parent:W(this,oe[le-1]),O=le>=oe.length-1?"NULL":oe[le+1],N=Z.children&&Z.children.length>0?Z.children[0]:"NULL";for(var n=(this.settings.grid,0),ge=X.length;n<ge;n++)if(G!==n){if(L=X[n],V=null==this._domManipulation?de.children("div:eq("+n+")"):d(this._domManipulation.columns[n]),o=L.cellClass||"",h=L.wideCellClass||"",c=L.columnClass||"",V.addClass(c),a=z(L.value,Z),"function"==typeof L.format&&(a=L.format(a)),L.images?(s=L.images[a]||L.images["default"],s&&(D="*"===s[0]?'<span class="'+s.substr(1)+'"></span>':'<img src="'+s+'">')):D=a,(void 0===D||null===D||l.test(D))&&(D="&nbsp;"),m=L.valueClass&&null!==Z.data&&void 0!==Z.data?Z.data[L.valueClass]||"":"",m&&L.valueClassPrefix&&""!==L.valueClassPrefix&&(m=L.valueClassPrefix+m),v=L.wideValueClass&&null!==Z.data&&void 0!==Z.data?Z.data[L.wideValueClass]||"":"",v&&L.wideValueClassPrefix&&""!==L.wideValueClassPrefix&&(v=L.wideValueClassPrefix+v),C=L.title&&null!==Z.data&&void 0!==Z.data?Z.data[L.title]||"":"",C=C.replace(S,""),x=7,r=L.width||ee,"auto"!==r&&(r=I||r-x),f=w(Y,ae,n,V),(!f||f.length<1)&&(f=d("<div></div>"),d("<span></span>").appendTo(f),f.attr("id",y+n),f.addClass(y),f.attr(g,ae),F?f.addClass(p):f.removeClass(p),H?f.addClass("jstree-clicked"):f.removeClass("jstree-clicked"),this.settings.core.themes.ellipsis===!0&&n!==G&&f.addClass("jstree-grid-ellipsis")),Z.state.hidden?f.addClass("jstree-grid-hidden"):f.removeClass("jstree-grid-hidden"),q=w(Y,A,n,V),T=w(Y,O,n,V),P=w(Y,N,n,V),k=w(Y,b,n,V),b?(k&&k.length>0?(q&&q.length>0?f.insertAfter(q):P&&P.length>0?f.insertBefore(P):T&&T.length>0?f.insertBefore(T):f.insertAfter(k),ce=!0):ce=!1,he[y+n]=f):(q&&q.length>0?f.insertAfter(q):P&&P.length>0?f.insertBefore(P):T&&T.length>0?f.insertBefore(T):f.appendTo(V),ce=!0),ce){var ue=this.getHoldingCells(Z,n,he);f.after(ue)}j=f.children("span"),j.addClass(o+" "+m).html(D),f=f.css(te).addClass("jstree-grid-cell jstree-grid-cell-regular jstree-grid-cell-root-"+K+" jstree-grid-cell-"+R+" "+h+" "+v+(Q?" ui-state-default":"")).addClass("jstree-grid-col-"+n).addClass("jstree-animated"),f.click(ie(J,t,a,L,this)),f.on("contextmenu",re(J,t,a,L,this)),f.hover(se(t,this),ne(t,this)),C&&j.attr("title",C),J.trigger("render_cell.jstree-grid",[{value:a,column:L.header,node:t,sourceName:L.value}])}f.addClass("jstree-grid-cell-last"+(Q?" ui-state-default":"")),void 0===X[X.length-1].width&&f.addClass("jstree-grid-width-auto").next(".jstree-grid-separator").remove()}this.element.css({"overflow-y":"auto !important"})},this.holdingCells={}},d});
//# sourceMappingURL=../../sourcemaps/plugin/tree/treegrid.js.map
