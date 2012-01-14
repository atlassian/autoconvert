(function($){

	/**
	 * Pulled directly out of Confluence there are thing that don't work in a standard
	 * TinyMCE setup. We have other plugins that handle link creation on paste and
	 * many of the transformers rely on Confluence to proxy the web services that they
	 * wish to call out too. 
	 *
	 * add tinymce plugin framework dependency code for paste plugin
	 * add autolink functionality 
	 * remove $ dep
	 */
	tinymce.create('tinymce.plugins.AutoconvertPlugin', {
		init: function (ed){
			var autoConvert = tinymce.plugins.Autoconvert.autoConvert = new tinymce.plugins.Autoconvert(ed);
			
			ed.onInit.add(function(){
				ed.plugins.paste.onPostProcess.add(function(pl, o) {
					tinymce.isIE || makeLinks(o.node);
					var anchor = $(o.node).children('a');
					if ( anchor.length === 1 && anchor[0].tagName === "A" && anchor.text() === anchor.attr('href')) {
						anchor.attr('class', 'atlassian-autoconvert');
						setTimeout(function(){
							var anchor = $('a.atlassian-autoconvert', $(ed.selection.getNode().ownerDocument)).removeClass('atlassian-autoconvert');
							autoConvert.callHandlers(anchor);
						}, 0);
					}
				});

				ed.addCommand("addAutoconverter", function(ui, options) {
					autoConvert.addHandler(options);
				});
			});
		},
        getInfo: function() {
            return {
                longname: 'Atlassian Autoconvert',
                author: 'Atlassian',
                authorurl: 'http://www.atlassian.com',
                infourl: 'http://www.atlassian.com',
                version: '1.0'
            };
        }
	});

	tinymce.PluginManager.add('autoconvert', tinymce.plugins.AutoconvertPlugin);
	
	/**
	 * Regex used to match URIs too short to be perfect
	 */
	var urlRegEx = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?¬´¬ª‚Äú‚Äù‚Äò‚Äô]))/;
	/**
	 * Creates an anchor with href attribute from a paste containing only a textNode which maches a URI regex.
	 */
	function makeLinks(node){
		if (node.childNodes.length > 1 || node.childNodes[0].nodeType != 3)
			return;
		
		var textNode = node.childNodes[0],
		match = urlRegEx.exec(textNode.data),
		prefix;
		
		if (match && match[0].length === textNode.data.length) {
			prefix = match && match[0].indexOf('://') == -1 ? 'http://' : '';
			$(textNode).wrap("<a href='" + prefix + textNode.data + "'></a>");
		}				
	}
})(jQuery);
