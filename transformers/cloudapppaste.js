(function(){

AJS.toInit(function($){
    AJS.Editor.CloudAppPaste = {
        pasteHandler : function(uri, node, done){
            if (uri.host == 'cl.ly') {
                $.get(AJS.params.contextPath + '/rest/autoconvert/1.0/cloudappembed?resource=' + uri.path.substr(1), function(data){
					if (data){
                        switch(data.item_type) {
                            case 'image' :
						        done($('<img class="confluence-embedded-image confluence-external-resource" src="' + data.content_url + '" data-image-src="' + data.url + '"/>')[0]);
                                break;
                            case 'bookmark' :
                                node.text(data.name);
                                node.attr('href', data.redirect_url)
                                done(node);
                                break;
                        }
                        return;
					}
					else{
						done();
					}
				});
            } else {
                done();
                return;
            }
        }
    };
    tinymce.plugins.Autoconvert.autoConvert.addHandler(AJS.Editor.CloudAppPaste.pasteHandler);
});

})();
