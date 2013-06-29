(function(exports) {
	/*

	:00		:15		:30		:45
	0 		1 		2 		3
	4 		5		6		7
	8		9		10		11
	12		13		14		15

	*/

	exports.PMPicker = Spine.Controller.sub({
		tag: "div",
		events: {
			"click td": "sel"
		},
		init: function(value) {


			this.subhour = 0;
			this.hour = 0;

			if (value) {
				this.hour = Math.floor(value);
				this.subhour = Math.floor((value % 1) * 4);
			}

			this.render();	
			this.updateHighlight();
		},
		render: function() {
			var i

			$(this.el).addClass("picker");
			$(this.el).append('<table class="pickertable"></table>');
			
			var table = $(this.el).find('table.pickertable');

			//$('<tr class="topbar"><td>:00</td><td>:15</td><td>:30</td><td>:45</td></tr>').appendTo(table);

			var subhour = [":00", ":15", ":30", ":45"];
			var subhourel = $('<tr class="topbar"></tr>');
			for(i = 0; i < subhour.length; i++) {
				$('<td class="subhouritem">' + subhour[i] + '</td>').data('subhour', i).appendTo(subhourel);
			}
			table.append(subhourel);

			for(i = 0; i < 5; i++) {
				var row = $('<tr></tr>');
				for(var j =0; j < 4; j++) {
					var n = i*4 + j;
					$('<td class="hours">' + n + '</td>')
						.data('hours', n)
						.appendTo(row);
				}
				table.append(row);
			}
		},
		updateHighlight: function() {
			var that = this;
			$(this.el).find("td.subhouritem").each(function(i, item) {
				if ($(item).data('subhour') == that.subhour) {
					$(item).addClass("selected");
				} else {
					$(item).removeClass("selected");
				}
			});
			$(this.el).find("td.hours").each(function(i, item) {
				// console.log("checking hours");
				// console.log(item);
				// console.log(this.hour);
				if ($(item).data('hours') == that.hour) {
					$(item).addClass("selected");
				} else {
					$(item).removeClass("selected");
				}
			});
		},
		getValue: function() {
			return this.hour + (this.subhour / 4);
		},
		sel: function(e) {
			e.preventDefault();

			// console.log("Select something");
			var el = $(e.target);
			if (el.hasClass("subhouritem")) {
				this.subhour = el.data('subhour');
			}
			if (el.hasClass("hours")) {
				this.hour = el.data('hours');
			}
		
			this.updateHighlight();

			if (el.hasClass("hours")) {
				this.trigger('selected', this.getValue());
				this.release();
			}
		}
	});


})(window);

