/* chosenbox.js

	Purpose:
		
	Description:
		
	History:
		Tue Nov 16 15:15:52 TST 2011, Created by benbai

Copyright (C) 2011 Potix Corporation. All Rights Reserved.

This program is distributed under LGPL Version 3.0 in the hope that
it will be useful, but WITHOUT ANY WARRANTY.
*/
function (out) {
	var zcls = this.getZclass(),
		uid = this.uuid;
	out.push('<div id="', uid, '" class="',zcls,'">',
			'<div id="', uid, '-cnt" class="',zcls,'-cnt">',
			'<input id="', uid, '-inp" class="',zcls,'-inp"></input>',
			'<div id="', uid, '-txcnt" class="',zcls,'-txcnt"></div>', // hidden field for change input width dynamically
			'<div id="', uid, '-pp" class="',zcls,'-pp ', zcls,'-pp-hidden">',
			'<div id="', uid, '-sel" class="',zcls,'-sel">');
	var s = $eval(this.items) || [] ;
	for (var i = 0, j = s.length; i < j; i++) {
		out.push('<div class="',zcls,'-option">', s[i], '</div>');
	}
	out.push('</div>',
			'<div id="', uid, '-empty" class="',zcls,'-empty"></div>','</div></div></div>');
}