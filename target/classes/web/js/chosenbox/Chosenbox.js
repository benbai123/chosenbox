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
		wgt._clearSelection();
		wgt._chgSel = wgt.fixInputWidth = null;
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
			var options;
			this._clearSelection();
			if (this.$n() && v >= 0) {
				options = jq(this.$n('sel')).children();
				if (v < options.length)
					this._doSelect(options[v], v);
				else if (options.length == 0)
					this._chgSel = v + '';
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
		},
		message: null
	},
	getZclass: function () {
		var zcls = this._zclass;
		return zcls != null ? zcls: "z-chosenbox";
	},
	// update the selected items, the old selection will be cleared at first
	setChgSel: function (val) { //called from the server
		this._clearSelection();
		var options = jq(this.$n('sel')).children(),
			length = options.length;
		if (length == 0)
			this._chgSel = val;
		else {
			var s = val.split(','),
				selItems = this._selItems,
				_index = this._selectedIndex,
				index,
				i;
			for (i = 0; i < s.length; i++) {
				index = s[i];
				if (_index == -1 || _index >= index)
					_index = this._selectedIndex = index;
				if (index < length)
					this._doSelect(options[index], index);
			}
		}
	},
	bind_: function () {
		this.$supers(chosenbox.Chosenbox, 'bind_', arguments);
		var n = this.$n(),
			inp = this.$n('inp'),
			sel = this.$n('sel'),
			chgSel = this._chgSel;

		this.domListen_(inp, "onFocus", "doFocus_")
			.domListen_(inp, 'onBlur', 'doBlur_')
			.domListen_(sel, 'onMouseOver', 'doMouseOver_')
			.domListen_(sel, 'onMouseOut', 'doMouseOut_');

		zWatch.listen({onFloatUp: this});

		n.style.width = this._width + 'px';
		this.$n('pp').style.width = jq(n).width() + 'px';
		this._fixInputWidth();
		if (chgSel) {
			this.setChgSel(chgSel);
			this._chgSel = null;
		}
	},
	unbind_: function () {
		var inp = this.$n('inp'),
			sel = this.$n('sel');
		this.domUnlisten_(inp, "onFocus", "doFocus_")
			.domUnlisten_(inp, 'onBlur', 'doBlur_')
			.domUnlisten_(sel, 'onMouseOver', 'doMouseOver_')
			.domUnlisten_(sel, 'onMouseOut', 'doMouseOut_');
		clearAllData(this);
		this.$supers(chosenbox.Chosenbox, 'unbind_', arguments);
	},
	doBlur_: function (evt) {
		jq(this.$n()).removeClass(this.getZclass() + '-focus');
		this._fixMessage();
	},
	doFocus_: function (evt) {
		jq(this.$n()).addClass(this.getZclass() + '-focus');
	},
	doMouseOver_: function (evt) {
		var target = evt.domTarget;
		// mouseover option
		if (target.className.indexOf('option') > 0)
			this._setHighlight(target, true);
	},
	doMouseOut_: function (evt) {
		var target = evt.domTarget;
		// mouseout option
		if (target.className.indexOf('option') > 0)
			this._setHighlight(target, false);
	},
	_setHighlight: function (target, highlight) {
		var zcls = this.getZclass(),
			oldHlite;
		if (highlight) {
			// clear old first
			oldHlite = jq(this.$n('sel')).find('.'+zcls+'-option-over')[0];
			if (oldHlite)
				oldHlite.className = zcls + '-option';
			target.className = zcls + '-option-over';
		} else
			target.className = zcls + '-option';
	},
	_doArrowDown: function (key, evt) {
		if (key == 'up')
			this._focusPrevious();
		else if (key == 'down')
			this._focusNext();
		else {
			var inp = this.$n('inp'),
				pos = zk(inp).getSelectionRange();
			// only works if cursor is at the begining of input
			if (pos[0] == 0 && pos[1] == 0) {
				if (key == 'left')
					this._focusPreviousLabel();
				else if (key == 'right')
					this._focusNextLabel(null, evt);
			}
		}
	},
	// focus previous visible option
	_focusPrevious: function () {
		var oldHlite = jq(this.$n('sel')).find('.'+this.getZclass()+'-option-over')[0],
			previous = oldHlite? oldHlite.previousSibling : null;
		// find previous closest visible sibling
		while (previous && previous.style.display == 'none')
			previous = previous.previousSibling;
		if (previous)
			this._setHighlight(previous, true);
		else if (oldHlite)
			this._setHighlight(oldHlite, false);
	},
	// focus next visible option
	_focusNext: function () {
		var $sel = jq(this.$n('sel')),
			oldHlite = $sel.find('.'+this.getZclass()+'-option-over')[0],
			next;
		if (!this._open)
			this.setOpen(true, {sendOnOpen: true});
		else {
			next = oldHlite? oldHlite.nextSibling : $sel[0].firstChild;
			// find next closest visible sibling
			while (next && next.style.display == 'none')
				next = next.nextSibling;
			if (next)
				this._setHighlight(next, true);
		}
			
	},
	_focusPreviousLabel: function (label) {
		var zcls = this.getZclass() + '-sel-item-focus',
			previous;
		if (label || (label = jq(this.$n()).find('.' + zcls)[0])) {
			if (previous = label.previousSibling) {
				jq(label).removeClass(zcls);
				jq(previous).addClass(zcls);
			}
		} else if (label = this.$n('inp').previousSibling)
			jq(label).addClass(zcls);
	},
	_focusNextLabel: function (label, evt) {
		var zcls = this.getZclass() + '-sel-item-focus';
		if (label || (label = jq(this.$n()).find('.' + zcls)[0])) {
			jq(label).removeClass(zcls);
			if ((label = label.nextSibling) && label != this.$n('inp'))
				jq(label).addClass(zcls);
			if (evt)
				evt.stop();
		}
	},
	// called after press backspace or del and release
	_deleteLabel: function (key, evt) {
		var inp = this.$n('inp'),
			pos = zk(inp).getSelectionRange(),
			label;

		// only works if cursor is at the begining of input
		if (pos[0] == 0 && pos[1] == 0) {
			var zcls = this.getZclass() + '-sel-item-focus';
			if (label = jq(this.$n()).find('.' + zcls)[0]) {
				if (label.previousSibling && key == 'backspace')
					this._focusPreviousLabel(label);
				else
					this._focusNextLabel(label)
				this._doDeselect(label, {sendOnSelect: true, fixSelectedIndex: true});
				evt.stop();
				// maybe have to filt out deselected item
				this._fixDisplay();
			}
			else if ((label = inp.previousSibling) && key == 'backspace') {
				jq(label).addClass(zcls);
			}
		}
	},
	_removeLabelFocus: function () {
		var zcls = this.getZclass() + '-sel-item-focus',
			label = jq(this.$n()).find('.' + zcls)[0];
		if (label)
			jq(label).removeClass(this.getZclass() + '-sel-item-focus');
	},
	// called after press enter and release
	_doEnterPressed: function () {
		if (this._open) {
			var $sel = jq(this.$n('sel')),
				hlited;
			if (hlited = $sel.find('.'+this.getZclass()+'-option-over')[0]) {
				var options = $sel.children(),
					index;
				for (index = 0; index < options.length; index++)
					if (hlited == options[index]) {
						this._doSelect(hlited, index, {sendOnSelect: true});
						this.setOpen(false, {sendOnOpen: true});
						break;
					}
			}
		}
	},
	doClick_: function (evt) {
		var target = evt.domTarget,
			inp = this.$n('inp');
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
			if (!this._open)
				this.setOpen(true, {sendOnOpen: true});
		}

		if (inp.value == this._message)
			inp.value = '';
		inp.focus();
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
			this._fixMessage();
			this._setHighlight(target, false); // clear highlight
			// this._updatePopupPosition();

			if (opts && opts.sendOnSelect)
				this.fireOnSelect();
		}
	},
	// deselect an item
	_doDeselect: function (selectedItem, opts) {
		var element = jq(this.$n('sel')).children()[selectedItem.opt_index],
			_selItems = this._selItems;
		// remove record
		_selItems.splice(_selItems.indexOf(element), 1);
		this._fixMessage();
		// show origin option of deselected item
		element.style.display = 'block';
		// remove label of deselected item
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
			min,
			next,
			index;
		if (n)
			c = n.firstChild;
		while (c) {
			next = c.nextSibling,
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
			wgt.$n('inp').focus();
			wgt._doDeselect(span, {sendOnSelect: true, fixSelectedIndex: true});
		});
		this.$n().insertBefore(span, this.$n('inp')); // add div mark
	},
	// clear all selected items
	_clearSelection: function (opts) {
		var n = this.$n(),
			c,
			next,
			index; // selected item
		if (n)
			c = n.firstChild;
			while (c) {
				next = c.nextSibling;
				index = c.opt_index;
				if (index || index == 0) {
					this._doDeselect(c, opts);
				}
				else
					break;
				c = next;
			}
		this._selItems.length = 0;
		this._selectedIndex = -1;
	},
	// fire On_Select event to server
	fireOnSelect: function (evt) {
		var n = this.$n(),
			c,
			next,
			data = [],
			index; // selected item
		if (n)
			c = n.firstChild;
			while (c) {
				next = c.nextSibling;
				index = c.opt_index;
				if (index || index == 0)
					data.push(index+'');
				else
					break;
				c = next;
		}
			this.fire('onSelect', data);
	},
	// should close drop-down list if not click self
	onFloatUp: function(ctl){
		if (this._open && (ctl.origin != this)) {
			this.setOpen(false, {sendOnOpen: true});
			this._fixMessage();
		}
	},
	//Bug 1756559: ctrl key shall fore it to be sent first
	beforeCtrlKeys_: function (evt) {
		this._doChange(evt);
	},
	doKeyDown_: function (evt) {
		var keyCode = evt.keyCode,
			clearLabelFocus = true;
		switch (keyCode) {
			case 8://backspace
				this._deleteLabel('backspace', evt);
				clearLabelFocus = false;
				break;
			case 13://enter processed in key up only
				break;
			case 27://esc processed in key up only
				break;
			case 37://left
				this._doArrowDown('left', evt);
				clearLabelFocus = false;
				break;
			case 38://up
				this._doArrowDown('up');
				break;
			case 39://right
				this._doArrowDown('right', evt);
				clearLabelFocus = false;
				break;
			case 40://down
				this._doArrowDown('down');
				break;
			case 46://del
				this._deleteLabel('del', evt);
				clearLabelFocus = false;
				break;
			default:
				this._updateInput(evt);
		}
		if (clearLabelFocus)
			this._removeLabelFocus();
	},
	doKeyUp_: function (evt) {
		var keyCode = evt.keyCode;
		switch (keyCode) {
			case 13://enter
				this._doEnterPressed();
				break;
			case 27://esc
				if (this._open)
					this.setOpen(false, {sendOnOpen: true});
				break;
			default:
				this._fixInputWidth();
				this._fixDisplay();
		}
	},
	_updateInput: function (evt) {
		var inp = evt? evt.domTarget : this.$n('inp'),
			txcnt = this.$n('txcnt'),
			wgt = this;

		if (!this._open)
			this.setOpen(true, {sendOnOpen: true});
		// check every 100ms while input
		if (!this.fixInputWidth)
			this.fixInputWidth = setTimeout(function () { // do after event
				wgt._fixInputWidth()
			}, 100);
	},
	setOpen: function (open, opts) {
		var pp = this.$n('pp');
		this._open = open;
		if (open)
			this.open(this.$n(), pp, opts);
		else
			this.close(pp, opts);
	},
	open: function (n, pp, opts) {
		var offset;
		zk(pp).makeVParent();

		// required for setTopmost
		this.setFloating_(true);
		this.setTopmost();
		offset = this._evalOffset(n);

		pp.style.left = offset.left + 'px';
		pp.style.top = offset.top + jq(n).outerHeight() + 'px';
		pp.style.zIndex = n.style.zIndex;

		this._fixDisplay({hliteFirst: true});
		zk(pp).slideDown(this);

		if (opts && opts.sendOnOpen)
			this.fire('onOpen', {open:true});
	},
	close: function (pp, opts) {
		var wgt = this;
		zk(pp).undoVParent();
		this.setFloating_(false);
		pp.style.display = 'none';

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
	_fixInputWidth: function () {
		var n = this.$n(),
			inp = this.$n('inp'),
			txcnt = this.$n('txcnt'),
			hgh = jq(n).height(),
			width,
			max;
		// copy value to hidden txcnt
		txcnt.innerHTML = inp.value;
		// get width from hidden txcnt
		width = jq(txcnt).width() + 30;
		max = this._width - 10;
		if (width > max)
			inp.style.width = max + 'px';
		else
			inp.style.width = width + 'px';
		if (jq(n).height() != hgh)
			this._updatePopupPosition(n, this.$n('pp'));
		if (this.fixInputWidth)
			clearTimeout(this.fixInputWidth);
		this.fixInputWidth = null;
	},
	// filt out not matched item
	_fixDisplay: function (opts) {
		var empty = this.$n('empty'),
			str = this.$n('inp').value,
			selItems = this._selItems,
			options = jq(this.$n('sel')).children(),
			index, element, eStyle,
			found = false;
		str = str? str.trim() : '';
		// iterate through item list
		for (index = 0, element = options[index];
			index < options.length;
			index ++, element = options[index])
			if (selItems.indexOf(element) < 0) { // not process selected items
				eStyle = element.style;
				if ((str || str == '')
						&& (str == this._message || element.innerHTML.toLowerCase().startsWith(str.toLowerCase()))) {
					if (!found && opts && opts.hliteFirst) {
						this._setHighlight(element, true);
					}
					eStyle.display = 'block'; // show otherwise
					found = true;
				}
				else
					eStyle.display = 'none'; // hide if has input and not match
			}
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
		pp.style.top = offset.top + jq(n).outerHeight() + 'px';
	},
	// show default message or clear input
	_fixMessage: function () {
		var inp = this.$n('inp');
		inp.value = this._selItems.length == 0? zUtl.encodeXML(this.getMessage()) : '';
		this._fixInputWidth();
	}
});
})();