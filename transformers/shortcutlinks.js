(function(){

AJS.toInit(function($){
    var shortcutLinkConfigurations = [];
    var contextPath;
    if (AJS.contextPath()) {
        contextPath = AJS.contextPath();
    } else {
        contextPath = "";
    }

    var loadShortcutLinkConfiguration = function () {
        AJS.$.ajax({
            url: contextPath + "/rest/autoconvert/latest/shortcutlinkconfigurations",
            type: "GET",
            dataType: "json",
            success: function(data) {
                shortcutLinkConfigurations = data["configurations"];
                for (var i = 0; i < shortcutLinkConfigurations.length; i++) {
                    var config = shortcutLinkConfigurations[i];
                    try {
                        config.regex = new RegExp(translateToRegex(config.expandedValue, config.defaultAlias));
                    } catch(e) {
                        console.log('Failed to generated regex for ' + config);
                    }
                }
            },
            error: function(response)
            {
                console.log('Failed to load shortcut link configurations ' + response.statusText);
            }
        });
    }

    var translateToRegex = function (expandedValue, defaultAlias) {
        if (expandedValue.indexOf("%s") >= 0)
        {
            return expandedValue.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&").replace("%s", "(.*)");
        }
        return expandedValue.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + "(.*)";
    };

	var pasteHandler = function(uri, node, done){
		if (uri.source !== node.text()) {
			done();
			return;
		}
        for (var i = 0; i < shortcutLinkConfigurations.length; i++) {
            var shortcutLinkConfig = shortcutLinkConfigurations[i];
            var matches = uri.source.match(shortcutLinkConfig.regex);
            if (matches) {
                var q = matches[1];
                if (shortcutLinkConfig.defaultAlias) {
                    var newText = shortcutLinkConfig.defaultAlias.replace(/%s/, q);
                    done($(node).text(newText));
                    return;
                }
                done($(node).text(q));
                return;
            }
        }
		done();
	};
	
	tinymce.plugins.Autoconvert.autoConvert.addHandler(pasteHandler);
	setTimeout(function(){
		loadShortcutLinkConfiguration();
	}, 0);
});

})();
