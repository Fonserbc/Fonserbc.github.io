$(function() {
    
    // Globals
	window.stage = "";
    window.stageInfos = [];
    
    var stageNames = ["about", "music", "videos", "events", "contact"];
    var stageMap = {};
    for (let i = 0; i < stageNames.length; ++i) {
        let name = stageNames[i];
        
        let stage = {
            name: name,
            view: $("#"+name),
            button: $("#"+name+"-button"),
            content: $("#"+name+"-content")
        };
        
        window.stageInfos.push(stage);
        stage.button.on("click", function () {window.setStage(stage.name);});
        stageMap[name] = stage;
    }
    
    window.setStage = function(stage) {
        if (window.stage == stage) {
            return;
        }
        
        // Update Visibilites
		for (let i = 0; i < window.stageInfos.length; ++i) {
			let view = window.stageInfos[i].view;
            let button = window.stageInfos[i].button;
			let name = window.stageInfos[i].name;
            let content = window.stageInfos[i].content;
			
			if (name == stage) {
                view.removeClass("hidden");
                content.removeClass("hidden");
                button.addClass("active");
            }
			else {
                view.addClass("hidden");
                content.addClass("hidden");
                button.removeClass("active");
            }
		}
        
        // pause youtube videos
        /*stageMap["videos"].content.find("iframe").each(function () {
            let iframe = $(this).get()[0]contentWindow;
            if (iframe != null) 
                iframe.postMessage('{"event":"command","func":"pauseVideo","args":""}','*');
        });*/
        
        window.stage = stage;
    }
    
    
    window.setStage("about");
});