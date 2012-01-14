(function(){

AJS.toInit(function($){
    var pasteRegexes = [/youtube.com\/watch\?/, /vimeo.com\/[0-9]+/, /maps.google(.[a-z]+)+\/maps/];
	Confluence.Editor.WidgetPaste = {
		pasteHandler : function(uri, node, done){
			var urlSrc = decodeURI(uri.source),
				i = 0;

			for (; i < pasteRegexes.length; i++){
				if (urlSrc.match(pasteRegexes[i])){
					break;
				}
			}
			
			if (i < pasteRegexes.length){
				macro = {name:'widget', params: {url: urlSrc}};
				tinymce.plugins.Autoconvert.convertMacroToDom(macro, done, done);
			}
			else{
				done();
			}
		}
	};
	tinymce.plugins.Autoconvert.autoConvert.addHandler(AJS.Editor.WidgetPaste.pasteHandler);
});

})();
