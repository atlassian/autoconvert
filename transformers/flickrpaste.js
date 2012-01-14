(function(){

AJS.toInit(function($){
    var tagPathRegex = /^\/photos\/tags\/[^/]+/,
        setPathRegex = /^\/photos\/[^/]+\/sets\/[0-9]+/,
        photoPathRegex = /^\/photos\/[^/]+\/[0-9]+/,
        pasteHandler = function(uri, node, done) {
            var decodedPath;

            if (uri.host.match(/flickr.com/)) {
                decodedPath = decodeURIComponent(uri.path);
                if (decodedPath.match(tagPathRegex) ||
                    decodedPath.match(setPathRegex) ||
                    decodedPath.match(photoPathRegex)) {
                    macro = {name:'widget', params: {url: decodeURI(uri.source)}};
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
