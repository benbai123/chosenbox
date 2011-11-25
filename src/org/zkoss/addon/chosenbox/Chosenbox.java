/* Chosenbox.java

	Purpose:
		
	Description:
		
	History:
		Tue Nov 16 15:15:52 TST 2011, Created by benbai

Copyright (C) 2011 Potix Corporation. All Rights Reserved.

{{IS_RIGHT
	This program is distributed under LGPL Version 3.0 in the hope that
	it will be useful, but WITHOUT ANY WARRANTY.
}}IS_RIGHT
*/
package org.zkoss.addon.chosenbox;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.zkoss.json.JSONArray;
import org.zkoss.lang.Objects;
import org.zkoss.zk.ui.event.Events;
import org.zkoss.zk.ui.event.SelectEvent;
import org.zkoss.zul.ListModel;
import org.zkoss.zul.ListModelList;
import org.zkoss.zul.Listitem;
import org.zkoss.zul.Selectbox;

/**
 * A ZK component like JQuery Chosen.
 * <p>Default {@link #getZclass}: z-chosenbox.
 * It does not create child widgets for each data, so the memory usage is much
 * lower at the server.
 * @author benbai
 * 
 */
public class Chosenbox extends Selectbox {
	private List _selIdxs = new ArrayList();
	private int _selIdx = -1;
	static {
		addClientEvent(Selectbox.class, Events.ON_SELECT, CE_DUPLICATE_IGNORE|CE_IMPORTANT);
		addClientEvent(Selectbox.class, Events.ON_FOCUS, CE_DUPLICATE_IGNORE);
		addClientEvent(Selectbox.class, Events.ON_BLUR, CE_DUPLICATE_IGNORE);
	}
	public String getZclass() {
		return _zclass == null ? "z-chosenbox" : _zclass;
	}
	public List getSelectedItems () {
		List selection = new ArrayList();
		ListModel model = (ListModel)this.getModel();
		for (int i = 0; i < _selIdxs.size(); i ++) {
			selection.add((String)model.getElementAt((Integer)_selIdxs.get(i)));
		}
		return selection;
	}
	public void setSelectedItems (List items) {
		ListModel<String> lm = this.getModel();
		final StringBuffer sb = new StringBuffer(80);
		for (int i = 0; i < lm.getSize(); i++) {
			for (int j = 0; j < items.size(); j ++)
				if (lm.getElementAt(i) == items.get(j)) {
					if (sb.length() > 0)
						sb.append(',');
					sb.append(i);
				}
		}
		if (sb.length() > 0)
			smartUpdate("chgSel", sb.toString());
		sb.setLength(0);
	}
	public void setSelectedIndex(int jsel) {
		if (!_selIdxs.contains(jsel)) {
			_selIdxs.add(jsel);
			Collections.sort(_selIdxs);
		}
		super.setSelectedIndex(jsel);
	}
	public void service(org.zkoss.zk.au.AuRequest request, boolean everError) {
		final String cmd = request.getCommand();
		System.out.println(cmd);
		if (cmd.equals(Events.ON_SELECT)) {
			SelectEvent evt = SelectEvent.getSelectEvent(request);
			List selIdxs = ((List)request.getData().get("items"));
			_selIdxs.clear();
			for (int i = 0; i < selIdxs.size();)
				_selIdxs.add(Integer.valueOf((String)selIdxs.remove(i)));
			Events.postEvent(evt);
		}
	}
}
