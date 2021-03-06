(function(exports) {

	/*
		Actions needed to be supported.

		Turn no and off remote sync.
		Reset: delete all data, and create a new synckey.
		Change key: check if changed key is valid, and then merge/sync.
	*/


	var PMSettings = function(container, store) {
		this.el = $('<div></div>').appendTo(container);
		this.store = store;

		this.listeners = {};

		console.log("init settings()");
		console.log(store);

		console.log("Date index");
		console.log(this.store.getDateindex());

		$(this.el).attr('id', "pageSettings");
		$(this.el).attr('data-role', "page");

		$(this.el).append('<div data-role="header"><h1>Settings</h1></div>');

		//$('<div class="projectlist"></div>').appendTo(this.el);
		
		var syncEnabled = this.store.getSetting("syncEnable", true);
		var syncEnabledC = (syncEnabled ? 'checked="checked"' : '');

		$('<input type="checkbox" name="enablesync" ' + syncEnabledC + ' id="enablesync" class="enablesync" />' +
			'<label for="enablesync">Enable remote sync</label>').appendTo(this.el);

		$('<label for="synckey">Sync key</label>' +
			'<input type="text" name="synckey" id="synckey" value="' + this.store.getSyncKey() + '"  />').appendTo(this.el);


		// $('<input data-role="button" data-icon="alert" class="back" type="button" data-theme="d" data-inline="false" value="Reset local from server" />').appendTo(this.el).button();
		
		// ="c" (or b)
		$('<p>Please type your sync key somewhere safe, it may be used to backup data between OS and software upgrades. To sync multiple iOS devices, copy the sync key of the first device and use it on the others.</p>').appendTo(this.el);
		$('<input data-role="button" data-icon="arrow-l" class="back" type="button" data-inline="true" value="Back" />').appendTo(this.el).button();
		// $('<input data-role="button" class="syncnow" data-icon="refresh" class="settings" type="button" data-inline="true" data-theme="b" value="Sync now" />')
			// .appendTo(this.el).button();


		$('<hr /><p>In case you would like to reset all local data, and start from scratch. All local data will be lost. Typically, you can do this before you setup this device to sync from a second unit.</p>').appendTo(this.el);
		$('<input data-role="button" data-icon="delete" class="reset" type="button" data-theme="a" data-inline="false" value="Reset (delete all data)" />').appendTo(this.el);

		

		// if (syncEnabled) {
		// 	$(this.el).find("enablesync").attr("checked", "checked");
		// } else {
		// 	$(this.el).find("enablesync").removeAttr("checked");
		// }

	
	//	this.update(true);
		// this.update();


		$(this.el).on('tap', '.back', $.proxy(this.back, this));
		$(this.el).on('tap', '.reset', $.proxy(this.reset, this));
		$(this.el).on('tap', '.syncnow', $.proxy(this.syncnow, this));
		$(this.el).on('change', 'input#synckey', $.proxy(this.updateSyncKey, this));
		$(this.el).on('change', 'input#enablesync', $.proxy(this.updateSyncEnabled, this));

	}


	PMSettings.prototype.trigger = function(type, data) {
		console.log("listeners", this.listeners);
		if (this.listeners[type]) {
			this.listeners[type](data);
		}
	}

	PMSettings.prototype.bind = function(type, func) {
		this.listeners[type] = func;
	};

	PMSettings.prototype.updateSyncEnabled = function(e) {
			var enabled = $(e.target).prop("checked");
			console.log("updateSyncEnabled() - " + enabled);
			this.store.setSettings("syncEnable", enabled);
	}

	PMSettings.prototype.updateSyncKey = function(e) {
			var synckey = $(e.target).attr("value");
			console.log("Synckey was updated. Set to: " + synckey);
			this.store.setSyncKey(synckey);
	}

	PMSettings.prototype.syncnow = function(e) {
			this.trigger("syncnow");
	}

	PMSettings.prototype.back = function() {
			this.trigger("changed");
			$.mobile.changePage("#pageMatrix", { transition: "slide", changeHash: true, reverse: true });
	}

	PMSettings.prototype.reset = function(e) {
			this.trigger("changed");
			this.store.reset();
	}

	PMSettings.prototype.getProjectItemElement = function(e) {
			return $(e.target).closest("div.project_item");
	}

	PMSettings.prototype.getProject = function(e) {
		return $(e.target).closest("div.project_item").data("key");
	}

	PMSettings.prototype.save = function() {
		
		console.log("Saving template...");
		console.log(this.template);
		this.store.setTemplate(this.template);
	}

	PMSettings.prototype._ = function() {
		
	}	


	exports.PMSettings = PMSettings;



})(window);
