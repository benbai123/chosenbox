<%@ taglib uri="http://www.zkoss.org/dsp/web/core" prefix="c" %>

.z-chosenbox {
	background-color: #FFF;
	background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0.85, white), color-stop(0.99, #EEEEEE));
	background-image: -webkit-linear-gradient(center bottom, white 85%, #EEEEEE 99%);
	background-image: -moz-linear-gradient(center bottom, white 85%, #EEEEEE 99%);
	background-image: -o-linear-gradient(bottom, white 85%, #EEEEEE 99%);
	background-image: -ms-linear-gradient(top, #FFFFFF 85%,#EEEEEE 99%);
	filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#FFFFFF', endColorstr='#EEEEEE',GradientType=0 );
	background-image: linear-gradient(top, #FFFFFF 85%,#EEEEEE 99%);

	display:-moz-inline-box;
	display: inline-block;
	overflow: hidden;
	<c:if test="${zk.ie < 8}">
		zoom: 1;
		display: inline;
	</c:if>
	border: 1px solid #CCCCCC;
}
.z-chosenbox-focus {
	border: 1px solid #5897FB;
}
.z-chosenbox-sel {
	padding-bottom: 3px;
}
.z-chosenbox-sel-item {
	-webkit-border-radius: 3px;
	-moz-border-radius   : 3px;
	border-radius        : 3px;
	-moz-background-clip   : padding;
	-webkit-background-clip: padding-box;
	background-clip        : padding-box;
	background-color: #E4E4E4;
	background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0, #E4E4E4), color-stop(0.7, #EEEEEE));
	background-image: -webkit-linear-gradient(center bottom, #E4E4E4 0%, #EEEEEE 70%);
	background-image: -moz-linear-gradient(center bottom, #E4E4E4 0%, #EEEEEE 70%);
	background-image: -o-linear-gradient(bottom, #E4E4E4 0%, #EEEEEE 70%);
	background-image: -ms-linear-gradient(top, #E4E4E4 0%,#EEEEEE 70%);
	filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#E4E4E4', endColorstr='#EEEEEE',GradientType=0 );
	background-image: linear-gradient(top, #E4E4E4 0%,#EEEEEE 70%);
	color: #333;
	border: 1px solid #B4B4B4;
	margin: 3px 0px 3px 5px;
	white-space: nowrap;
	display: inline-block;
	<c:if test="${zk.ie < 8}">
		display: inline;
		zoom: 1;
	</c:if>
}
.z-chosenbox-sel-item-cnt {
	font-size: 13px;
	font-family: 'lucida grande',tahoma,verdana,arial,sans-serif;
	padding: 0px 2px;
	display: inline-block;
	<c:if test="${zk.ie < 8}">
		display: inline;
	</c:if>
}
.z-chosenbox-sel-item-focus {
	background: #D4D4D4;
	border-color: #FED700;
}
.z-chosenbox-del-btn {
	width: 12px;
	height: 13px;
	font-size: 1px;
	background: url(${c:encodeURL('~./zul/img/button/chosen-sprite.png')}) right top no-repeat;
	border: 1px solid #CCCCCC;

	display: inline-block;
	<c:if test="${zk.ie < 8}">
		display: inline;
		background: url(${c:encodeURL('~./zul/img/button/chosen-del.gif')}) no-repeat;
		zoom: 1;
	</c:if>

}
.z-chosenbox-inp {
	color: #666;
	background: transparent !important;
	border: 0 !important;

	outline: 0;
	-webkit-box-shadow: none;
	-moz-box-shadow   : none;
	-o-box-shadow     : none;
	box-shadow        : none;

	padding: 7px;

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
	border: 1px solid #CCCCCC;
	border-top: 0;
	font-family: ${fontFamilyC};
	font-size: ${fontSizeM};
	font-weight: normal;
	margin:0;
	overflow:hidden;

	-webkit-box-shadow: 0 4px 5px rgba(0,0,0,.15);
	-moz-box-shadow   : 0 4px 5px rgba(0,0,0,.15);
	-o-box-shadow     : 0 4px 5px rgba(0,0,0,.15);
	box-shadow        : 0 4px 5px rgba(0,0,0,.15);
}

.z-chosenbox-pp-hidden {
	display: none;
}
.z-chosenbox-option {
	cursor: pointer;
	padding-top: 3px;
	padding-left: 10px;
}
.z-chosenbox-option-over {
	background-color: #D3EFFA;
}
.z-chosenbox-empty {
	padding: 3px;
	padding-left: 10px;
}
.z-chosenbox-empty-creatable {
	cursor: pointer;
	background-color: #D3EFFA;
}