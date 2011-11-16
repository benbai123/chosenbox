/* Chosenbox.js

	Purpose:
		
	Description:
		
	History:
		Tue Nov 16 15:15:52 TST 2011, Created by benbai

Copyright (C) 2011 Potix Corporation. All Rights Reserved.

This program is distributed under LGPL Version 3.0 in the hope that
it will be useful, but WITHOUT ANY WARRANTY.
*/
chosenbox.Chosenbox = zk.$extends(zul.wgt.Selectbox, {
	bind_: function () {
		this.$supers(chosenbox.Chosenbox, 'bind_', arguments);
	}
});