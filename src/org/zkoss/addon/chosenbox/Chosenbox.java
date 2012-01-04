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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.ListIterator;
import java.util.Set;

import org.zkoss.lang.Objects;
import org.zkoss.xel.VariableResolver;
import org.zkoss.zk.au.AuRequests;
import org.zkoss.zk.ui.Component;
import org.zkoss.zk.ui.HtmlBasedComponent;
import org.zkoss.zk.ui.UiException;
import org.zkoss.zk.ui.WrongValueException;
import org.zkoss.zk.ui.event.Event;
import org.zkoss.zk.ui.event.EventListener;
import org.zkoss.zk.ui.event.Events;
import org.zkoss.zk.ui.event.InputEvent;
import org.zkoss.zk.ui.event.OpenEvent;
import org.zkoss.zk.ui.event.SelectEvent;
import org.zkoss.zk.ui.util.ForEachStatus;
import org.zkoss.zk.ui.util.Template;
import org.zkoss.zul.ItemRenderer;
import org.zkoss.zul.Label;
import org.zkoss.zul.ListModel;
import org.zkoss.zul.ListSubModel;
import org.zkoss.zul.event.ListDataEvent;
import org.zkoss.zul.event.ListDataListener;

/**
 * A ZK component like JQuery Chosen.
 * <p>Default {@link #getZclass}: z-chosenbox.
 * It does not create child widgets for each data, so the memory usage is much
 * lower at the server.
 * @author benbai
 * 
 */
public class Chosenbox extends HtmlBasedComponent {
	private List<Integer> _selIdxs = new ArrayList();
	private String _name, _value = "";
	private boolean _disabled;
	private boolean _rendered;
	private int _jsel = -1;
	private int _tabindex;
	private boolean _open;
	private boolean _creatable;
	private boolean _renderByServer;
	private String _emptyMessage;
	private String _noResultsText;
	private String _createMessage;
	private String _separator;
	private transient ListModel<?> _model;
	private transient ListDataListener _dataListener;
	private transient EventListener<InputEvent> _eventListener;
	private transient ItemRenderer<?> _renderer;
	private transient boolean _childable;
	private transient String[] _options;
	private transient String[] _chgSel;
	static {
		addClientEvent(Chosenbox.class, Events.ON_SELECT, CE_DUPLICATE_IGNORE
				| CE_IMPORTANT);
		addClientEvent(Chosenbox.class, Events.ON_FOCUS, CE_DUPLICATE_IGNORE);
		addClientEvent(Chosenbox.class, Events.ON_BLUR, CE_DUPLICATE_IGNORE);
		addClientEvent(Chosenbox.class, Events.ON_OPEN, CE_IMPORTANT);
		// addClientEvent(Chosenbox.class, Events.ON_CHANGING, CE_DUPLICATE_IGNORE);
		addClientEvent(Chosenbox.class, "onSearching", CE_DUPLICATE_IGNORE | CE_IMPORTANT);
		addClientEvent(Chosenbox.class, "onSearch", CE_DUPLICATE_IGNORE | CE_IMPORTANT);
	}
	public String getZclass() {
		return _zclass == null ? "z-chosenbox" : _zclass;
	}
	public void setOpen(boolean open) {
		if (_open != open) {
			_open = open;
			smartUpdate("open", _open);
		}
	}
	public boolean isOpen() {
		return _open;
	}
	/**
	 * Returns the tab order of the input node of this component.
	 * <p>
	 * Default: 0 (means the same as browser's default).
	 */
	public int getTabindex() {
		return _tabindex;
	}

	/**
	 * Sets the tab order of the input node of this component.
	 */
	public void setTabindex(int tabindex) throws WrongValueException {
		if (_tabindex != tabindex) {
			_tabindex = tabindex;
			smartUpdate("tabindex", tabindex);
		}
	}
	/**
	 * Returns whether it is disabled.
	 * <p>
	 * Default: false.
	 */
	public boolean isDisabled() {
		return _disabled;
	}
	/**
	 * Sets whether it is disabled.
	 */
	public void setDisabled(boolean disabled) {
		if (_disabled != disabled) {
			_disabled = disabled;
			smartUpdate("disabled", _disabled);
		}
	}
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
	 */
	public String getName() {
		return _name;
	}

