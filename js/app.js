(function(exports) {


	var SyncTimer = function() {

		this.listeners = {};
		this.count = 0;
	}

	SyncTimer.prototype.ping = function() {
		this.count = 6;
		this.countdown();
	}

	SyncTimer.prototype.countdown = function() {
		this.count--;
		if (this.count <= 0) {
			this.trigger("fire");
		} else {
			this.trigger("count", (this.count));
			if (this.timeout) {
				clearTimeout(this.timeout);
			}
			this.timeout = setTimeout($.proxy(this.countdown, this), 1000);
		}
	}

	SyncTimer.prototype.trigger = function(type, data) {
		console.log("listeners", this.listeners);
		if (this.listeners[type]) {
			this.listeners[type](data);
		}
	}

	SyncTimer.prototype.bind = function(type, func) {
		this.listeners[type] = func;
	};

	// SyncTimer.include(Spine.Events);

	var PMApp = function(container) {
		this.container = container;

		this.container.on('tap', '.prev', $.proxy(this.prev, this));
		this.container.on('tap', '.today', $.proxy(this.today, this));
		this.container.on('tap', '.next', $.proxy(this.next, this));
		this.container.on('tap', '.zoomout', $.proxy(this.zoomout, this));
		this.container.on('tap', '.datacell', $.proxy(this.zoomin, this));
		this.container.on('tap', '.manage', $.proxy(this.manage, this));
		this.container.on('tap', '.settings', $.proxy(this.settings, this));
		this.container.on('tap', '.syncnow', $.proxy(this.sync, this));


		this.navigator = new PMDateNav();
		this.store = new PMStore();
		this.manager = null;
		this.settings = null;

		this.synctimer = new SyncTimer();
		this.synctimer.bind("fire", $.proxy(this.sync, this));


		this.syncEnabled = this.store.getSetting("syncEnable", true);

		$(this.container).append('<div data-role="content" class="controllerbar"></div>');
		
		var controllerbar = $(this.container).find("div.controllerbar");
		$('<input data-role="button" data-inline="true" data-icon="arrow-l" class="prev" type="button" value="Previous" />').appendTo(controllerbar).button();
		$('<input data-role="button" data-inline="true" data-icon="arrow-r" data-iconpos="right" class="next" type="button" value="Next" />').appendTo(controllerbar).button();
		
		this.matrix = new PMMatrix();
		$(this.container).append(this.matrix.el);

		var middlebar = $('<div class="lowerbar"></div>').appendTo(this.container);
		$('<input data-role="button" data-inline="true" data-icon="star" class="today" type="button" value="Today" />').appendTo(middlebar).button();
		$('<input data-role="button" data-inline="true" data-icon="grid" class="zoomout" type="button" value="Zoom out" />').appendTo(middlebar).button();


		var lowerbar = $('<div class="lowerbar"></div>').appendTo(this.container);
		$('<input data-role="button" data-icon="gear" class="manage" type="button" value="Setup projects" />').appendTo(lowerbar).button();

		var syncbar = $('<div class="syncbar"></div>').appendTo(this.container);
		var syncbtn = $('<span class="syncbtn"></span>');
		$('<input data-role="button" class="syncnow" data-icon="refresh" class="settings" type="button" data-inline="true" data-theme="b" value="Sync now" />').appendTo(syncbtn).button();
		syncbtn.appendTo(syncbar);
		$('<input data-role="button" class="settings" data-icon="arrow-r" class="settings" type="button" data-inline="true" data-iconpos="right" value="Sync settings" />').appendTo(syncbar).button();

		this.synctimer.bind("count", $.proxy(function(i) {
			console.log("count " + i);
			$(this.container).find(".syncnow").closest("div.ui-btn").find("span.ui-btn-text").text("Sync " + i);
		}, this));

		this.update();
		if (this.syncEnabled) {
			this.sync();
		}


	};

	PMApp.prototype.showMessage = function(msg) {
		var msg = $('<p class="message">' + msg + '</p>');
		this.matrix.el.after(msg);

		setTimeout(function() {
			msg.remove();
		}, 5000);
	};

	PMApp.prototype.pagechange = function() {
		console.log("PAGECHANGE()");
	}

	PMApp.prototype.update = function() {
		console.log("Update main app view...");
		var context = this.navigator.getNameContext();
		var cols = this.navigator.getNames();
		var keys = this.navigator.getKeys();
		var data = this.store.aggregate(keys);
		var currentcol = this.navigator.currentKey;

		this.syncEnabled = this.store.getSetting("syncEnable", true);

		// this.showMessage("Sync enabled : " + (this.syncEnabled ? 'YES': 'NO'));

		if (!this.syncEnabled) {
			$(this.container).find("span.syncbtn").hide();
		} else {
			$(this.container).find("span.syncbtn").show();
		}


		$(this.container)
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
			$(this.container).find(".today").closest("div.ui-btn").addClass('ui-disabled');	
		} else {
			$(this.container).find(".today").closest("div.ui-btn").removeClass('ui-disabled');	
		}
		// console.log("dateindex");
		// console.log(this.store.getDateindex());
		
	}
	PMApp.prototype.sync = function(e) {
		var that = this;
		var r = this.store.getSyncRequest();

		if (navigator.network && navigator.network.connection.type === Connection.NONE) {
			this.showMessage("Not connected to Internet.");
			return;
		}

		$(that.container).find(".syncnow").closest("div.ui-btn").addClass('ui-disabled');
		$(that.container).find(".syncnow").closest("div.ui-btn").find("span.ui-btn-text").text("Syncing..");

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
				$(that.container).find(".syncnow").closest("div.ui-btn").removeClass('ui-disabled');
				$(that.container).find(".syncnow").closest("div.ui-btn").find("span.ui-btn-text").text("Sync now");

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
	PMApp.prototype.prev = function(e) {
		e.preventDefault();
		this.navigator.prev();
		this.update();
	},
	PMApp.prototype.today = function(e) {
		e.preventDefault();
		this.navigator.today();
		this.update();
	},
	PMApp.prototype.next = function(e) {
		e.preventDefault();
		this.navigator.next();
		this.update();
	},
	PMApp.prototype.zoomout = function(e) {
		e.preventDefault();
		this.navigator.zoomOut(true);
		this.update();
		if (this.navigator.level === 3) {
			$(this.container).find(".zoomout").closest("div.ui-btn").addClass('ui-disabled');
		}
	},
	PMApp.prototype.zoomin = function(e) {
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
			
			$(this.container).addClass("showpicker");

			this.picker = new PMPicker(this.container, oldvalue);
			// $(this.container).append(this.picker.el);

			this.picker.bind("selected", $.proxy(function(value) {
				$(that.container).removeClass("showpicker");
				var d = keys[col][0];
				console.log("Setting new value [" + value + "] earlier [" + oldvalue+ "] to project [" + project + "] on date ["  + d + "]");
				that.store.setDateProject(d, project, value);
				that.synctimer.ping();
				that.update();
			}, this));

		}
		if (this.navigator.level !== 3) {
			$(this.container).find(".zoomout").closest("div.ui-btn").removeClass('ui-disabled');
		}

	},
	PMApp.prototype.manage = function(e) {
		var s = this.store;
		console.log(s);
		e.preventDefault();
		console.log("Setup manage...");

		if (!this.manager) {
			this.manager = new PMManage({}, s);

			this.manager.bind("changed", $.proxy(this.update, this));
			//$(this.container).append(manager.el);
			$("body").append(this.manager.el);
			console.log("Setup manage... done");
		} else {
			this.manager.update(false);
		}

		$.mobile.changePage("#pageManage");
	},

	PMApp.prototype.settings = function(e) {
		var s = this.store;
		console.log(s);
		e.preventDefault();
		console.log("Setup settings...");

		if (!this.settings) {
			this.settings = new PMSettings({}, s);

			this.settings.bind("changed", $.proxy(this.update, this));
			this.settings.bind("syncnow", $.proxy(this.sync, this));
			//$(this.container).append(manager.el);
			$("body").append(this.settings.el);
			console.log("Setup settings... done");
		}

		$.mobile.changePage("#pageSettings");

	}
	

	exports.PMApp = PMApp;

	$(document).ready(function() {
		exports.a = new PMApp($("div#pageMatrix"));
	});


})(window);
