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
	private String _placeholder = "";
	private String _noResultsText = "";
	private String _createMessage = "";
	private String _separator = "";
	private transient ListModel<?> _model;
	private transient ListDataListener _dataListener;
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
	 * Returns the tab order of this component.
	 * <p>
	 * Default: 0 (means the same as browser's default).
	 */
	public int getTabindex() {
		return _tabindex;
	}

	/**
	 * Sets the tab order of this component.
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
	 * Sets the name of this component.
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
	 * Returns the placeholder of the input of this component.
	 * <p>
	 * Default: empty string.
	 * <p>
	 * The placeholder will be displayed in input if nothing selected and not focused.
	 * @return String
	 */
	public String getPlaceholder() {
		return _placeholder;
	}
	/**
	 * Sets the placeholder of the input of this component.
	 * <p>
	 * The placeholder will be displayed in input if nothing selected and not focused.
	 * @param String placeholder
	 *            the placeholder of the input of this component.
	 */
	public void setPlaceholder(String placeholder) {
		if (placeholder == null)
			placeholder = "";
		if (!Objects.equals(_placeholder, placeholder)) {
			_placeholder = placeholder;
			smartUpdate("placeholder", getPlaceholder());
		}
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
		if (noResultsText == null)
			noResultsText = "";
		if (!Objects.equals(_noResultsText, noResultsText)) {
			_noResultsText = noResultsText;
			smartUpdate("noResultsText", getNoResultsText());
		}
	}
	/**
	 * Returns the no-result text of this component.
	 * <p>
	 * Default: empty string.
	 * <p>
	 * The no-result text will be displayed in popup if nothing match to the input value and can not create either,
	 * the syntax "{0}" will be replaced with the input value at client side.
	 * @return String
	 */
	public String getNoResultsText() {
		return _noResultsText;
	}
	/**
	 * Returns the create message of this component.
	 * <p>
	 * Default: empty string.
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
		if (createMessage == null)
			createMessage = "";
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
	 * Default: empty string.
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
	 * it will not considered as input value but send onSerch or onSearching while key up. 
	 * @param String createMessage
	 *            the create message of this component.
	 */
	public void setSeparator(String separator) {
		if (separator == null)
			separator = "";
		if (!Objects.equals(_separator, separator)) {
			_separator = separator;
			smartUpdate("separator", getSeparator());
		}
	}
	/**
	 * Returns the selected objects.
	 * @return Set
	 */
	public Set<Object> getSelectedObjects () {
		final Set<Object> objects = new LinkedHashSet<Object>();
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
			List<String> chgSel = new ArrayList<String>();
			boolean found = false;
			for (int j = 0; j < objects.size(); j ++) {
				for (int i = 0; i < lm.getSize(); i++)
					if (lm.getElementAt(i) == objects.get(j)) {
						if (getSelectedIndex() == -1 || getSelectedIndex() > i)
							_jsel = i;
						if (!isRenderByServer())
							chgSel.add(i+"");
						found = true;
						_selIdxs.add(i);
						break;
					}
				if (!found)
					throw new UiException("No such item: " + objects.get(j));
				found = false;
			}
			if (isRenderByServer()) {
				prepareItems(null, false, true);
				if (_options != null) {
					smartUpdate("chgSel", _options);
					_options = null;
				}
			} else if (chgSel.size() > 0)
				smartUpdate("chgSel", chgSel.toArray(new String[0]));
			chgSel.clear();
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
			if (isRenderByServer())
				smartUpdate("chgSel", getChgSel());
			else
				smartUpdate("selectedIndex", jsel, append);
		}
	}
	/**
	 * Returns whether the drop-down list is rendered by server side.
	 * <p>
	 * Default: false.
	 * <p>
	 * true: client side will not handle the drop-down options.
	 * <p>
	 * false: client side will handle the drop-down options.
	 */
	public boolean isRenderByServer() {
		return _renderByServer;
	}
	/**
	 * Sets whether the drop-down list is rendered by server side.
	 * <p>
	 * Default: false.
	 * <p>
	 * true: client side will not handle the drop-down options.
	 * <p>
	 * false: client side will handle the drop-down options.
	 * 
	 * @param renderByServer
	 *            the boolean value.
	 */
	public void setRenderByServer(boolean renderByServer) {
		if (_renderByServer != renderByServer) {
			if (!renderByServer) {
				prepareItems(null, false, false);
				if (_options != null) {
					smartUpdate("listContent", _options);
					_options = null; //purge the data
				}
			}
			_renderByServer = renderByServer;
			smartUpdate("renderByServer", _renderByServer);
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
			_model = null;
		}
		fixIndexs(true);
		updateItems(null);
	}

	/**
	 * Clear all selected objects.
	 */
	public void clearSelection() {
		_selIdxs.clear();
		_jsel = -1;
		if (isRenderByServer())
			smartUpdate("chgSel", getChgSel());
		else
			smartUpdate("selectedIndex", -1);
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
				if (lm.getElementAt(i) == o) {
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
				if (lm.getElementAt(i) == o) {
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
		if (isRenderByServer()) {
			prepareItems(null, false, true);
			if (_options != null) {
				String [] chgSel = _options;
				_options = null;
				return chgSel;
			}
		} else {
			ListModel<String> lm = getModel();
			List<String> chgSel = new ArrayList<String>();
			for (Integer i : _selIdxs) {
				chgSel.add(i.toString());
			}
			return chgSel.toArray(new String[0]);
		}
		return new String[0];
	}
	
	protected boolean isChildable() {
		return _childable;
	}
	private void prepareData() {
		if (_selIdxs.size() > 0)
			_chgSel = getChgSel();
		if (!isRenderByServer())
			prepareItems(null, false, false);
	}

	// fix selected indexes while model changed or replaced
	private void fixIndexs(boolean modelReplaced) {
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
		}
	}
	// render model content to String array
	private void prepareItems(String prefix, boolean excludeSelected, boolean excludeUnselected) {
		if (_model != null) {
			List<String> optList = new ArrayList<String>();
			final boolean old = _childable;
			try {
				_childable = true;
				final ItemRenderer renderer = getRealRenderer();
				for (int i = 0; i < _model.getSize(); i++) {
					String s = renderer.render(this, _model.getElementAt(i), i) + "_" + i;
					if ((prefix == null || s.toLowerCase().startsWith(prefix.toLowerCase()))
							&& (!excludeSelected || !_selIdxs.contains(Integer.valueOf(i)))
							&& (!excludeUnselected || _selIdxs.contains(Integer.valueOf(i))))
						optList.add(s);
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
	private void updateItems(String prefix) {
		prepareItems(prefix, false, false);
		if (_options != null) {
			smartUpdate("items", _options);
			_options = null; //purge the data
		}
		smartUpdate("chgSel", getChgSel());
	}

	private void updateListContent(String prefix) {
		if (isRenderByServer()
			&& (prefix == null || "".equals(prefix)))
			smartUpdate("listContent", new String[0]);
		else {
			prepareItems(prefix, false, false);
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
					updateItems(null);
				}
			};
		_model.addListDataListener(_dataListener);
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
		render(renderer, "renderByServer", isRenderByServer());
		if (_tabindex != 0)
			renderer.render("tabindex", _tabindex);

		render(renderer, "placeholder", getPlaceholder());
		render(renderer, "noResultsText", getNoResultsText());
		render(renderer, "separator", getSeparator());
		render(renderer, "createMessage", getCreateMessage());
		renderer.render("selectedIndex", _jsel);
		renderer.render("creatable", _creatable);
		render(renderer, "open", _open);
	}
	@SuppressWarnings("unchecked")
	public void service(org.zkoss.zk.au.AuRequest request, boolean everError) {
		final String cmd = request.getCommand();
		if (cmd.equals(Events.ON_SELECT)) {
			List selIdxs = (List)request.getData().get("");
			// clear at first
			_selIdxs.clear();
			_jsel = -1;

			for (int i = 0; i < selIdxs.size(); i++) {
				int idx = Integer.parseInt(selIdxs.get(i).toString());
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
			String value;
			if (data == null)
				value = "";
			else
				value = data.toString();
			_value = value;
			if (isRenderByServer())
				updateListContent(value);
			Events.postEvent(new InputEvent(cmd, this, value, _value));
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
