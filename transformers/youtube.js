(function(){

AJS.toInit(function($) {
    tinymce.plugins.Autoconvert.autoConvert.addHandler(function(uri, node, done){
        if (uri.host.match('.*youtu\.be.*')) {
            var vidId = uri.path.substr(1);
            var newurl = "http://youtube.com/watch?v=" + vidId;
            done ($(node).attr("href", newurl).html(newurl));
        } else { 
            done();
        }
    });
});

})();
