/* Chosenbox.js

	Purpose:
		
	Description:
		
	History:
		Tue Nov 16 15:15:52 TST 2011, Created by benbai

Copyright (C) 2011 Potix Corporation. All Rights Reserved.

This program is distributed under LGPL Version 3.0 in the hope that
it will be useful, but WITHOUT ANY WARRANTY.
*/
(function () {
	function clearAllData(wgt) {

	}
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
			if (this.$n() && v >= 0) {
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
			n = options.length,
			_index = this._selectedIndex,
			i;
		for (i = 0; i < s.length; i++) {
			var index = s[i];
			if (_index == -1 || _index >= index)
				_index = this._selectedIndex = index;
			if (index < n)
				this._doSelect(options[index], index);
		}
	},
	bind_: function () {
		this.$supers(chosenbox.Chosenbox, 'bind_', arguments);
		var inp = this.$n('inp'),
			sel = this.$n('sel');

		this.domListen_(inp, 'onKeyDown', '_updateInputWidth')
			.domListen_(inp, 'onKeyUp', '_fixDisplay')
			.domListen_(inp, 'onBlur', 'doBlur_')
			.domListen_(sel, 'onMouseOver', 'doMouseOver_')
			.domListen_(sel, 'onMouseOut', 'doMouseOut_');

		zWatch.listen({onFloatUp: this});

		var n = this.$n();

		n.style.width = this._width + 'px';
		this.$n('pp').style.width = n.offsetWidth + 'px';
	},
	unbind_: function () {
		var inp = this.$n('inp'),
			sel = this.$n('sel');
		this.domUnlisten_(inp, 'onKeyDown', '_updateInputWidth')
			.domUnlisten_(inp, 'onBlur', 'doBlur_')
			.domUnlisten_(sel, 'onMouseOver', 'doMouseOver_')
			.domUnlisten_(sel, 'onMouseOut', 'doMouseOut_');
		clearAllData(this);
		this.$supers(chosenbox.Chosenbox, 'unbind_', arguments);
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
				if (target == options[index]) {
					this._doSelect(target, index, {sendOnSelect: true});
					break;
				}
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
		var options = jq(this.$n('sel')).children(),
			_index = this._selectedIndex;
		if (_index) {
			if (index < _index || _index == -1)
				this._selectedIndex = index;
		} else if (_index != 0)
			this._selectedIndex = index;
		if (this._selItems.indexOf(target) == -1) {
			this._createLabel(target, index);
			target.style.display = 'none'; // hide selected item
			// record the selected item so we can detect whether an item is selected easily.
			this._selItems.push(target);
			this._setHighlight(target, false); // clear highlight
			// this._updatePopupPosition();

			if (opts && opts.sendOnSelect)
				this.fireOnSelect();
		}
	},
	// deselect an item
	_doDeselect: function (selectedItem, opts) {
		var element = jq(this.$n('sel')).children()[selectedItem.opt_index];
		// remove record
		this._selItems.splice(this._selItems.indexOf(element), 1);
		// show origin option of deselected item
		element.style.display = 'block';
		// remove deselected item mark
		jq(selectedItem).remove();
		this._updatePopupPosition();
		if (opts && opts.sendOnSelect)
			this.fireOnSelect(); // only fire if active from client
		if (opts && opts.fixSelectedIndex)
			this._fixSelectedIndex();
	},
	// fix the selected index after deselect an item
	_fixSelectedIndex: function () {
		var n = this.$n(),
			c, // selected item
			min;
		if (n)
			c = n.firstChild;
			while (c) {
				var next = c.nextSibling;
				index = c.opt_index;
				if (index == 0) {
					min = 0;
					break;
				} else if (index)
					if (!min || index < min)
						min = index;
				else
					break;
				c = next;
			}
		if (min || min == 0)
			this._selectedIndex = min;
		else
			this._selectedIndex = -1;
	},
	// create label for selected item
	_createLabel: function (target, index) {
		var span = document.createElement("span"),
			content = document.createElement("div"),
			delbtn = document.createElement("div"),
			wgt = this;
		span.opt_index = index; // save the index
		span.className = this.getZclass() + '-sel-item';
		content.innerHTML = target.innerHTML;
		content.className = this.getZclass() + '-sel-item-cnt';
		delbtn.className = this.getZclass() + '-del-btn';
		
		span.appendChild(content);
		span.appendChild(delbtn);
		jq(delbtn).bind('click', function () {
			wgt._doDeselect(span, {sendOnSelect: true, fixSelectedIndex: true});
		});
		this.$n().insertBefore(span, this.$n('inp')); // add div mark
	},
	// clear all selected items
	_clearSelection: function (opts) {
		var n = this.$n(),
			c; // selected item
		if (n)
			c = n.firstChild;
			while (c) {
				var next = c.nextSibling;
				index = c.opt_index;
				if (index || index == 0) {
					this._doDeselect(c, opts);
				}
				else
					break;
				c = next;
			}
		this._selectedIndex = -1;
	},
	// fire On_Select event to server
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
	// should close drop-down list if not click self
	onFloatUp: function(ctl){
		if (this._open && (ctl.origin != this))
			this.setOpen(false, {sendOnOpen: true});
	},
	//Bug 1756559: ctrl key shall fore it to be sent first
	beforeCtrlKeys_: function (evt) {
		this._doChange(evt);
	},
	_doChange: function (evt) {
		// TODO: maybe done in others?
	},
	_updateInputWidth: function (evt) {
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
		zk(pp).makeVParent();

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
		zk(pp).undoVParent();
		this.setFloating_(false);
		pp.style.display = 'none';
		var wgt = this;

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
		var n = this.$n(),
			hgh = jq(n).height();
		// copy value to hidden txcnt
		txcnt.innerHTML = inp.value;
		// get width from hidden txcnt
		var width = jq(txcnt).width() + 30,
			max = jq(this.$n()).width() - 5;
		if (width > max)
			inp.style.width = max + 'px';
		else
			inp.style.width = width + 'px';
		if (jq(n).height() != hgh)
			this._updatePopupPosition(n, this.$n('pp'));
		if (this.fixInputWidth) {
			clearTimeout(this.fixInputWidth);
			this.fixInputWidth = null;
		}
	},
	// filt out not matched item
	_fixDisplay: function () {
		var str = this.$n('inp').value,
			selItems = this._selItems,
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
	_updatePopupPosition: function () {
		var n = this.$n(),
			pp = this.$n('pp'),
			offset = this._evalOffset(n, pp);
		
		pp.style.left = offset.left + 'px';
		pp.style.top = offset.top + jq(this.$n()).height() + 'px';
	}
});
})();