(function(){

AJS.toInit(function($){
	AJS.Editor.SkitchPaste = {
		pasteHandler : function(uri,node, done){
			if (uri.host == 'www.skitch.com' || uri.host == 'skitch.com'){
				$.get(AJS.params.contextPath + '/rest/autoconvert/1.0/skitchembed?url=' + uri.source, function(data){
					if (data && data.url){
						done($('<img class="confluence-embedded-image confluence-external-resource" src="' + data.url + '" data-image-src="' + data.url + '"/>')[0]);
					}
					else{
						done();
					}
				});
			}
			else{
				done();
			}
		}
	}
	tinymce.plugins.Autoconvert.autoConvert.addHandler(AJS.Editor.SkitchPaste.pasteHandler);
});

})();
