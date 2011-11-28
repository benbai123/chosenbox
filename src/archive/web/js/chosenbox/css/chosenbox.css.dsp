<%@ taglib uri="http://www.zkoss.org/dsp/web/core" prefix="c" %>

.z-chosenbox {
	display:-moz-inline-box;
	display: inline-block;
	zoom: 1;
	white-space: normal; <%-- Bug ZK-477 --%>
	<c:if test="${zk.ie < 8}">
		display: inline;
	</c:if>
	border: 1px solid #CCCCCC;
}
.z-chosenbox-cnt {
	zoom: 1;
	padding: 3px;
	<c:if test="${zk.ie < 8}">
		position: relative;
	</c:if>
	overflow: hidden;
}
.z-chosenbox-sel-item {
	border: 1px solid #CCCCCC;
	display: inline-block;
	<c:if test="${zk.ie < 8}">
		display: inline;
	</c:if>
}
.z-chosenbox-del-btn {
	border: 1px solid #CCCCCC;
	display: inline-block;
	<c:if test="${zk.ie < 8}">
		display: inline;
	</c:if>
}
.z-chosenbox-inp {
	display: inline-block;
	width: 30px;
	<c:if test="${zk.ie < 8}">
		display: inline;
	</c:if>
	font-size: ${fontSizeM};
	font-family: ${fontFamilyC};
}
.z-chosenbox-txcnt {
	display: none;
	font-size: ${fontSizeM};
	font-family: ${fontFamilyC};
	white-space: nowrap;
}
.z-chosenbox-pp {
	position: absolute;
	background-color: #FFFFFF;
	border: 0 none;
	font-family: ${fontFamilyC};
	font-size: ${fontSizeM};
	font-weight: normal;
	margin:0;
	overflow:hidden;
	padding-top: 2px;

	-moz-box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.35);
	-moz-border-radius: 1px 1px 1px 1px;
	<c:if test="${zk.ie < 8}">
		border: 1px solid #CCCCCC;
	</c:if>
}

.z-chosenbox-pp-hidden {
	display: none;
}
.z-chosenbox-option {
	cursor: pointer;
}
.z-chosenbox-option-over {
	cursor: pointer;
	background-color: #2626BB;
}