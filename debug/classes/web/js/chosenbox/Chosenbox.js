/* Chosenbox.js

	Purpose:
		
	Description:
		
	History:
		Tue Nov 16 15:15:52 TST 2011, Created by benbai

Copyright (C) 2011 Potix Corporation. All Rights Reserved.

This program is distributed under LGPL Version 3.0 in the hope that
it will be useful, but WITHOUT ANY WARRANTY.
*/
chosenbox.Chosenbox = zk.$extends(zul.Widget, {
	_width: 300,
	$define: {
		/**
		 * Returns the tab order of this component.
		 * <p>
		 * Default: 0 (means the same as browser's default).
		 * @return int
		 */
		/**
		 * Sets the tab order of this component.
		 * @param int tabindex
		 */
		tabindex: function (tabindex) {
			// tabindex is for input element
			var n = this.$n('inp');
			if (n) n.tabindex = tabindex||'';
		},
		/**
		 * Returns the index of the selected item (-1 if no one is selected).
		 * @return int
		 */
		/**
		 * Selects the item with the given index.
		 * @param int selectedIndex
		 */
		selectedIndex: function (selectedIndex) {
			// TODO: handle item selection
		},
		/**
		 * Returns whether it is disabled.
		 * <p>
		 * Default: false.
		 * @return boolean
		 */
		/**
		 * Sets whether it is disabled.
		 * @param boolean disabled
		 */
		disabled: function (disabled) {
			// TODO: handle disable, or maybe not need?
			//var n = this.$n('sel');
			//if (n) n.disabled = disabled ? 'disabled' : '';
		},
		/**
		 * Returns the name of this component.
		 * <p>
		 * Default: null.
		 * <p>
		 * The name is used only to work with "legacy" Web application that handles
		 * user's request by servlets. It works only with HTTP/HTML-based browsers.
		 * It doesn't work with other kind of clients.
		 * <p>
		 * Don't use this method if your application is purely based on ZK's
		 * event-driven model.
		 * @return String
		 */
		/**
		 * Sets the name of this component.
		 * <p>
		 * The name is used only to work with "legacy" Web application that handles
		 * user's request by servlets. It works only with HTTP/HTML-based browsers.
		 * It doesn't work with other kind of clients.
		 * <p>
		 * Don't use this method if your application is purely based on ZK's
		 * event-driven model.
		 * 
		 * @param String name
		 *            the name of this component.
		 */
		name: function (name) {
			// TODO: handle name, or maybe not need?
			//var n = this.$n('sel');
			//if (n) n.name = name;
		}
	},
	getZclass: function () {
		var zcls = this._zclass;
		return zcls != null ? zcls: "z-chosenbox";
	},

	bind_: function () {
		this.$supers(zul.wgt.Selectbox, 'bind_', arguments);
		var inp = this.$n('inp'),
			sel = this.$n('sel'),
			pp = this.$n('pp');

		this.domListen_(inp, 'onChange')
			.domListen_(inp, 'onBlur', 'doBlur_')
			.domListen_(sel, 'onClick', 'doClick_')
			.domListen_(sel, 'onMouseOver', 'doMouseOver_')
			.domListen_(sel, 'onMouseOut', 'doMouseOut_')
			.domListen_(sel, 'onMouseDown', 'doMouseDown_');

		zWatch.listen({onFloatUp: this});

		var cnt = this.$n('cnt');

		this.$n('cnt').style.width = this._width + 'px';
		pp.style.width = cnt.offsetWidth + 'px';
	},
	unbind_: function () {
		var inp = this.$n('inp'),
			sel = this.$n('sel');
		this.domUnlisten_(inp, 'onChange')
			.domUnlisten_(inp, 'onBlur', 'doBlur_')
			.domUnlisten_(sel, 'onClick', 'doClick_')
			.domUnlisten_(sel, 'onMouseOver', 'doMouseOver_')
			.domUnlisten_(sel, 'onMouseOut', 'doMouseOut_')
			.domUnlisten_(sel, 'onMouseDown', 'doMouseDown_');

		this._ignoreFloatUp = null;
		this.$supers(zul.wgt.Selectbox, 'unbind_', arguments);
	},
	// mousedown on sel or option
	doMouseDown_: function (evt) {
		if (this._open)
			this._ignoreFloatUp = true;
	},
	doMouseOver_: function (evt) {
		var target = evt.domTarget;
		if (target.className.indexOf('option') > 0) // mouseover option
			this._doOptOver(target);
	},
	_doOptOver: function (target) {
		target.className = this.getZclass() + '-option-focus';
	},
	doMouseOut_: function (evt) {
		var target = evt.domTarget;
		if (target.className.indexOf('option') > 0) // mouseout option
			this._doOptOut(target);
	},
	_doOptOut: function (target) {
		target.className = this.getZclass() + '-option';
	},
	doClick_: function (evt) {
		var target = evt.domTarget;
		if (target.className.indexOf('option') > 0) { // click option
			this._doSelect(target);
		} else {
			if (!this._open) {
				this.setOpen(true);
			}
		}
		this.$n('inp').focus();
		this.$supers('doClick_', arguments);
	},
	// select an item
	_doSelect: function (target) {
		var sel = jq(this.$n('sel')),
			options = sel.children(),
			index;

		for (index = 0; index < options.length; index ++)
			if (options[index] == target) {
				var div = document.createElement("div"),
					wgt = this;
				div.innerHTML = target.innerHTML;
				div.className = this.getZclass() + '-sel-item';
				div.opt_index = index; // save the index
				jq(div).bind('click', function () {
					wgt._doDeselect(div);
				});
				this.$n('cnt').insertBefore(div, this.$n('inp')); // add div mark
				target.style.display = 'none'; // hide selected item
				this._doOptOut(target); // clear highlight
				break;
			}
		
		this.setOpen(false);
	},
	// deselect an item
	_doDeselect: function (selectedItem) {
		// show deselected item
		jq(this.$n('sel')).children()[selectedItem.opt_index].style.display = 'block';
		// remove div mark
		jq(selectedItem).remove();
		if (this._open)
			this.setOpen(false);
	},
	//Bug 3304408: IE does not fire onchange
	doBlur_: function (evt) {
		this._doChange(evt);
		return this.$supers('doBlur_', arguments); 		
	},
	onFloatUp: function(ctl){
		if (this._open) {
			var wgt = this;
			setTimeout(function () { // make it do after doMouseDown and check whether mousedown itself
				if (wgt._ignoreFloatUp) {
					wgt._ignoreFloatUp = null;
					return;
				}
				wgt.setOpen(false);
			}, 1);
		}
	},
	//Bug 1756559: ctrl key shall fore it to be sent first
	beforeCtrlKeys_: function (evt) {
		this._doChange(evt);
	},
	_doChange: function (evt) {
		
	},
	setOpen: function (open, fromServer) {
		this._open = open;
		var n = this.$n(),
			parent = n.parentNode,
			pp = this.$n('pp');
		if (open) {
			// move popup under the body
			document.body.appendChild(pp);
			// required for setTopmost 
			this.setFloating_(true);
			this.setTopmost();

			var left = 0,
				top = 0;
	
			var p = n;

			left += p.offsetLeft;
			top += p.offsetTop;
			// evaluate the top and left
			while ((p = p.offsetParent)) {
				left += p.offsetLeft;
				top += p.offsetTop;
			}
			pp.style.left = left + 'px';
			pp.style.top = top + jq(this.$n()).height() + 'px';
		} else {
			this.setFloating_(false);
		}
		pp.style.zIndex = this.$n().style.zIndex;
		if (open)
			zk(pp).slideDown(this);
		else {
			pp.style.display = 'none';
			var wgt = this;
			setTimeout(function () {wgt._restorepp();}, 0);
		}
		
	},

	_restorepp: function () {
		var n = this.$n(),
			pp = this.$n('pp');
		n.appendChild(pp);
		pp.style.zIndex = n.style.zIndex = 1;
	}
});