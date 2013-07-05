(function(exports) {
	
	/**
	 * Returns the week number for this date.  dowOffset is the day of week the week
	 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
	 * the week returned is the ISO 8601 week number.
	 * getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com
	 * 
	 * @param int dowOffset
	 * @return int
	 */
	Date.prototype.getWeek = function (dowOffset) {
		dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 1; //default dowOffset to zero
		var newYear = new Date(this.getFullYear(),0,1);
		var day = newYear.getDay() - dowOffset; //the day of week the year begins on
		day = (day >= 0 ? day : day + 7);
		var daynum = Math.floor((this.getTime() - newYear.getTime() - 
		(this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
		var weeknum;
		//if the year starts before the middle of a week
		if(day < 4) {
			weeknum = Math.floor((daynum+day-1)/7) + 1;
			if(weeknum > 52) {
				nYear = new Date(this.getFullYear() + 1,0,1);
				nday = nYear.getDay() - dowOffset;
				nday = nday >= 0 ? nday : nday + 7;
				/*if the next year starts before the middle of
	 			  the week, it is week #1 of that year*/
				weeknum = nday < 4 ? 1 : 53;
			}
		}
		else {
			weeknum = Math.floor((daynum+day-1)/7);
		}
		return weeknum;
	};

	var PMDateNav = function(d, l) {
		this.date = (d ? d : new Date());
		this.level = (typeof l !== "undefined" ? l : 0);
		this.intervalCounts = {
			0: 7, // Days (7)
			1: 4, // Weeks (4)
			2: 6, // Month (6)
			3: 1  // Year
		};
		this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Cct", "Nov", "Dec"];
		this.days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

		this.todaystamp = this.dstring(new Date());
		this.currentKey = null;

		this.align();
	}

	PMDateNav.prototype.dstring = function(d) {
		var m = d.getMonth() + 1;
		if (m < 10) m = "0" + m;
		var day = d.getDate();
		if (day < 10) day = "0" + day;
		return d.getFullYear() + "-" + m + "-" + day;
	}

	PMDateNav.prototype.clone = function() {
		return new exports.PMDateNav(new Date(this.date.getTime()), this.level);
	}
	PMDateNav.prototype.nextOne = function() {
		switch(this.level) {
			case 0: 
				this.date.setDate(this.date.getDate()+1);
				break;
			case 1: 
				this.date.setDate(this.date.getDate()+7);
				break;
			case 2: 
				this.date.setMonth(this.date.getMonth()+1);
				break;
			case 3: 
				this.date.setFullYear(this.date.getFullYear()+1);
				break;
		}
		return this;
	}

	PMDateNav.prototype.today = function() {
			this.date = new Date();
			this.align();
			return this;
	}

	// Get to next time interval
	PMDateNav.prototype.next = function() {
		switch(this.level) {
			case 0: 
				this.date.setDate(this.date.getDate()+this.intervalCounts[0]);
				break;
			case 1: 
				this.date.setDate(this.date.getDate()+(7*this.intervalCounts[1]));
				break;
			case 2: 
				this.date.setMonth(this.date.getMonth()+this.intervalCounts[2]);
				break;
			case 3: 
				this.date.setFullYear(this.date.getFullYear()+this.intervalCounts[3]);
				break;
		}
		return this;
	}

	// get to prev time interval
	PMDateNav.prototype.prev = function() {
		switch(this.level) {
			case 0: 
				this.date.setDate(this.date.getDate()-this.intervalCounts[0]);
				break;
			case 1: 
				this.date.setDate(this.date.getDate()-(7*this.intervalCounts[1]));
				break;
			case 2: 
				this.date.setMonth(this.date.getMonth()-this.intervalCounts[2]);
				break;
			case 3: 
				this.date.setFullYear(this.date.getFullYear()-this.intervalCounts[3]);
				break;
		}
		return this;
	}


	PMDateNav.prototype.getNameContext = function() {
		var d = this.date;
		switch(this.level) {
			case 0: 
				return d.getFullYear() + " " + this.months[d.getMonth()] + " (Week " + d.getWeek() + ")";
			case 1: 
				return d.getFullYear();
			case 2: 
				return d.getFullYear();
			case 3: 
				return "Year";
		}
		return null;	
	}

	PMDateNav.prototype.getName = function(d) {
		switch(this.level) {
			case 0: 
				return this.days[d.getDay()] + " " + d.getDate();
			case 1: 
				return d.getWeek();
			case 2: 
				return this.months[d.getMonth()];
			case 3: 
				return d.getFullYear();
		}
		return null;
	}

		/*
			How to get day offset:
				((this.date.getDay() + 6) % 7)) - then 0 is monday.
		 */
	PMDateNav.prototype.align = function() {
		var dayo =  ((this.date.getDay()+6)%7);
		switch(this.level) {
			case 0: 
				// console.log(" = ==== > aligning < =====");
				// console.log("Date to align is : " + this.date.getDay());
				// console.log("Offset        is : " + dayo);
				// console.log("Date now      is : "  + this.date.getDate());
				// console.log("New date set  is : " + (this.date.getDate()- dayo));
				this.date.setDate(this.date.getDate()- dayo);

				break;
			case 1: 
				//this.date.setDate(this.date.getDate()-(7*this.intervalCounts[1]));
				this.date.setDate(this.date.getDate()- dayo);
				break;
			case 2: 
				this.date.setMonth(this.date.getMonth()-(this.date.getMonth()%6));
				this.date.setDate(1);
				break;
			case 3: 
				this.date.setMonth(0);
				this.date.setDate(1);
				break;
		}
		return this;
	}
	PMDateNav.prototype.getNames = function() {
		var runner = this.clone();
		var rd = runner.date;
		var names = [];
		var i;

		for(i = 0; i < this.intervalCounts[this.level]; i++) {
			names.push(this.getName(rd));
			switch(this.level) {
				case 0: 
					rd.setDate(rd.getDate()+1);
					break;
				case 1: 
					rd.setDate(rd.getDate()+7);
					break;
				case 2: 
					rd.setMonth(rd.getMonth()+1);
					break;
				case 3: 
					rd.setFullYear(rd.getFullYear()+1);
					break;
			}
		}
		return names;
	}
	PMDateNav.prototype.getKeys = function() {
		var runner = this.clone();
		var keys = [];
		var datecounter;
		var intervalkeys;
		var datestamp;

		runner.align();
		this.currentKey = null;

		this.todaystamp = this.dstring(new Date());

		// For each of the columns in the matrix, collect an array of keys
		for(i = 0; i < this.intervalCounts[this.level]; i++) {
			intervalkeys = [];

			// Setup datecounter to start at the first date in the column.
			datecounter = new Date(runner.date.getTime());
			runner.nextOne();

			// As long as the datecounter is shorter
			while(datecounter < runner.date) {
				datestamp = this.dstring(datecounter);
				intervalkeys.push(datestamp);
				datecounter.setDate(datecounter.getDate()+1);

				if (this.todaystamp === datestamp) {
					this.currentKey = i;
				}
			}
			keys.push(intervalkeys);
			// console.log(intervalkeys);
		}
		// console.log("Current col is " + this.currentKey);
		return keys;
	}
	PMDateNav.prototype.debug = function() {
		console.log("=============================================");
		console.log("Date object   -- This level [" + this.level + "]");
		console.log(this.date);
		console.log("Names: ");
		console.log(this.getNames());
		console.log("This name context: " + this.getNameContext());
		return this;
	}

	// 0 is current time interval, 1 is int n.2.
	PMDateNav.prototype.zoomIn = function(stop) {
		// console.log("Zooming in to stop [" + stop + "]");
		if (this.level <= 0) throw {message: "Cannot zoom in more than on level 0"};
		this.level--;
		this.align();
		for(var i = 0; i < stop; i++) {
			this.next();
		}
		this.align();
		return this;
	}

	PMDateNav.prototype.zoomOut = function(align) {
		if (this.level >= 4) throw {message: "Cannot zoom out on level beyond year."};
		this.level++;
		if (align) this.align();
		return this;
	}



	exports.PMDateNav = PMDateNav;

	



})(window);