	/**
	 * Sets the name of the input element of this component.
	 * <p>
	 * The name is used only to work with "legacy" Web application that handles
	 * user's request by servlets. It works only with HTTP/HTML-based browsers.
	 * It doesn't work with other kind of clients.
	 * <p>
	 * Don't use this method if your application is purely based on ZK's
	 * event-driven model.
	 * 
	 * @param name
	 *            the name of this component.
	 */
	public void setName(String name) {
		if (name != null && name.length() == 0)
			name = null;
		if (!Objects.equals(_name, name)) {
			_name = name;
			smartUpdate("name", name);
		}
	}
	/**
	 * Returns the emptyMessage of the input of this component.
	 * <p>
	 * Default: null.
	 * <p>
	 * The emptyMessage will be displayed in input if nothing selected and not focused.
	 * @return String
	 */
	public String getEmptyMessage() {
		return _emptyMessage;
	}
	/**
	 * Sets the emptyMessage of the input of this component.
	 * <p>
	 * The emptyMessage will be displayed in input if nothing selected and not focused.
	 * @param String emptyMessage
	 *            the emptyMessage of the input of this component.
	 */
	public void setEmptyMessage(String emptyMessage) {
		if (emptyMessage != null && emptyMessage.length() == 0)
			emptyMessage = null;
		if (!Objects.equals(_emptyMessage, emptyMessage)) {
			_emptyMessage = emptyMessage;
			smartUpdate("emptyMessage", getEmptyMessage());
		}
	}
	/**
	 * Returns the no-result text of this component.
	 * <p>
	 * Default: null.
	 * <p>
	 * The no-result text will be displayed in popup if nothing match to the input value and can not create either,
	 * the syntax "{0}" will be replaced with the input value at client side.
	 * @return String
	 */
	public String getNoResultsText() {
		return _noResultsText;
	}
	/**
	 * Sets the no-result text of this component.
	 * <p>
	 * The no-result text will be displayed in popup if nothing match to the input value and can not create either,
	 * the syntax "{0}" will be replaced with the input value at client side.
	 * @param String noResultsText
	 *            the no-result text of this component.
	 */
	public void setNoResultsText(String noResultsText) {
		if (noResultsText != null && noResultsText.length() == 0)
			noResultsText = null;
		if (!Objects.equals(_noResultsText, noResultsText)) {
			_noResultsText = noResultsText;
			smartUpdate("noResultsText", getNoResultsText());
		}
	}
	/**
	 * Returns the create message of this component.
	 * <p>
	 * Default: null.
	 * <p>
	 * The create message will be displayed in popup if nothing match to the input value but can create as new label,
	 * the syntax "{0}" will be replaced with the input value at client side.
	 * @return String
	 */
	public String getCreateMessage() {
		return _createMessage;
	}
	/**
	 * Sets the create message of this component.
	 * <p>
	 * The create message will be displayed in popup if nothing match to the input value but can create as new label,
	 * the syntax "{0}" will be replaced with the input value at client side.
	 * @param String createMessage
	 *            the create message of this component.
	 */
	public void setCreateMessage(String createMessage) {
		if (createMessage != null && createMessage.length() == 0)
			createMessage = null;
		if (!Objects.equals(_createMessage, createMessage)) {
			_createMessage = createMessage;
			smartUpdate("createMessage", getCreateMessage());
		}
	}
	/**
	 * Returns the separate chars of this component.
	 * <p>
	 * Support: 0-9, A-Z (case insensitive), and ,.;'[]/\-=
	 * <p>
	 * Default: null.
	 * <p>
	 * The separate chars will work as 'Enter' key,
	 * it will not considered as input value but send onSerch or onSearching while key up.
	 * @return String
	 */
	public String getSeparator() {
		return _separator;
	}
	/**
	 * Sets the separate chars of this component.
	 * <p>
	 * Support: 0-9, A-Z (case insensitive), and ,.;'[]/\-=
	 * <p>
	 * The separate chars will work as 'Enter' key,
	 * it will not considered as input value but send onSerch or onSelect while key up. 
	 * @param String createMessage
	 *            the create message of this component.
	 */
	public void setSeparator(String separator) {
		if (separator != null && separator.length() == 0)
			separator = null;
		if (!Objects.equals(_separator, separator)) {
			_separator = separator;
			smartUpdate("separator", getSeparator());
		}
	}
	/**
	 * Returns the selected objects.
	 * @return Set
	 */
	public LinkedHashSet<Object> getSelectedObjects () {
		final LinkedHashSet<Object> objects = new LinkedHashSet<Object>();
		ListModel model = (ListModel)this.getModel();
		if (model != null) {
			for (int i = 0; i < _selIdxs.size(); i ++) {
				objects.add((String)model.getElementAt((Integer)_selIdxs.get(i)));
			}
		}
		return objects;
	}
	/**
	 * Sets the selected objects.
	 * It will clear selection first.
	 * @param List objects
	 *            the objects to select.
	 */
	public void setSelectedObjects (List objects) {
		// do nothing if no model
		if (getModel() != null) {
			_selIdxs.clear();
			ListModel<String> lm = getModel();
			boolean found = false;
			for (int j = 0; j < objects.size(); j ++) {
				for (int i = 0; i < lm.getSize(); i++)
					if (lm.getElementAt(i).equals(objects.get(j))) {
						if (_jsel == -1 || _jsel > i)
							_jsel = i;
						found = true;
						_selIdxs.add(i);
						break;
					}
				if (!found)
					throw new UiException("No such item: " + objects.get(j));
				found = false;
			}
			if (_selIdxs.size() > 0) {
				smartUpdate("chgSel", getChgSel());
			}
		}
	}
	/**
	 * Returns the index of the selected item (-1 if no one is selected).
	 * @return int
	 */
	public int getSelectedIndex() {
		return _jsel;
	}
	/**
	 * Sets the index of the selected item (-1 if no one is selected).
	 * It will clear selection first.
	 * @param int index
	 *            the index to select.
	 */
	public void setSelectedIndex(int jsel) {
		if (jsel <= -1)
			jsel = -1;
		if (jsel < 0) { // unselect all
			clearSelection();
		} else if (jsel != _jsel || _selIdxs.size() > 1) {
			boolean append = false;
			if (_selIdxs.size() > 1 && jsel == _jsel) {
				// clear client side old value
				smartUpdate("selectedIndex", -1);
				append = true;
			}
			// check size
			if (getModel() != null && jsel >= getModel().getSize()) {
				throw new UiException("Out of bound: " + jsel + " while size="
					+ getModel().getSize());
			}
			_selIdxs.clear();
			_jsel = jsel;
			_selIdxs.add(jsel);
			smartUpdate("chgSel", getChgSel());
		}
	}
	/**
	 * Returns whether can create new item.
	 * <p>
	 * Default: false.
	 * <p>
	 * true: will show create message while value of input not exists.
	 * <p>
	 * false: will show no result message while value of input not exists.
	 */
	public boolean isCreatable() {
		return _creatable;
	}
	/**
	 * Sets whether can create new item.
	 * <p>
	 * Default: false.
	 * <p>
	 * true: will show create message while value of input not exists.
	 * <p>
	 * false: will show no-result text while value of input not exists.
	 * 
	 * @param creatable
	 *            the boolean value.
	 */
	public void setCreatable(boolean creatable) {
		if (_creatable != creatable) {
			_creatable = creatable;
			smartUpdate("creatable", _creatable);
		}
	}
	@SuppressWarnings("unchecked")
	public <T> ItemRenderer<T> getRealRenderer() {
		final ItemRenderer renderer = getItemRenderer();
		return renderer != null ? renderer : _defRend;
	}
	/**
	 * Returns the renderer to render each item, or null if the default renderer
	 * is used.
	 */
	@SuppressWarnings("unchecked")
	public <T> ItemRenderer<T> getItemRenderer() {
		return (ItemRenderer) _renderer;
	}
	/**
	 * Returns the model associated with this chosenbox, or null if this
	 * chosenbox is not associated with any list data model.
	 */
	@SuppressWarnings("unchecked")
	public <T> ListModel<T> getModel() {
		return (ListModel) _model;
	}
	/**
	 * Sets the list model associated with this chosenbox. If a non-null model
	 * is assigned, no matter whether it is the same as the previous, it will
	 * always cause re-render.
	 * 
	 * @param model
	 *            the list model to associate, or null to dis-associate any
	 *            previous model.
	 * @exception UiException
	 *                if failed to initialize with the model
	 */
	public void setModel(ListModel<?> model) {
		if (model != null) {
			if (_model != model) {
				// fix selected index
				if (getSelectedIndex() >= model.getSize())
					setSelectedIndex(model.getSize()-1);
				if (_model != null) {
					_model.removeListDataListener(_dataListener);
				}
				_model = model;
				initDataListener();
			}
		} else if (_model != null) {
			_model.removeListDataListener(_dataListener);
			if (_model instanceof ListSubModel)
				removeEventListener("onSearching", _eventListener);
			_model = null;
		}
		fixIndexs(true, null);
		smartUpdate("renderByServer", _model instanceof ListSubModel);
		updateItems();
	}

