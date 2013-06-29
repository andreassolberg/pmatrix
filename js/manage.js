(function(exports) {


	exports.PMManage = Spine.Controller.sub({
		tag: "div",
		events: {
			"tap .back": "back",
			"tap .addproject": "addproject",
			"change input.project_name": "updateName",
			"change input.project_budget": "updateBudget",
			"change input.project_active": "updateActive"
			// "tap .next": "next",
			// "tap .zoomout": "zoomout",
			// "tap .datacell": "zoomin",
			// "swiperight table": "prev",
			// "swipeleft table": "next" 
		},
		init: function(i, store) {

			console.log("   ---> Setting up a new PMManage instance");
			this.store = store;
			this.template = this.store.getTemplate();

			$(this.el).attr('id', "pageManage");
			$(this.el).attr('data-role', "page");

			$(this.el).append('<div data-role="header"><h1>Manage projects</h1></div>');

			$('<div class="projectlist"></div>').appendTo(this.el);
			
			
			// ="c" (or b)

			$('<input data-role="button" data-icon="arrow-l" class="back" type="button" data-inline="true" value="Back" />').appendTo(this.el).button();
			$('<input data-role="button" data-icon="plus" class="addproject" type="button" data-inline="true" value="Add new project" />').appendTo(this.el).button();
			
		
			this.update(true);
			// this.update();
		},
		getProjectItemElement: function(e) {
			return $(e.target).closest("div.project_item");
		},
		getProject: function(e) {
			return $(e.target).closest("div.project_item").data("key");
		},
		save: function() {
			console.log("Saving template...");
			console.log(this.template);
			this.store.setTemplate(this.template);
		},
		updateName: function(e) {
			console.log("Name updated...");

			console.log(e.target);
			var key = this.getProject(e);
			console.log("Key was [" + key + "], and template was:");
			console.log(this.template);
			if (!key) return;
			if (!this.template[key]) return;

			var value = $(e.target).attr("value");

			this.template[key]["name"] = value;
			this.save();

			var pel = this.getProjectItemElement(e);
			$(pel).find("h3 span.ui-btn-text").text(value);
		},
		updateBudget: function(e) {
			console.log("Budget updated...");
			console.log(e.target);
			var key = this.getProject(e);
			if (!key) return;
			if (!this.template[key]) return;
			this.template[key]["budget"] = parseInt($(e.target).attr("value"), 10);
			this.save();
		},
		updateActive: function(e) {
			console.log("Active updated...");
			console.log(e.target);
			var key = this.getProject(e);
			if (!key) return;
			if (!this.template[key]) return;

			var value = $(e.target).prop("checked");

			this.template[key]["active"] = value;
			this.save();

			var pel = this.getProjectItemElement(e);
			console.log("Active setting data theme to " + value);

			$(pel).attr("data-theme", (value ? "b": "c") );
			$(pel).closest("#pageMatrix").trigger("pageshow");
		},
		back: function() {
			this.save();
			this.trigger("changed");
			$.mobile.changePage("#pageMatrix", { transition: "slide", changeHash: true, reverse: true });
			// this.release();
		},
		guid: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
		},
		addproject: function() {
			console.log("About to add a new project");
			
			console.log(this.template);
			this.template[this.guid()] = {name: "New project", active: true};
			this.save();
			this.update(false);
		},
		update: function(first) {
			var projectlist = $(this.el).find("div.projectlist");
			projectlist.empty();

			var projectlistinner = $('<div class="projectlistcollapsible" data-role="collapsible-set" data-mini="true"></div>');

			this.template = this.store.getTemplate();

			for(var key in this.template) {
				console.log("Template [" + key +"]");
				console.log(this.template[key]);
				
				var itemel = $('<div class="project_item" data-role="collapsible"></div>')
					.data("key", key)
					.append('<h3>' + this.template[key]['name'] + '</h3>')
					.append('<label for="name_' + key + '">Project title</label>')
					.append('<input type="text" class="project_name" name="name_' + key + '" id="name_' + key + '" value="' + this.template[key]['name'] + '" />')
					.append('<label for="budget_' + key + '">Weekly hours (optional)</label>')
					// .append('<input type="number" name="budget_' + key + '" id="budget_' + key + '" value="' + this.template[key]['budget'] + '" />')
					.append('<input type="range" class="project_budget" name="budget_' + key + '" id="budget_' + key + '" value="" min="0" max="50" step="0.5" />')
					.append('<input type="checkbox" class="project_active" name="active_' + key + '" id="active_' + key + '" class="custom" />')
					.append('<label for="active_' + key + '">Project active?</label>');
				
				if (this.template[key].active) {
					itemel.attr("data-theme", "c");
					itemel.find("input[name=active_" + key + "]").prop("checked", true);
				} else {
					itemel.attr("data-theme", "c");
					itemel.find("input[name=active_" + key + "]").prop("checked", false)
				}
				if (this.template[key].budget) {
					itemel.find("input[name=budget_" + key + "]").attr("value", this.template[key].budget);
				}
				
				itemel.appendTo(projectlistinner);

			}

			projectlistinner.appendTo(projectlist);

			if (!first) {
				console.log("UPDATE REFRESH");
				projectlist.trigger("create");
			}
			
			
		}

	});
	exports.PMManage.extend(Spine.Events);


})(window);
