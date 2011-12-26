A project like [JQuery Chosen](https://github.com/harvesthq/chosen/) but work with [ZK](http://www.zkoss.org/)
=========================================

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

[View Result](https://github.com/benbai123/chosenbox/blob/master/Chosenbox_ex_01.png)