Chosenbox - Allow multiple value version
=========================================
A project like [JQuery Chosen](https://github.com/harvesthq/chosen/) but work with [ZK](http://www.zkoss.org/)

This version handle all index and filter at both client side and server side,
detect items by checking whether they are the same object,
so you can create two or more different items with the same value.

The master will go the ZK ListSubModel way which has no 'index' concept in it,
it will detect items by String.equals() method and use the index of first matched object,
it can not handle multiple objects with the same value.

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

Properties and Features
------------------------------

### placeholder
------------------------------
A message displayed in input box if nothing selected and not focused.

### createMessage
------------------------------
A message displayed in drop-down list while user input a value which not in model and creatable is set to true.

### noResultsText
------------------------------
A message displayed in drop-down list while user input a value which is not match any item.

### separator
------------------------------
The char set that will be considered as ENTER key.
Supports: 0-9, A-Z (case insensitive), and ,.;'[]/\\-=

### creatable
------------------------------
Set the action for inexist value.

true: Display createMessage while user input a value which not in model, and send it back with onSearch event if user press the ENTER key or separator.
false: Display noResultsText while user input a value which not in model.

### renderByServer
------------------------------
Sets whether the content of drop-down list will generate at server side dynamically,
have to listen to onSearching if set it to true, for example:
<pre><code>
&lt;chosenbox width="200px" model="${model}" renderByServer="true" onSearching="" /&gt;
</code></pre>
.

true: The content of drop-down list will not rendered to client side, and is blank without input,
server will provide the 'matched' content after user input, this will cause some delay at client side.

false: All the content will send to client side and process at client side,
this will cause performance issue if there are a lot of item (e.g., 40000 or more) in model.
