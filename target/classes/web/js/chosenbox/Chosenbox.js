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
	_width: '300px',
	$init: function () {
		this.$supers('$init', arguments);
		this._selItems = [];
	},
	$define: {
		/**
		 * Returns the tab order of the input of this component.
		 * <p>
		 * Default: 0 (means the same as browser's default).
		 * @return int
		 */
		/**
		 * Sets the tab order of the input of this component.
		 * @param int tabindex
		 */
		tabindex: function (tabindex) {
			var n = this.$n('inp');
			if (n) n.tabindex = tabindex || '';
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
			var n = this.$n('inp');
			if (n) n.disabled = disabled ? 'disabled' : '';
		},
		/**
		 * Returns the name of the input of this component.
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
		 * Sets the name of the input of this component.
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
			var n = this.$n('inp');
			if (n) n.name = name;
		},
		/**
		 * Returns the default message,
		 * it will be displayed if no selected items while not focused.
		 * @return String
		 */
		/**
		 * Sets the default message.
		 * @param String message
		 */
		message: null
	},
	getZclass: function () {
		var zcls = this._zclass;
		return zcls != null ? zcls: "z-chosenbox";
	},
	// update the selected items, the old selection will be cleared at first
	setChgSel: function (val) { //called from the server
		this._clearSelection();
		var sel,
			options;
		if (sel = this.$n('sel')) { // select each item
			options = jq(sel).children();
			var length = options.length,
				s = val.split(','),
				min = this._selectedIndex,
				index;
			for (var i = 0; i < s.length; i++) {
				index = s[i];
				if (min == -1 || min > index)
					min = index;
				if (index < length)
					this._doSelect(options[index], index);
			}
			this._selectedIndex = min;
		} else
			this._chgSel = val; // not binded, just store it
	},
	bind_: function () {
		this.$supers(chosenbox.Chosenbox, 'bind_', arguments);
		var n = this.$n(),
			inp = this.$n('inp'),
			chgSel = this._chgSel;

		this.domListen_(inp, 'onFocus', 'doFocus_')
			.domListen_(inp, 'onBlur', 'doBlur_');
		zWatch.listen({onFloatUp: this});

		n.style.width = this._width;
		this.$n('pp').style.width = jq(n).width() + 'px';
		// fit input width to its value
		this._fixInputWidth();
		// fix selecte status
		if (chgSel) {
			this.setChgSel(chgSel);
			this._chgSel = null;
		}
	},
	unbind_: function () {
		var inp = this.$n('inp');
		this.domUnlisten_(inp, 'onFocus', 'doFocus_')
			.domUnlisten_(inp, 'onBlur', 'doBlur_');
		zWatch.unlisten({onFloatUp: this});
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
		if (jq(target).hasClass(this.getZclass() + '-option'))
			this._hliteOpt(target, true);
	},
	doMouseOut_: function (evt) {
		var target = evt.domTarget;
		// mouseout option
		if (target.className.indexOf('option') > 0)
			this._hliteOpt(target, false);
	},
	_hliteOpt: function (target, highlight) {
		var zcls = this.getZclass() + '-option-over';
		if (highlight) {
			var oldHlite = jq(this.$n('sel')).find('.'+this.getZclass()+'-option-over')[0];
			if (oldHlite)
				jq(oldHlite).removeClass(zcls);
			jq(target).addClass(zcls);
		} else
			jq(target).removeClass(zcls);
	},
	_doArrowDown: function (key, evt) {
		if (key == 'up')
			this._moveOptionFocus('prev');
		else if (key == 'down')
			this._moveOptionFocus('next');
		else {
			var inp = this.$n('inp'),
				pos = zk(inp).getSelectionRange(),
				label = jq(this.$n()).find('.' + this.getZclass() + '-sel-item-focus')[0];
			// only works if cursor is at the begining of input
			if (pos[0] == 0 && pos[1] == 0) {
				if (key == 'left')
					this._moveLabelFocus(label, 'prev');
				else if (key == 'right') {
					if (label)
						evt.stop();
					this._moveLabelFocus(label, 'next');
				}
			}
		}
	},
	// focus previous or next visible option,
	// depends on dir
	_moveOptionFocus: function (dir) {
		var sel = this.$n('sel'),
			$sel = jq(sel),
			oldHlite = $sel.find('.'+this.getZclass()+'-option-over')[0],
			newHlite,
			next = dir == 'next',
			prev = dir == 'prev';
		if (next && !this._open) // default focus first while open
			this.setOpen(true, {sendOnOpen: true});
		else {
			// preset newHlite
			if (oldHlite) {
				this._hliteOpt(oldHlite, false);
				newHlite = next? oldHlite.nextSibling : oldHlite.previousSibling;
			}
			else
				newHlite = next? sel.firstChild : // choose first/last option if no old highlighted
					prev? sel.lastChild : null;
			if (newHlite)
				if (next)// find closest next unselected option
					while (newHlite && newHlite.style.display == 'none')
						newHlite = newHlite.nextSibling;
				else if (prev) // find closest previous unselected option
					while (newHlite && newHlite.style.display == 'none')
						newHlite = newHlite.previousSibling;

			if (newHlite)
				this._hliteOpt(newHlite, true);
		}
	},
	// focus previous or next label,
	// depends on dir
	_moveLabelFocus: function (label, dir) {
		var zcls = this.getZclass() + '-sel-item-focus',
			newLabel,
			prev = dir == 'prev',
			next = dir == 'next';
		if (label) {
			jq(label).removeClass(zcls);
			newLabel = prev? label.previousSibling :
				next? label.nextSibling : null;
			if (prev && !newLabel)
				newLabel = label;
			else if (next && newLabel == this.$n('inp'))
					newLabel = null;
		} else if (prev)
			newLabel = this.$n('inp').previousSibling;
		if (newLabel)
			jq(newLabel).addClass(zcls);
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
				var dir = (label.previousSibling && key == 'backspace')? 'prev' : 'next';
				this._moveLabelFocus(label, dir);
				this._doDeselect(label, {sendOnSelect: true, fixSelectedIndex: true});
				evt.stop(); // should stop or will delete text
				// maybe have to filt out deselected item
				this._fixDisplay();
			}
			else if ((label = inp.previousSibling) && key == 'backspace')
				jq(label).addClass(zcls);
		}
	},
	_removeLabelFocus: function () {
		var zcls = this.getZclass() + '-sel-item-focus',
			label = jq(this.$n()).find('.' + zcls)[0];
		if (label)
			jq(label).removeClass(zcls);
	},
	// called after press enter and release
	_doEnterPressed: function () {
		var $sel,
			hlited;
		if (this._open && ($sel = jq(this.$n('sel')))
			&& (hlited = $sel.find('.'+this.getZclass()+'-option-over')[0])) {
			var options = $sel.children(),
				index;
			for (index = 0; index < options.length; index++)
				if (hlited == options[index]) {
					this._doSelect(hlited, index, {sendOnSelect: true});
					this.setOpen(false, {sendOnOpen: true});
					break;
				}
		}
	},
	doClick_: function (evt) {
		this._removeLabelFocus();
		var target = evt.domTarget,
			inp = this.$n('inp'),
			clsnm = target.className;
		if (clsnm.indexOf('option') > 0) { // click on option
			var options = jq(this.$n('sel')).children(),
				index;
			for (index = 0; index < options.length; index++)
				if (target == options[index]) {
					this._doSelect(target, index, {sendOnSelect: true});
					break;
				}
			this.setOpen(false, {sendOnOpen: true});
		} else {
			// click on label
			if (clsnm.indexOf('sel-item') > 0) {
				var label = target,
					$label = jq(label),
					zcls = this.getZclass() + '-sel-item';
				if ($label.hasClass(zcls) || (label = $label.parent('.' + zcls)[0]))
					jq(label).addClass(zcls + '-focus');
			}
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
		var _index = this._selectedIndex;
		if (_index && (index < _index || _index == -1))
				this._selectedIndex = index;
		else if (_index != 0) // undefined, null
			this._selectedIndex = index;
		if (this._selItems.indexOf(target) == -1) {
			this._createLabel(target, index);
			target.style.display = 'none'; // hide selected item
			// record the selected item
			this._selItems.push(target);
			this._fixMessage();

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
			min = -1,
			index;
		if (n)
			c = n.firstChild;
		while (c && ((index = c.opt_index) || index == 0)) {
			if (min == -1 || index < min)
				min = index;
			if (min == 0)
				break;
			c = c.nextSibling;
		}
		this._selectedIndex = min;
	},
	// create label for selected item
	_createLabel: function (target, index) {
		var span = document.createElement("span"),
			content = document.createElement("div"),
			delbtn = document.createElement("div"),
			wgt = this,
			zcls = this.getZclass();
		span.opt_index = index; // save the index
		span.className = zcls + '-sel-item';
		content.innerHTML = target.innerHTML;
		content.className = zcls + '-sel-item-cnt';
		delbtn.className = zcls + '-del-btn';
		
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
			c, // selected item
			del,
			index;
		if (n)
			c = n.firstChild;
			while (c) {
				del = c;
				c = c.nextSibling;
				index = del.opt_index;
				if (index || index == 0)
					this._doDeselect(del, opts);
				else
					break;
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
			this._removeLabelFocus();
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
				this._fixMessage();
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
		max = parseInt(this._width) - 10;
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
						this._hliteOpt(element, true);
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
		this._fixDisplay();
	},
	domAttrs_: function () {
		var v;
		return this.$supers('domAttrs_', arguments)
			+ (this.isDisabled() ? ' disabled="disabled"' :'')
			+ ((v=this.getMessage()) ? ' value="' + zUtl.encodeXML(v) + '"': '')
			+ ((v=this.getTabindex()) ? ' tabindex="' + v + '"': '')
			+ ((v=this.getName()) ? ' name="' + zUtl.encodeXML(v) + '"': '');
	}
});
})();