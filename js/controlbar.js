(function(exports) {

// NOT IN USE

	exports.PMControlBar = Spine.Controller.sub({
		tag: "div",
		events: {
			"click .prev": "prev",
			"click .today": "today",
			"click .next": "next",
			"click .zoomout": "zoomout"
		},
		init: function() {
			console.log("this el is ");
			console.log(this.el);

			$(this.el).append('<input class="prev" type="button" value="Prev" />');
			$(this.el).append('<input class="today" type="button" value="Today" />');
			$(this.el).append('<input class="next" type="button" value="Next" />');
			$(this.el).append('<input class="zoomout" type="button" value="ZoomOut" />');
		},
		click: function() {
			this.trigger("next");
		}

	});
	exports.PMControlBar.extend(Spine.Events);
	
	

	

})(window);
