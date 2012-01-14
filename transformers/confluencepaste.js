(function(){

AJS.toInit(function($){
	var pasteHandler =function(uri, node, done){
		if (!isConfluence(uri)) {
			done();
			return;
		}

        var stripContextPath = function(uri){
            return AJS.contextPath() ? uri.path.substring(AJS.contextPath().length + 1) : uri.path.substring(1);
        };

		var path = stripContextPath(uri),
			parts = decodeURIComponent(path).split('/'),
			linkString;

		if (parts.length === 2 && parts[0] === "display" && parts[1].indexOf('~') === 0) {
			//http://localhost:8080/confluence/display/~admin
			linkString = parts[1];
		} else if (uri.queryKey && uri.queryKey.focusedCommentId) {
			//http://localhost:8080/confluence/pages/viewpage.action?pageId=32784&focusedCommentId=1212425#comment-1212425
			linkString = '$' + uri.queryKey.focusedCommentId;
		} else if (parts.length === 3 && parts[0] === "display") {
			//http://localhost:8080/confluence/display/ds/Home
			linkString =  parts[1] + ':' + parts[2].replace(/\+/g, ' ');
		} else if (parts.length === 4 && parts[0] === "display" && parts[1] === "status") {
			//http://localhost:8080/confluence/display/status/admin/1212424
			linkString = '$' + parts[3];
		} else if (parts.length === 6 && parts[0] == "display") {
			//http://localhost:8080/confluence/display/ds/2011/10/27/jwafej+again+dog
			linkString = parts[1] + ':' + '/' + parts[2] + '/' + parts[3] + '/' + parts[4] + '/' + parts[5].replace(/\+/g, ' ');
		} else if (parts.length === 2 && parts[0] === "pages" && parts[1] === "viewpage.action") {
			//http://localhost:8080/confluence/pages/viewpage.action?pageId=32784
			if (uri.queryKey && uri.queryKey.pageId) {
				linkString = '$' + uri.queryKey.pageId;
			}
		} else {
			done();
			return;
		}

		linkString = "[" + linkString + "]";

		tinymce.plugins.Autoconvert.getHtmlFromWikiMarkup(
			linkString,
			function(data){
				done($(data).children()[0]);
			},
			function(){
				done();
			});
	};

	var isConfluence = function(uri){
		var isConfluence = true;
		isConfluence = isConfluence && uri.authority === document.location.host;
		isConfluence = isConfluence && (!AJS.contextPath() || uri.path.indexOf(AJS.contextPath()) === 0);
		return isConfluence;
	};


	tinymce.plugins.Autoconvert.autoConvert.addHandler(pasteHandler);
});

})();
