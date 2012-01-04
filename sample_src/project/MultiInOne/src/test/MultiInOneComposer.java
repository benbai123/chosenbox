package test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.zkoss.addon.chosenbox.Chosenbox;
import org.zkoss.zk.ui.Component;
import org.zkoss.zk.ui.event.Event;
import org.zkoss.zk.ui.event.Events;
import org.zkoss.zk.ui.event.ForwardEvent;
import org.zkoss.zk.ui.event.SelectEvent;
import org.zkoss.zk.ui.util.GenericForwardComposer;
import org.zkoss.zul.Label;
import org.zkoss.zul.ListModelList;

public class MultiInOneComposer extends GenericForwardComposer {
	Chosenbox chosen;
	Label result;
	List<Integer> selectedIndexes = new ArrayList<Integer>();

	Map<String, String[]> selections = new HashMap(); // map for store each level of list
	Map<String, Integer> lvMap = new HashMap();		  // map for mapping an item to its level
	private static final int AT_LAST_LEVEL = 2;

	// init
	public void doAfterCompose(Component comp) throws Exception {
		super.doAfterCompose(comp);
		chosen.setEmptyMessage("Pick what you would like to eat/drink");
		chosen.setNoResultsText("No such item\n - {0}");
		initSelections();
		chosen.setModel(new ListModelList(selections.get("first")));
		chosen.setCreateMessage("Search new item - {0}");
	}
	public void onSelect$chosen(Event event) {
		event = getOriginEvent(event);
		LinkedHashSet<String> s = (LinkedHashSet)((SelectEvent)event).getSelectedObjects();
		chosen.setCreatable(false);
		if (s.size() < 3) // change model if not finish
			changeModel(s);
		else // show the result
			showResult(s, false, null);
	}
	public void onSearch$chosen(Event event) {
		event = getOriginEvent(event);
		LinkedHashSet s = chosen.getSelectedObjects();
		chosen.setCreatable(false);
		showResult(s, true, (String)event.getData());
	}

	private void changeModel(LinkedHashSet selectedObjects) {
		Iterator<String> it = selectedObjects.iterator();
		String cur, last = null;
		List<String> l = new ArrayList<String>(), nmodel = new ArrayList<String>();
		int i = 1;
		while(it.hasNext()) {
			cur = it.next();
			// the level of current object should equal to loop count
			// or it will be droped
			if (lvMap.get(cur) != null && lvMap.get(cur) == i) {
				last = cur;
				l.add(cur);
				if (i == AT_LAST_LEVEL) // last level is creatable
					chosen.setCreatable(true);
			}
			i++;
		}
		if (last != null) {
			nmodel.addAll(l); // put the current selection to new model
			nmodel.addAll(Arrays.asList(selections.get(last))); // add next list
			chosen.setModel(new ListModelList(nmodel.toArray(new String[0])));
			chosen.setSelectedObjects(l); // set current selection as selected with respect to the new model
		} else { // get first list
			chosen.setModel(new ListModelList(selections.get("first")));
			chosen.clearSelection();
		}
	}
	private void showResult(LinkedHashSet selectedObjects, boolean onSearch, String searchData) {
		Iterator<String> it = selectedObjects.iterator();
		List<String> resultList = new ArrayList<String>();
		StringBuilder sb = new StringBuilder();
		sb.append("You selected: ");
		int i = 0;
		while(it.hasNext()) {
			String s = it.next();
			if (i > 0)
				sb.append(" - ");
			sb.append(s);
			resultList.add(s);
			i++;
		}
		if (onSearch) { // last one is not exist, but creatable
			sb.append(" - ").append(searchData).append("\n currently no such item,\n we will search it.");
			resultList.add(searchData);
		}
		// set the model only contains current selection
		chosen.setModel(new ListModelList(resultList.toArray()));
		chosen.setSelectedObjects(resultList);
		result.setValue(sb.toString());
		sb.setLength(0);
	}
	// prepare the selections
	private void initSelections() {
		addSelection("first", 0, new String[]{"Food", "Drink"});
		addSelection("Food", 1, new String[]{"Bread", "Noddle"});
		addSelection("Drink", 1, new String[]{"Hot", "Cold"});
		addSelection("Bread", 2, new String[]{"Berry Bread", "Cheese Bread"});
		addSelection("Noddle", 2, new String[]{"Bacon Pasta", "Beef Noddle"});
		addSelection("Hot", 2, new String[]{"Milk", "Coffee"});
		addSelection("Cold", 2, new String[]{"Cola", "Juice"});
	}
	private void addSelection(String value, Integer level, String[] nextList) {
		selections.put(value, nextList);
		lvMap.put(value, level);
	}
	// get the real event
	private Event getOriginEvent(Event event) {
		if (event instanceof ForwardEvent)
			event = Events.getRealOrigin((ForwardEvent)event);
		return event;
	}
}