	/**
	 * Clear all selected objects.
	 */
	public void clearSelection() {
		_selIdxs.clear();
		_jsel = -1;
		smartUpdate("chgSel", getChgSel());
	}
	/**
	 * Add an item into selection.
	 * @param o
	 *            the object to add.
	 */
	public void addItemToSelection(Object o) {
		// do nothing if no model
		if (getModel() != null) {
			ListModel lm = getModel();
			for (int i = 0;i < lm.getSize();i ++) {
				if (lm.getElementAt(i).equals(o)) {
					_selIdxs.add(i);
					if (i < _jsel)
						_jsel = i;
					smartUpdate("chgSel", getChgSel());
				}
			}
		}
	}
	/**
	 * Remove an item from selection.
	 * @param o
	 *            the object to remove.
	 */
	public void removeItemFromSelection(Object o) {
		// do nothing if no model
		if (getModel() != null) {
			ListModel lm = getModel();
			for (int i = 0;i < lm.getSize();i ++) {
				if (lm.getElementAt(i).equals(o)) {
					int cur = -1, min = -1;
					for (int j = 0; j < _selIdxs.size(); j++) {
						if (i == _selIdxs.get(j).intValue()) {
							cur = j;
						} else if (min == -1 || _selIdxs.get(j).intValue() < min) {
							min = _selIdxs.get(j).intValue();
						}
					}
					if (cur != -1) {
						_jsel = min;
						_selIdxs.remove(cur);
						smartUpdate("chgSel", getChgSel());
					}
					break;
				}
			}
		}
	}
	private String[] getChgSel() {
		prepareItems(null, true, _model);
		if (_options != null) {
			String [] chgSel = _options;
			_options = null;
			return chgSel;
		}
		return new String[0];
	}
	
