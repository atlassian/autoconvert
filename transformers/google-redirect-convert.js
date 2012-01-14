(function(){

AJS.toInit(function($){
	var pasteHandler = function(uri, node, done){
        if (uri.host.match(/google.*/) && uri.path === "/url" && uri.queryKey && uri.queryKey.url) {
            var newUri = decodeURIComponent(uri.queryKey.url);
            node = $(node);
            // currently need to do both of these due to the editor storage format
            node.attr('href', newUri);
            node.attr('data-mce-href', newUri);
            node.text(newUri);
            done(node);
        } else {
            done();
        }

	};


	tinymce.plugins.Autoconvert.autoConvert.addHandler(pasteHandler);
});

})();
