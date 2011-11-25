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
	$init: function () {
		this.$supers('$init', arguments);
		this._selItems = [];
	},
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
		selectedIndex: function (selectedIndex, opts) {
			// TODO: handle item selection
			if (this.$n()) {
				if (opts && opts.sendOnSelect)
					this._clearSelection(false);
				else
					this._clearSelection(true);
				this._doSelect(jq(this.$n('sel')).children()[selectedIndex]);
			}
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
	setChgSel: function (val) { //called from the server
		var s = val.split(','),
			selItems = this._selItems,
			options = jq(this.$n('sel')).children(),
			index,
			i;
		for (i = 0; i < s.length; i++) {
			var element = options[s[i]];
			if (selItems.indexOf(element) < 0)
				this._doSelect(element);
		}
	},
	bind_: function () {
		this.$supers(chosenbox.Chosenbox, 'bind_', arguments);
		var inp = this.$n('inp'),
			sel = this.$n('sel'),
			pp = this.$n('pp');

		this.domListen_(inp, 'onChange', '_doTxChange')
			.domListen_(inp, 'onKeyDown', '_doTxChange')
			.domListen_(inp, 'onKeyUp', '_fixDisplay')
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
		this.domUnlisten_(inp, 'onChange', '_doTxChange')
			.domUnlisten_(inp, 'onKeyDown', '_doTxChange')
			.domUnlisten_(inp, 'onBlur', 'doBlur_')
			.domUnlisten_(sel, 'onClick', 'doClick_')
			.domUnlisten_(sel, 'onMouseOver', 'doMouseOver_')
			.domUnlisten_(sel, 'onMouseOut', 'doMouseOut_')
			.domUnlisten_(sel, 'onMouseDown', 'doMouseDown_');

		this._ignoreFloatUp = null;
		this.$supers(chosenbox.Chosenbox, 'unbind_', arguments);
	},
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
		var options = jq(this.$n('sel')).children(),
			index;
		for (index = 0; index < options.length; index ++)
			if (options[index] == target) {
				var content = document.createElement("div"),
					delbtn = document.createElement("div"),
					wgt = this;
				content.innerHTML = target.innerHTML;
				content.className = this.getZclass() + '-sel-item';
				content.opt_index = index; // save the index
				delbtn.innerHTML = 'X';
				delbtn.className = this.getZclass() + '-del-btn';
				content.appendChild(delbtn);
				jq(delbtn).bind('click', function () {
					wgt._doDeselect(content);
				});
				this.$n('cnt').insertBefore(content, this.$n('inp')); // add div mark
				target.style.display = 'none'; // hide selected item
				// record the selected item so we can detect whether an item is selected easily.
				this._selItems.push(target);

				this._doOptOut(target); // clear highlight
				break;
			}
		this.fireOnSelect();
		this.setOpen(false);
		// this._updatePopupPosition(this.$n(), this.$n('pp'));
	},
	// deselect an item
	_doDeselect: function (selectedItem, opts) {
		var element = jq(this.$n('sel')).children()[selectedItem.opt_index];
		// remove record
		this._selItems.splice(this._selItems.indexOf(element), 1);
		// show deselected item
		element.style.display = 'block';
		// remove div mark
		jq(selectedItem).remove();
		if (this._open)
			this.setOpen(false);
		if (!(opts && opts.fromServer))
			this.fireOnSelect(); // only fire if active from client
	},
	_clearSelection: function (isFromServer) {
		var cnt = this.$n('cnt'),
			c;
		if (cnt)
			c = cnt.firstChild;
			while (c) {
				var next = c.nextSibling;
				if (c.opt_index >= 0)
					this._doDeselect(c, {fromServer: isFromServer});
				else
					break;
				c = next;
			}
			
	},
	fireOnSelect: function (evt) {
		var options = jq(this.$n('sel')).children(),
			selItems = this._selItems,
			ref = this,
			data = [],
			index;

		for (index = 0; index < options.length; index ++)
			if (selItems.indexOf(options[index]) >= 0)
				data.push(index+'');
		this.fire('onSelect', zk.copy({items: data, reference: ref}));
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
	_doTxChange: function (evt) {
		var inp = evt.domTarget,
			txcnt = this.$n('txcnt'),
			wgt = this;

		if (!this.fixInputWidth) // check every 100ms while input
			this.fixInputWidth = setTimeout(function () { // do after event
				wgt._fixInputWidth(inp, txcnt)
			}, 100);
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
			var offset = this._evalOffset(n);
			
			pp.style.left = offset.left + 'px';
			pp.style.top = offset.top + jq(this.$n()).height() + 'px';
		} else {
			this.setFloating_(false);
		}
		pp.style.zIndex = this.$n().style.zIndex;
		if (open) {
			this._fixDisplay();
			zk(pp).slideDown(this);
		}
		else {
			pp.style.display = 'none';
			var wgt = this;
			setTimeout(function () {wgt._restorepp();}, 0);
		}
		
	},
	// calculate the left and top for drop-down list
	_evalOffset: function (n) {
		var _left = 0,
			_top = 0,
			p = n;

		_left += p.offsetLeft;
		_top += p.offsetTop;
		// evaluate the top and left
		while ((p = p.offsetParent)) {
			_left += p.offsetLeft;
			_top += p.offsetTop;
		}
		return {left: _left, top: _top};
	},
	// calculate the width for input field
	_fixInputWidth: function (inp, txcnt) {
		// copy value to hidden txcnt
		txcnt.innerHTML = inp.value;
		// get width from hidden txcnt
		var width = jq(txcnt).width() + 30,
			max = jq(this.$n('cnt')).width() - 5;
		if (width > max)
			inp.style.width = max + 'px';
		else
			inp.style.width = width + 'px';
		if (this.fixInputWidth) {
			clearTimeout(this.fixInputWidth);
			this.fixInputWidth = null;
		}
	},
	// filt out not matched item
	_fixDisplay: function () {
		var str = this.$n('inp').value;

		var selItems = this._selItems,
			options = jq(this.$n('sel')).children(),
			index, element, eStyle,
			found = false;

		// iterate through item list
		for (index = 0, element = options[index];
			index < options.length;
			index ++, element = options[index])
			if (selItems.indexOf(element) < 0) { // not process selected items
				eStyle = element.style;
				if (str != '' && !element.innerHTML.toLowerCase().startsWith(str.toLowerCase()))
					eStyle.display = 'none'; // hide if has input and not match
				else {
					eStyle.display = 'block'; // show otherwise
					found = true;
				}
			}
		var empty = this.$n('empty');
		if (!found) { // show empty message if not found anything
			empty.innerHTML = 'no result match your input - ' + str;
			empty.style.display = 'block';
		} else
			empty.style.display = 'none';
	},
	_updatePopupPosition: function (n, pp) {
		var offset = this._evalOffset(n, pp);
		
		pp.style.left = offset.left + 'px';
		pp.style.top = offset.top + jq(this.$n()).height() + 'px';
	},
	// move popup node back
	_restorepp: function () {
		var n = this.$n(),
			pp = this.$n('pp');
		n.appendChild(pp);
		pp.style.zIndex = n.style.zIndex = 1;
	}
});