	protected boolean isChildable() {
		return _childable;
	}
	private void prepareData() {
		if (_selIdxs.size() > 0)
			_chgSel = getChgSel();
		if (!(_model instanceof ListSubModel))
			prepareItems(null, false, _model);
	}

	// fix selected indexes while model changed or replaced
	private void fixIndexs(boolean modelReplaced, ListDataEvent event) {
		// model instance is changed
		if (modelReplaced) {
			if (_model == null) {
				clearSelection();
			} else {
				// remove the out of range indexes
				Iterator<Integer>it = _selIdxs.iterator();
				while (it.hasNext()) {
					if (it.next() >= _model.getSize()) {
						it.remove();
					}
				}
			}
		} else {
			int pos0 = event.getIndex0();
			int pos1 = event.getIndex1();
			int amount = pos1 - pos0 + 1;
			switch (event.getType()) {
				case ListDataEvent.INTERVAL_ADDED:
					for (int i = 0; i < _selIdxs.size(); i++) {
						if (_selIdxs.get(i) >= pos0)
							_selIdxs.set(i, _selIdxs.get(i) + amount);
					}
					break;
				case ListDataEvent.INTERVAL_REMOVED:
					for(ListIterator<Integer> lit = _selIdxs.listIterator(); lit.hasNext();) {
						Integer i = lit.next();
						if (i > pos1)
							lit.set(i - amount);
						else if (i >= pos0)
							lit.remove();
					}
					break;
			}
		}
	}
	/**
	 * prepare the list content or selected items to render,
	 * @param prefix
	 *            Only add the item starts with it if it is not null.
	 * @param excludeUnselected
	 *            Only add selected item, with select order.
	 * @param model
	 *            the model to render.
	 */
	private void prepareItems(String prefix, boolean excludeUnselected, ListModel model) {
		if (model != null) {
			List<String> optList = new ArrayList<String>();
			final boolean old = _childable;
			try {
				_childable = true;
				final ItemRenderer renderer = getRealRenderer();
				// order by _selIdxs content if only prepare selected items
				if (excludeUnselected) {
					for (int i = 0; i < _selIdxs.size(); i++) {
						String s = renderer.render(this, model.getElementAt(_selIdxs.get(i)), _selIdxs.get(i));
						if ((prefix == null || s.toLowerCase().startsWith(prefix.toLowerCase())))
							optList.add(s);
					}
				} else {
					for (int i = 0; i < model.getSize(); i++) {
						String s = renderer.render(this, model.getElementAt(i), i);
						if (prefix == null || s.toLowerCase().startsWith(prefix.toLowerCase()))
							optList.add(s);
					}
				}
				if (optList.size() > 0)
					_options = optList.toArray(new String[0]);
			} catch (Exception e) {
				throw UiException.Aide.wrap(e);
			} finally {
				//clear possible children created in renderer
				_childable = old;
				getChildren().clear();
			}
		}
	}
	private void updateItems() {
		prepareItems(null, false, _model);
		if (_options != null) {
			smartUpdate("items", _options);
			_options = null; //purge the data
		}
		smartUpdate("chgSel", getChgSel());
	}

