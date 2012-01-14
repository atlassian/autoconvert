(function(){

AJS.toInit(function($){
	AJS.Editor.JiraConnector.Paste =
	{
		issueKeyRegEx : /\/browse\/([A-Z][A-Z]+-[0-9]+)/,
		jqlRegEx : /\?|\&jqlQuery\=([^&]+)$|&/,
		pasteHandler: function(uri,node, done){
			var servers = AJS.Editor.JiraConnector.servers,
				i = 0;
				//href = AJS.$(node).attr('href');

			if (!servers){
				done();
				return;
			}
			
			for (; i < servers.length; i++){
				if (uri.source.indexOf(servers[i].url) == 0){
					break;
				}
			}
			// see if we had a hit
			var macro;
			if (i < servers.length){
				var singleKey = AJS.Editor.JiraConnector.Paste.issueKeyRegEx.exec(uri.source);
				if (singleKey){
					macro = {name: 'jira', params: {server: servers[i].name}, defaultParameterValue: singleKey[1]}
				}
				else{
					jql = AJS.Editor.JiraConnector.Paste.jqlRegEx.exec(uri.query);
					if (jql){
						macro = {name: 'jira', params: {server: servers[i].name}, defaultParameterValue: decodeURIComponent(jql[1].replace(/\+/g, '%20'))}
					}
				}
			}
			if (macro){
				tinymce.plugins.Autoconvert.convertMacroToDom(macro, done, done);
			}
			else{
				done();
			}
		}
	}
	tinymce.plugins.Autoconvert.autoConvert.addHandler(AJS.Editor.JiraConnector.Paste.pasteHandler);
});

})();
