(function(exports) {


	var PMMatrix = function(container) {
		this.el = $('<div></div>').appendTo(container);

		this.listeners = {};

		$(this.el).addClass("matrix");
		$(this.el).append("<table></table>");

	}

	PMMatrix.prototype.trigger = function(type, data) {
		console.log("listeners", this.listeners);
		if (this.listeners[type]) {
			this.listeners[type](data);
		}
	}

	PMMatrix.prototype.bind = function(type, func) {
		this.listeners[type] = func;
	};


	PMMatrix.prototype.draw = function(context, cols, data, currentcol) {
		var i, nowclass = '', modclass, budget;
		var table = $(this.el).find("table").empty();
		
		table.append("<thead><tr></tr></thead>");
		table.append("<tbody></tbody>");

		var e = table.find("thead tr").empty().append('<th class="context">' + context + '</th>');
		$.each(cols, function(i, col) {
			nowclass = (currentcol === i ? "nowcol" : "");
			e.append('<th class="intervalH ' + nowclass + '">' + col + '</th>');
		});

		var be = $(this.el).find("tbody").empty();
		var key;

		for(key in data.projects) {
			var ne = $('<tr class="datarow"></tr>');
			if (data.projects[key].name) {
				ne.append('<th class="projectName">' + data.projects[key].name + '</th>');
			} else {
				ne.append('<th class="projectName">' + key + '</th>');
			}

			for(i = 0; i < cols.length; i++) {
				nowclass = (currentcol === i ? "nowcol" : "");
				modclass = '';

				if(data.data[i][key] && data.projects[key] && data.projects[key].budget) {
					budget = (data.datecounts[i] * data.projects[key].budget) / 5;
					if (data.data[i][key] < budget - 0.5) {
						modclass=" less";
					} else if (data.data[i][key] > budget + 0.5) {
						modclass=" more";
					} else {

					}
					console.log('Comparing used resource [' + data.data[i][key] + '] against budget [' + budget + ']');
				}

				if (data.data[i][key]) {
					$('<td class="datacell ' + nowclass + modclass + '">' + data.data[i][key] + '</td>')
						.appendTo(ne)
						.data('col', i)
						.data('project', key)
						.data('value', data.data[i][key]);
				} else {
					$('<td class="datacell ' + nowclass + '">&nbsp;</td>')
						.appendTo(ne)
						.data('col', i)
						.data('project', key)
						.data('value', null);
				}
			}

			be.append(ne);
		}

		var totrow = $("<tr></tr>");
		totrow.append('<th class="projectName tot">&#931; ' + data.tot + '</th>');
		for(i = 0; i < data.datesums.length; i++) {
			if (data.datesums[i] > 0) {
				totrow.append('<td class="datetot tot">' + data.datesums[i] + '</td>');
			} else {
				totrow.append('<td class="datetot tot">&nbsp;</td>');
			}
			
		}
		be.append(totrow);

	}


	exports.PMMatrix = PMMatrix;






})(window);