	private void updateListContent(String prefix, ListModel subModel) {
		if ((_model instanceof ListSubModel) && (prefix == null || "".equals(prefix)))
			smartUpdate("listContent", new String[0]);
		else {
			if (!(_model instanceof ListSubModel))
				prepareItems(null, false, subModel);
			else
				prepareItems(prefix, false, subModel);
			if (_options != null) {
				smartUpdate("listContent", _options);
				_options = null; //purge the data
			} else
				smartUpdate("listContent", new String[0]);
		}
	}
	private void initDataListener() {
		if (_dataListener == null)
			_dataListener = new ListDataListener() {
				public void onChange(ListDataEvent event) {
					fixIndexs(false, event);
					updateItems();
				}
			};
		if (_eventListener == null)
			_eventListener = new EventListener<InputEvent>() {
				public void onEvent(InputEvent event) throws Exception {
					if (getModel() instanceof ListSubModel) {
						updateListContent(event.getValue(), ((ListSubModel)_model).getSubModel(event.getValue(), _model.getSize()));
					}
				}
			};
		_model.addListDataListener(_dataListener);

		if (_model instanceof ListSubModel)
			addEventListener("onSearching", _eventListener);
	}
	private Integer getIndexFromValue(String value) {
		for (int i = 0; i < _model.getSize(); i++) {
			if (value.equals(_model.getElementAt(i)))
				return Integer.valueOf(i);
		}
		throw new UiException("No such item: " + value);
	}

