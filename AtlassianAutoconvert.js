(function($){
	/***********
	 * Constructor
	 */
	tinymce.plugins.Autoconvert = function(ed){
		ed.onUndo.add(this.cleanLinks);
		this.editor = ed;
		this.handlers = [];
	};

	/***********
	 * Instance Methods
	 */
	tinymce.plugins.Autoconvert.prototype.addHandler = function (handler){
		this.handlers.push(handler)
	};
	
	tinymce.plugins.Autoconvert.prototype.cleanLinks = function(ed, level){
		$('a.atlassian-autoconvert', ed.getDoc()).removeClass('atlassian-autoconvert');
		return true;
	};

	tinymce.plugins.Autoconvert.prototype.callHandlers = function (node){
		var index = 0,
			self = this,
			originalNode = $(node),
			node = $(node).clone(),
            rawHref = node.attr('href'),
			uri = parseUri(hackAtSymbols(rawHref));
		
		/**
		 * Runs handlers one at a time, this method acts as a continuation and is passed to each handler.
		 */
		function run(newNode){
			if (newNode && (newNode.length !== 1 || !newNode.attr('href'))) {
				return handlersFinished(newNode);
			}

			if (newNode) {
				node = newNode;
				index = 0;
				uri = parseUri(node.attr('href'));
				callHandler(self.handlers[index], uri, node);
			} else {
				index++;
				if (index < self.handlers.length) {
					callHandler(self.handlers[index], uri, node)
				} else {
					return handlersFinished(node);
				}
			}
		}

		/**
		 * This method ensures that a single handler can't break the event loop by never calling the continuation or by
		 * calling it multiple times.
		 */
		function callHandler(callback, uri, node){
			var modifiableRun = run,
				timer,
				continuation;
				
			continuation = function(){
				var localIndex = index;
				clearTimeout(timer);
				
				//actually call the next iteration of run
				modifiableRun.apply(self, arguments);
				
				//ensure a single handler can't call continuation multiple times
				modifiableRun = function(){
					AJS.log('Autoconvert: Callback #' + localIndex + ' called the continuation multiple times.');
				}
			};
			timer = setTimeout(function(){
				AJS.log("Autoconvert: Callback #" + index + " failed to call continuation in time. If there is no subsequent log, the handler is improperly implemented and should be uninstalled.");
				modifiableRun = function(){
					AJS.log("Autoconvert: Callback #" + index + " did eventualy return. Probably a slow async call.");
				};
				run();
			}, tinymce.plugins.Autoconvert.callbackTimeout);

			//Call the callback passing it a modified version of the continuation that allows us to prevent continuing after a timeout.
			callback(uri, node, continuation);
		}

		function handlersFinished(newNode){
			self.editor.undoManager.beforeChange();
			var selection = self.editor.selection,
				bm = self.editor.selection.getBookmark();
			
			
			//replace node that's actually in the editor with the newly modified node
			originalNode.replaceWith(newNode);
			
			selection.moveToBookmark(bm);
			self.editor.undoManager.add();
			
			
		}

		if (this.handlers.length !== 0) {
			callHandler(this.handlers[0], uri, node)
		}
	};

    /***********
	 * Static properties
	 */
    tinymce.plugins.Autoconvert.callbackTimeout = 5000;

	/***********
	 * Static methods
	 */
	tinymce.plugins.Autoconvert.convertMacroToDom = function(macro, success, error){
		var conversionData = {
			macro : macro,
			contentId :  AJS.Meta.get("content-id")
		};
		$.ajax( {
			type : "POST",
			contentType : "application/json; charset=utf-8",
			url : AJS.params.contextPath + "/rest/tinymce/1/macro/placeholder",
			data : $.toJSON(conversionData),
			dataType : "text", // if this is switched back to json be sure to use "text json". See CONFDEV-4799 for details.
			success : success,
			error : error,
			timeout: 45000
		});
	};
	
	tinymce.plugins.Autoconvert.convertMacroToDomViaWikiText = function(macro, success, error){
		var wikiTxt = ['{', macro.name];
		var firstParam = true;
		if (macro.defaultParameterValue){
			wikiTxt.push(':', macro.defaultParameterValue);
			firstParam = false;
		}
		for (var key in macro.params){
			if (firstParam){
				wikiTxt.push(':');
				firstParam = false;
			}
			else{
				wikiTxt.push('|');
			}
			wikiTxt.push(key,'=',macro.params[key]);
		}
		wikiTxt.push('}');
		tinymce.plugins.Autoconvert.getHtmlFromWikiMarkup(
			wikiTxt.join(''),
			function(data){ 
				success($(data)[0]);
			},
			function(){
				error();
			}
		);

	};
	tinymce.plugins.Autoconvert.getHtmlFromWikiMarkup = function(text, success, error){
		var conversionData = {
			wiki : text,
			entityId :  AJS.Meta.get("content-id"),
			spaceKey : AJS.Meta.get("space-key")
		};
		$.ajax( {
			type : "POST",
			contentType : "application/json; charset=utf-8",
			url : AJS.params.contextPath + "/rest/tinymce/1/wikixhtmlconverter",
			data : $.toJSON(conversionData),
			dataType : "text", // if this is switched back to json be sure to use "text json". See CONFDEV-4799 for details.
			success : success,
			error : error,
			timeout: 45000
		});
	};

	/***********
	 * Private methods
	 */

	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License
	function parseUri (str) {
		var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

		while (i--) uri[o.key[i]] = m[i] || "";

		uri[o.q.name] = {};
		uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
			if ($1) uri[o.q.name][$1] = $2;
		});

		return uri;
	}
	parseUri.options = {
		strictMode: false,
		key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
		q:   {
			name:   "queryKey",
			parser: /(?:^|&)([^&=]*)=?([^&]*)/g
		},
		parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		}
	};


    /**
     * parseUri has a bug whereby it deems everything up to the first @ to be part of the "authority"
     * section of the Uri. Even in strict mode.  We should fix this properly, but for now, we're just
     * replacing the firt @ with an encoded one.
     */
    function hackAtSymbols(rawHref)
    {
        return rawHref.replace(/^(.*?\/\/[^/]*?\/.*?)(@)/, "$1%40");
    }

})(jQuery);
