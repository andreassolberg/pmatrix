(function(exports) {


	/*

	Todo syncing.

	Add a 'ts' for each data entry stored.
	Sync is:
		Push all entries with ts,
		returns all entries that needs to be updated locally from the remove.


	Keep track of first and last date in "range"

	Any object is:

		{
			"ts": 239847293847, // timestamp modfied.
			"d": {...data...}
		}

	 */

	exports.PMStore = Spine.Class.sub({
		init: function() {
			
			this.store = window.localStorage;
			this.template = this.getTemplate();
			this.dateindex = this.getDateindex();

			console.log("Template is ...... ="); console.log(this.template);
			if ($.isEmptyObject(this.template)) {
				var gid = this.guid();
				this.setTemplate({
					gid: {name: "New project", active: true}
				});
				this.template = this.getTemplate();
			}

			// this.setTemplate(
			// 	{
			// 		"urn1": {
			// 			name: "GEANT",
			// 			active: true,
			// 			budget: 20
			// 		},
			// 		"urn2": {name: "Feide utv"},
			// 		"urn3": {name: "Webteknologi"}
			// 	}
			// );

			// this.setDateProject("2012-02-14", "urn1", 5);
			// this.setDateProject("2012-02-13", "urn2", 1);
			// this.setDateProject("2012-02-17", "urn3", 2);
			// this.setDateProject("2012-02-11", "urn2", 5);

		},
		reset: function() {
			this.store.clear();
			// Todo, check range and iterate all dates and remove... :/
		},
		guid: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
		},
		getDateindex: function() {
			var inx;
			try {
				inx = JSON.parse(this.store.getItem("dateindex"));
				if (typeof inx !== "object" || !inx.d) {return {};}
				return inx.d;
			} catch(e) {
				return {};
			}
		},
		setDateindex: function(t) {
			var obj = {
				"ts": this.ts(),
				"d": t
			};
			this.dateindex = t;
			return this.store.setItem("dateindex", JSON.stringify(obj));
		},
		addDateToIndex: function(date) {
			if (!this.dateindex.hasOwnProperty(date)) {
				this.dateindex[date] = 1;
				this.setDateindex(this.dateindex);
			}
		},
		/*
		 	Template should look like this:
		 		{
		 			"34543543identifier": {name: "Project name", active: true}
		 		}
		 */
		getTemplate: function() {
			var tmpl;
			try {
				tmpl = JSON.parse(this.store.getItem("template"));
				if (typeof tmpl !== "object" || !tmpl.d) {return {};}
				console.log("getTemplate returning");
				console.log(tmpl.d);
				return tmpl.d;
			} catch(e) {
				console.log("getTemplate returning empty");
				return {};
			}
		},
		rawGetTemplate: function() {
			var empty = {
				"ts": this.ts(),
				"d": {}
			};
			var tmpl, raw;
			try {
				raw = this.store.getItem("template");
				if (!raw) return empty;
				tmpl = JSON.parse(raw);
				if (typeof tmpl !== "object" || !tmpl.d) {return empty;}
				return tmpl;
			} catch(e) {
				console.log("Problem parsing template: " + e);
				return empty;
			}
		},
		setTemplate: function(t) {
			var obj = {
				"ts": this.ts(),
				"d": t
			};
			this.template = t;
			// console.log("     ==========================================> TEMPLATE Stored");
			// console.log(JSON.stringify(t));
			return this.store.setItem("template", JSON.stringify(obj));
		},
		rawSetTemplate: function(t) {
			this.template = t.d;
			return this.store.setItem("template", JSON.stringify(t));
		},
		rawget: function(k) {
			var obj = JSON.parse(this.store.getItem("data-" + k))
			if (obj === null) return null;
			return obj;
		},
		get: function(k) {
			var obj = JSON.parse(this.store.getItem("data-" + k))
			if (obj === null) return null;
			if (typeof obj !== "object" || !obj.d) {return null;}
			return obj.d;
		},
		set: function(k, v) {
			var obj = {
				"ts": this.ts(),
				"d": v
			};
			console.log("set(" + k + ")");
			this.store.setItem("data-" + k, JSON.stringify(obj));
			this.addDateToIndex(k);
		},
		setDateProject: function(date, project, value) {
			var obj;

			console.log("setDateProject(" + date + ")");
			try {
				obj = this.get(date);	
			} catch(e) {
				obj = {};
			}
			
			if (!obj) {
				obj = {};
			}
			obj[project] = value;
			this.set(date, obj);
		},
		getSyncKey: function() {
			var synckey = this.store.getItem("synckey");
			if (!synckey) return this.resetSyncKey();
			return synckey;
		},
		setSyncKey: function(synckey) {
			this.store.setItem("synckey", synckey);
			return synckey;
		},
		synckey: function() {
			return 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
		},
		resetSyncKey: function() {
			return this.setSyncKey(this.synckey());
		},
		setSettings: function(key, value) {
			var s;
			s = this.getSettings();		
			s[key] = value;
			this.store.setItem("settings", JSON.stringify(s));
		},
		getSettings: function() {
			var s;
			try {
				s = JSON.parse(this.store.getItem("settings"));
				if (typeof s !== "object") s = {};
			} catch(e) {
				s = {};
			}
			
			console.log("Settings:"); console.log(s);
			if (!s) return {};
			return s;
		},
		getSetting: function(key, def) {
			var s;
			s = this.getSettings();			
			if (!s) return def;
			if (typeof s[key] === "undefined") return def;
			return s[key];
		},
		ts: function() {
			return Math.round(new Date().getTime()/1000.0);
		},
		processSyncResponse: function(response) {
			var datekey;
			console.log("processSyncResponse()");
			console.log(response);
			if (response.template) {
				console.log("Setting response template");
				console.log(response.template);
				this.rawSetTemplate(response.template);
			}
			if (response.data) {
				for(datekey in response.data) {
					console.log("Setting response data for [" + datekey + "]");
					console.log(response.data[datekey].d);
					this.set(datekey, response.data[datekey].d);
				}
			}

		},
		getSyncRequest: function() {

			var datekey;
			var dateindex = this.getDateindex();
			var request = {
				synckey: this.getSyncKey(),
				template: this.rawGetTemplate(),
				data: {}
			};
			for(datekey in dateindex) {
				request.data[datekey] = this.rawget(datekey);
			}
			console.log("getSyncRequest()");
			console.log(request);
			return request;
		},

		/* TODO: Make keys two level...
			
			Example of output:

			{
				data: [ {"p1": 35, "p2": 29}, {...}, {...}]
				datesums: [23, 14, 34, 45...]
				projects: {"p1": {...}, "p2": {...}, ...}
				total: {"p1": 120, "p2": 90},
				tot: 112
			}

		 */
		aggregate: function(keys) {

			// console.log("About to aggregate()"); console.log(keys);
			var i, j;
			var result = {
				data: [],
				projects: {},
				total: {},
				datesums: [],
				datecounts: [],
				tot: 0
			};
			var columnaggregate;
			var celldate;
			var dataobj;
			var datakey;
			var datesums = null;
			var datecount;
			var day;
			

			// console.log("AGGREGATE IS USINGTHIS TEMPLATE:::::: " + JSON.stringify(this.template));

			// Iterate columns
			for(i = 0; i < keys.length; i++) {

				// Aggregate for each column.
				columnaggregate = {};
				datesums = 0;
				datecount = 0;

				// Iterate dates that falls within a column.
				for(j = 0; j < keys[i].length; j++) {

					celldate = keys[i][j];
					dataobj = this.get(celldate);

					// console.log("key " + celldate);
					// console.log(new Date(celldate));
					// console.log(new Date(celldate).getDay());
					day = (new Date(celldate)).getDay();
					if (day !== 0 && day !== 6) {
						datecount++;
					}

					// console.log("Got dataobj for [" + celldate + "] "); console.log(dataobj);

					// If no data for this specific date, continue.
					if (!dataobj) continue;


					// Iterate a datecellobject, to increase columnaggregate...
					// datakey is a project Identifier
					for (datakey in dataobj) {

						// Populate result.projects with this project, if not already
						// added. result.projects will contain a list of all involved projects
						// in this table view.
						if (!result.projects[datakey]) {
							result.projects[datakey] = {};
							if (this.template[datakey]) {
								result.projects[datakey] = this.template[datakey];
							}
						}

						// Populate columnaggregate...
						if (!columnaggregate[datakey]) {
							columnaggregate[datakey] = dataobj[datakey];
						} else {
							columnaggregate[datakey] += dataobj[datakey];
						}

						datesums += dataobj[datakey];
						

					}
					
				}
				result.data.push(columnaggregate);
				result.datesums.push(datesums);
				result.datecounts.push(datecount);
			}
			this.template = this.getTemplate();
			// Itereate all templates, and add if active and not present already.
			for(i in this.template) {
				if (this.template[i].active) {
					if (!result.projects[i]) {
						result.projects[i] = this.template[i];
					}
				}
			}

			for(i = 0; i < result.datesums.length; i++) {
				result.tot += result.datesums[i];
			}

			console.log(JSON.parse(JSON.stringify(result)));

			return result;
		}
	});
	



})(window);
