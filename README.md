Chosenbox
=========================================
A project like [JQuery Chosen](https://github.com/harvesthq/chosen/) but work with [ZK](http://www.zkoss.org/)

Employement/Purpose
------------------------------

- A multiple selectbox.

Example
------------------------------

<pre><code>
&lt;zk&gt;
	&lt;zscript&gt;&lt;![CDATA[
		String[] userName = { new String("Tony"), new String("Ryan"), new String("Jumper"), new String("Wing"), new String("Sam")};
		ListModelList model = new ListModelList(userName);
	]]&gt;&lt;/zscript&gt;
	&lt;chosenbox width="200px" model="${model}" /&gt;
&lt;/zk&gt;
</code></pre>

[View Result](https://github.com/benbai123/chosenbox/blob/master/sample_src/img/Chosenbox_ex_01.png)

### More examples
------------------------------
There is a project under /sample_src/project called MultiInOne, it is a maven project so you can import and run it if you have appropriate maven environment.

Without maven, you can download the latest ZK6 Freshly and put the jars with dist/lib/chosenbox.jar into WEB-INF/lib as need.


Properties and Features
------------------------------

### model
------------------------------
Sets the ListModel of this chosenbox.

If you set ListModelList to it,
All the content will send to client side and process at client side,
this is pretty fast with few items but will cause performance issue at client side if there are lots of items (e.g., 40000 or more) in model.

If you set ListSubMmodel to it,
The content of drop-down list will not rendered to client side, and is blank without input,
server will provide the 'matched' content after user input,
this will cause some delay at client side cause by the server processing time and network transfer time.

### emptyMessage
------------------------------
The emptyMessage will be displayed in input if nothing selected and not focused.

### createMessage
------------------------------
The create message will be displayed in popup if nothing match to the input value but can create as new label,
the syntax "{0}" will be replaced with the input value at client side.

### noResultsText
------------------------------
The no-result text will be displayed in popup if nothing match to the input value and can not create either,
the syntax "{0}" will be replaced with the input value at client side.

### separator
------------------------------
The separate chars will work as 'Enter' key,
it will not considered as input value but send onSerch or onSelect while key up.
Supports: 0-9, A-Z (case insensitive), and ,.;'[]/\\-=

### creatable
------------------------------
Set the action for inexist value.

true: Display createMessage while user input a value which not in model, and send it back with onSearch event if user press the ENTER key or separator.
false: Display noResultsText while user input a value which not in model.

tabindex
------------------------------
The tab order of the input node of this component.

Default: 0 (means the same as browser's default).

### name
------------------------------
Sets the name of the input element of this component.

The name is used only to work with "legacy" Web application that handles
user's request by servlets. It works only with HTTP/HTML-based browsers.
It doesn't work with other kind of clients.

Don't use this method if your application is purely based on ZK's
event-driven model.

### disabled
------------------------------
Sets whether it is disabled.

Properties and Features
------------------------------

### onSelect
------------------------------
Event: SelectEvent

Data: Selected objects, can get from SelectEvent#getSelectedObjects()

An item selected/deselected.

### onSearching
------------------------------
Event: InputEvent

Data: Value, can get from InputEvent#getValue()

Input field content changed, it will trigger event listener of model if use ListSubModel

### onSearch
------------------------------
Event: Event

Data: Value to search, cen get from event#getData()

User input a new item and want to create it.

### onOpen
------------------------------
Event: OpenEvent

Data: Open status, can get from OpenEvent#isOpoen()

Drop-down list opened/closed.
