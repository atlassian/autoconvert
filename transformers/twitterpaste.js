(function(){

AJS.toInit(function($){
    var streamAnchorRegex = /\!\/([^/]+$)/,
        streamPathRegex = /^\/[^/]+$/,
        searchAnchorRegex = /\!\/search\/([^/]+$)/,
        pasteHandler = function(uri, node, done) {
            var decodedAnchor, match, newUrl, macro;

            if (uri.host.match(/^twitter.com/)) {
                decodedAnchor = decodeURI(uri.anchor);
                if (match = decodedAnchor.match(streamAnchorRegex)) {
                    newUrl = uri.protocol + "://twitter.com/" + match[1];
                } else if (match = decodedAnchor.match(searchAnchorRegex)) {
                    newUrl = uri.protocol + "://search.twitter.com/search?q=" + match[1];
                } else if (match = decodeURI(uri.path).match(streamPathRegex)) {
                    newUrl = uri.protocol + "://twitter.com" + match[0];
                }
                if (newUrl) {
                    macro = {name:'widget', params: {url: newUrl}};
                    tinymce.plugins.Autoconvert.convertMacroToDom(macro, done, done);
                }
                else {
                    done();
                }
            }
            else {
                done();
            }
		};
	tinymce.plugins.Autoconvert.autoConvert.addHandler(pasteHandler);
});

})();
