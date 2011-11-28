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
		selectedIndex: function (v, opts) {
			this._clearSelection();
			if (this.$n()) {
				var options = jq(this.$n('sel')).children();
				if (v < options.length)
					this._doSelect(options[v], v);
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
	// update the selected items, the old selection will be cleared at first
	setChgSel: function (val) { //called from the server
		this._clearSelection();
		var s = val.split(','),
			selItems = this._selItems,
			options = jq(this.$n('sel')).children(),
			i;
		for (i = 0; i < s.length; i++) {
			var index = s[i];
			if (index < options.length)
				this._doSelect(options[index], index);
		}
	},
	bind_: function () {
		this.$supers(chosenbox.Chosenbox, 'bind_', arguments);
		var inp = this.$n('inp'),
			sel = this.$n('sel');

		this.domListen_(inp, 'onKeyDown', '_updateText')
			.domListen_(inp, 'onKeyUp', '_fixDisplay')
			.domListen_(inp, 'onBlur', 'doBlur_')
			.domListen_(sel, 'onClick', 'doClick_')
			.domListen_(sel, 'onMouseOver', 'doMouseOver_')
			.domListen_(sel, 'onMouseOut', 'doMouseOut_')
			.domListen_(sel, 'onMouseDown', 'doMouseDown_');

		zWatch.listen({onFloatUp: this});

		var cnt = this.$n('cnt');

		this.$n('cnt').style.width = this._width + 'px';
		this.$n('pp').style.width = cnt.offsetWidth + 'px';
	},
	unbind_: function () {
		var inp = this.$n('inp'),
			sel = this.$n('sel');
		this.domUnlisten_(inp, 'onKeyDown', '_updateText')
			.domUnlisten_(inp, 'onBlur', 'doBlur_')
			.domUnlisten_(sel, 'onClick', 'doClick_')
			.domUnlisten_(sel, 'onMouseOver', 'doMouseOver_')
			.domUnlisten_(sel, 'onMouseOut', 'doMouseOut_')
			.domUnlisten_(sel, 'onMouseDown', 'doMouseDown_');

		this._ignoreFloatUp = null;
		this.$supers(chosenbox.Chosenbox, 'unbind_', arguments);
	},
	// set ignoreFloatUp while mousedown to prevent close while onFloatUp
	doMouseDown_: function (evt) {
		if (this._open)
			this._ignoreFloatUp = true;
	},
	doMouseOver_: function (evt) {
		var target = evt.domTarget;
		if (target.className.indexOf('option') > 0) // mouseover option
			this._setHighlight(target, true);
	},
	doMouseOut_: function (evt) {
		var target = evt.domTarget;
		if (target.className.indexOf('option') > 0) // mouseout option
			this._setHighlight(target, false);
	},
	_setHighlight: function (target, highlight) {
		target.className = this.getZclass() + (highlight? '-option-over' : '-option');
	},
	doClick_: function (evt) {
		var target = evt.domTarget;
		if (target.className.indexOf('option') > 0) { // click on option
			var options = jq(this.$n('sel')).children(),
				index;
			for (index = 0; index < options.length; index++)
				if (target == options[index])
					this._doSelect(target, index, {sendOnSelect: true});
			this.setOpen(false, {sendOnOpen: true});
		} else {
			if (!this._open) {
				this.setOpen(true, {sendOnOpen: true});
			}
		}
		this.$n('inp').focus();
		this.$supers('doClick_', arguments);
	},
	// select an item
	_doSelect: function (target, index, opts) {
		var options = jq(this.$n('sel')).children();
		if (this._selItems.indexOf(target) == -1) {
			this._createLabel(target, index);
			target.style.display = 'none'; // hide selected item
			// record the selected item so we can detect whether an item is selected easily.
			this._selItems.push(target);
			this._setHighlight(target, false); // clear highlight
			// this._updatePopupPosition(this.$n(), this.$n('pp'));

			if (opts && opts.sendOnSelect)
				this.fireOnSelect();
		}
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
		if (opts && opts.sendOnSelect)
			this.fireOnSelect(); // only fire if active from client
	},
	// create label for selected item
	_createLabel: function (target, index) {
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
	},
	_clearSelection: function (opts) {
		var cnt = this.$n('cnt'),
			c;
		if (cnt)
			c = cnt.firstChild;
			while (c) {
				var next = c.nextSibling;
				if (c.opt_index >= 0)
					this._doDeselect(c, opts);
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
		this.fire('onSelect', data);
	},
	//Bug 3304408: IE does not fire onchange
	doBlur_: function (evt) {
		this._doChange(evt);
		return this.$supers('doBlur_', arguments); 		
	},
	onFloatUp: function(ctl){
		if (this._open) {
			var wgt = this;
			setTimeout(function () { // make it do after doMouseDown and check whether _ignoreFloatUp
				// clear _ignoreFloatUp if mousedown on self
				if (wgt._ignoreFloatUp)
					wgt._ignoreFloatUp = null;
				else
					wgt.setOpen(false, {sendOnOpen: true}); // close dropdown otherwise
			}, 1);
		}
	},
	//Bug 1756559: ctrl key shall fore it to be sent first
	beforeCtrlKeys_: function (evt) {
		this._doChange(evt);
	},
	_doChange: function (evt) {
		
	},
	_updateText: function (evt) {
		var inp = evt.domTarget,
			txcnt = this.$n('txcnt'),
			wgt = this;

		if (!this.fixInputWidth) // check every 100ms while input
			this.fixInputWidth = setTimeout(function () { // do after event
				wgt._fixInputWidth(inp, txcnt)
			}, 100);
	},
	setOpen: function (open, opts) {
		this._open = open;
		var pp = this.$n('pp');
		if (open) {
			this.open(this.$n(), pp, opts);
		} else {
			this.close(pp, opts);
		}
	},
	open: function (n, pp, opts) {
		// move popup under the body
		document.body.appendChild(pp);
		// required for setTopmost 
		this.setFloating_(true);
		this.setTopmost();
		var offset = this._evalOffset(n);
		
		pp.style.left = offset.left + 'px';
		pp.style.top = offset.top + jq(n).height() + 'px';
		pp.style.zIndex = n.style.zIndex;

		this._fixDisplay();
		zk(pp).slideDown(this);

		if (opts && opts.sendOnOpen)
			this.fire('onOpen', {open:true});
	},
	close: function (pp, opts) {
		this.setFloating_(false);
		pp.style.display = 'none';
		var wgt = this;
		setTimeout(function () {wgt._restorepp();}, 0);

		if (opts && opts.sendOnOpen)
			this.fire('onOpen', {open:false});
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