	// -- ComponentCtrl --//
	public void invalidate() {
		prepareData();
		super.invalidate();
	}
	protected void renderProperties(org.zkoss.zk.ui.sys.ContentRenderer renderer)
	throws IOException {
		super.renderProperties(renderer);
		if (!_rendered) {
			prepareData();
			_rendered = true;
		}
		if (_options != null) {
			render(renderer, "items", _options);
			_options = null; //purge the data
		}
		if (_chgSel != null) {
			render(renderer, "chgSel", _chgSel);
			_chgSel = null; //purge the data
		}

		render(renderer, "name", _name);
		render(renderer, "disabled", isDisabled());
		if (_tabindex != 0)
			renderer.render("tabindex", _tabindex);

		render(renderer, "emptyMessage", getEmptyMessage());
		render(renderer, "noResultsText", getNoResultsText());
		render(renderer, "separator", getSeparator());
		render(renderer, "createMessage", getCreateMessage());
		renderer.render("selectedIndex", _jsel);
		renderer.render("creatable", _creatable);
		renderer.render("renderByServer", _model instanceof ListSubModel);
		render(renderer, "open", _open);
	}
	@SuppressWarnings("unchecked")
	public void service(org.zkoss.zk.au.AuRequest request, boolean everError) {
		final String cmd = request.getCommand();
		if (cmd.equals(Events.ON_SELECT)) {
			List selItems = (List)request.getData().get("");
			// clear at first
			_selIdxs.clear();
			_jsel = -1;

			for (int i = 0; i < selItems.size(); i++) {
				int idx = getIndexFromValue(selItems.get(i).toString());
				_selIdxs.add(idx);
				if (idx < _jsel || _jsel == -1)
					_jsel = idx;
			}
			final Integer index = getSelectedIndex();
			final Set<Object> objects = getSelectedObjects();
			Events.postEvent(new SelectEvent(Events.ON_SELECT, this, null, 
					objects, null, index, 0));
		} else if (cmd.equals(Events.ON_OPEN)) {
			_open = (Boolean)request.getData().get("open");
			Events.postEvent(OpenEvent.getOpenEvent(request));
		} else if (cmd.equals("onSearch")) {
			Events.postEvent(new Event("onSearch", this, ((List)request.getData().get("")).get(0).toString()));
		} else if (cmd.equals("onSearching")) {
			Object data = ((List)request.getData().get("")).get(0);
			Events.postEvent(new InputEvent(cmd, this, (String)data, _value));
			_value = (String)data;
		}
	}
	private static final ItemRenderer<Object> _defRend = new ItemRenderer<Object>() {
		public String render(final Component owner, final Object data, final int index) {
			final Chosenbox self = (Chosenbox) owner;
			final Template tm = self.getTemplate("model");
			if (tm == null)
				return Objects.toString(data);
			else {
				final Component[] items = tm.create(owner, null,
						new VariableResolver() {
							public Object resolveVariable(String name) {
								if ("each".equals(name)) {
									return data;
								} else if ("forEachStatus".equals(name)) {
									return new ForEachStatus() {
										public ForEachStatus getPrevious() {
											return null;
										}
										public Object getEach() {
											return data;
										}
										public int getIndex() {
											return index;
										}
										public Integer getBegin() {
											return 0;
										}
										public Integer getEnd() {
											return ((Chosenbox)owner).getModel().getSize();
										}
									};
								} else {
									return null;
								}
							}
						}, null);
				if (items.length != 1)
					throw new UiException(
							"The model template must have exactly one item, not "
									+ items.length);
				if (!(items[0] instanceof Label))
					throw new UiException(
							"The model template can only support Label component, not "
									+ items[0]);
				items[0].detach(); //remove the label from owner
				return ((Label) items[0]).getValue();
			}
		}
	};
}
