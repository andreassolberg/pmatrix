(function(exports) {

	var SyncTimer = Spine.Class.sub({
		init: function() {
			this.count = 0;
		},
		ping: function() {
			this.count = 6;
			this.countdown();
		},
		countdown: function() {
			this.count--;
			if (this.count <= 0) {
				this.trigger("fire");
			} else {
				this.trigger("count", (this.count));
				if (this.timeout) {
					clearTimeout(this.timeout);
				}
				this.timeout = setTimeout(this.proxy(this.countdown), 1000);
			}
		}
	});
	SyncTimer.include(Spine.Events);

	exports.PMApp = Spine.Controller.sub({
		events: {
			"tap .prev": "prev",
			"tap .today": "today",
			"tap .next": "next",
			"tap .zoomout": "zoomout",
			"tap .datacell": "zoomin",
			"tap .manage": "manage",
			"tap .settings": "settings",
			"tap .syncnow": "sync",
			"swiperight table": "prev",
			"swipeleft table": "next"
		},
		init: function() {

			this.navigator = new PMDateNav();
			this.store = new PMStore();
			this.manager = null;
			this.settings = null;

			this.synctimer = new SyncTimer();
			this.synctimer.bind("fire", this.proxy(this.sync));


			this.syncEnabled = this.store.getSetting("syncEnable", true);

			$(this.el).append('<div data-role="content" class="controllerbar"></div>');
			
			var controllerbar = $(this.el).find("div.controllerbar");
			$('<input data-role="button" data-inline="true" data-icon="arrow-l" class="prev" type="button" value="Previous" />').appendTo(controllerbar).button();
			$('<input data-role="button" data-inline="true" data-icon="arrow-r" data-iconpos="right" class="next" type="button" value="Next" />').appendTo(controllerbar).button();
			
			this.matrix = new PMMatrix();
			$(this.el).append(this.matrix.el);

			var middlebar = $('<div class="lowerbar"></div>').appendTo(this.el);
			$('<input data-role="button" data-inline="true" data-icon="star" class="today" type="button" value="Today" />').appendTo(middlebar).button();
			$('<input data-role="button" data-inline="true" data-icon="grid" class="zoomout" type="button" value="Zoom out" />').appendTo(middlebar).button();


			var lowerbar = $('<div class="lowerbar"></div>').appendTo(this.el);
			$('<input data-role="button" data-icon="gear" class="manage" type="button" value="Setup projects" />').appendTo(lowerbar).button();

			var syncbar = $('<div class="syncbar"></div>').appendTo(this.el);
			var syncbtn = $('<span class="syncbtn"></span>');
			$('<input data-role="button" class="syncnow" data-icon="refresh" class="settings" type="button" data-inline="true" data-theme="b" value="Sync now" />').appendTo(syncbtn).button();
			syncbtn.appendTo(syncbar);
			$('<input data-role="button" class="settings" data-icon="arrow-r" class="settings" type="button" data-inline="true" data-iconpos="right" value="Sync settings" />').appendTo(syncbar).button();

			this.synctimer.bind("count", this.proxy(function(i) {
				console.log("count " + i);
				$(this.el).find(".syncnow").closest("div.ui-btn").find("span.ui-btn-text").text("Sync " + i);
			}));

			this.update();
			if (this.syncEnabled) {
				this.sync();
			}
		},
		showMessage: function(msg) {
			var msg = $('<p class="message">' + msg + '</p>');
			this.matrix.el.after(msg);

			setTimeout(function() {
				msg.remove();
			}, 5000);
		},
		pagechange: function() {
			console.log("PAGECHANGE()");
		},
		update: function() {
			console.log("Update main app view...");
			var context = this.navigator.getNameContext();
			var cols = this.navigator.getNames();
			var keys = this.navigator.getKeys();
			var data = this.store.aggregate(keys);
			var currentcol = this.navigator.currentKey;

			this.syncEnabled = this.store.getSetting("syncEnable", true);

			// this.showMessage("Sync enabled : " + (this.syncEnabled ? 'YES': 'NO'));

			if (!this.syncEnabled) {
				$(this.el).find("span.syncbtn").hide();
			} else {
				$(this.el).find("span.syncbtn").show();
			}


			$(this.el)
				.removeClass("level0").removeClass("level1").removeClass("level2").removeClass("level3")
				.addClass("level" + this.navigator.level);

			// console.log("context");
			// console.log(context);
			// console.log("cols");
			// console.log(cols);
			// console.log("keys");
			// console.log(keys);

			// context, cols, data
			this.matrix.draw(context, cols, data, currentcol);
			if (this.navigator.currentKey !== null) {
				$(this.el).find(".today").closest("div.ui-btn").addClass('ui-disabled');	
			} else {
				$(this.el).find(".today").closest("div.ui-btn").removeClass('ui-disabled');	
			}
			// console.log("dateindex");
			// console.log(this.store.getDateindex());
			
		},
		sync: function(e) {
			var that = this;
			var r = this.store.getSyncRequest();

			if (navigator.network && navigator.network.connection.type === Connection.NONE) {
				this.showMessage("Not connected to Internet.");
				return;
			}

			$(that.el).find(".syncnow").closest("div.ui-btn").addClass('ui-disabled');
			$(that.el).find(".syncnow").closest("div.ui-btn").find("span.ui-btn-text").text("Syncing..");

			if (e) {
				e.preventDefault();
			}

			$.ajax({
				type: 'POST',
				url: "http://app.solweb.no/pmatrix/sync.php",
				data: JSON.stringify(r),
				success: function(data) {
					console.log("Success Sync respone");
					console.log(data);

					setTimeout(function() {
					$(that.el).find(".syncnow").closest("div.ui-btn").removeClass('ui-disabled');
					$(that.el).find(".syncnow").closest("div.ui-btn").find("span.ui-btn-text").text("Sync now");

					}, 300);

					if (!data.status || data.status === 'error') {
						var emsg = data.message || 'unknown error';
						that.showMessage("Sync error: " + emsg);
						return;
					}

					that.store.processSyncResponse(data);
					that.update();

				},
				error: function(e) {
					this.message("Error syncing: " + e);
				},
				dataType: "json"
			});
		},
		prev: function(e) {
			e.preventDefault();
			this.navigator.prev();
			this.update();
		},
		today: function(e) {
			e.preventDefault();
			this.navigator.today();
			this.update();
		},
		next: function(e) {
			e.preventDefault();
			this.navigator.next();
			this.update();
		},
		zoomout: function(e) {
			e.preventDefault();
			this.navigator.zoomOut(true);
			this.update();
			if (this.navigator.level === 3) {
				$(this.el).find(".zoomout").closest("div.ui-btn").addClass('ui-disabled');
			}
		},
		zoomin: function(e) {
			e.preventDefault();
			var that = this,
				col, project, oldvalue, keys;

				// alert("Cell");

			// console.log($(e.target));

			col = $(e.target).data("col");
			project = $(e.target).data("project");
			oldvalue = $(e.target).data("value");

			keys = this.navigator.getKeys();

			// console.log("Col " + col);
			// console.log("Project " + project);

			if (this.navigator.level > 0) {
				// Zoom in operation
				this.navigator.zoomIn($(e.target).data("col"));
				this.update();
				//this.navigator.zoomIn(0);
			} else {
				
				$(this.el).addClass("showpicker");

				this.picker = new PMPicker(oldvalue);
				$(this.el).append(this.picker.el);

				this.picker.bind("selected", this.proxy(function(value) {
					$(this.el).removeClass("showpicker");
					var d = keys[col][0];
					console.log("Setting new value [" + value + "] earlier [" + oldvalue+ "] to project [" + project + "] on date ["  + d + "]");
					this.store.setDateProject(d, project, value);
					this.synctimer.ping();
					this.update();
				}));

			}
			if (this.navigator.level !== 3) {
				$(this.el).find(".zoomout").closest("div.ui-btn").removeClass('ui-disabled');
			}

		},
		manage: function(e) {
			var s = this.store;
			console.log(s);
			e.preventDefault();
			console.log("Setup manage...");

			if (!this.manager) {
				this.manager = new PMManage({}, s);

				this.manager.bind("changed", this.proxy(this.update));
				//$(this.el).append(manager.el);
				$("body").append(this.manager.el);
				console.log("Setup manage... done");
			} else {
				this.manager.update(false);
			}

			$.mobile.changePage("#pageManage");
		},

		settings: function(e) {
			var s = this.store;
			console.log(s);
			e.preventDefault();
			console.log("Setup settings...");

			if (!this.settings) {
				this.settings = new PMSettings({}, s);

				this.settings.bind("changed", this.proxy(this.update));
				this.settings.bind("syncnow", this.proxy(this.sync));
				//$(this.el).append(manager.el);
				$("body").append(this.settings.el);
				console.log("Setup settings... done");
			}

			$.mobile.changePage("#pageSettings");

		}
	});
	

	$(document).ready(function() {
		exports.a = new PMApp({el: $("div#pageMatrix")});
	});


})(window);
