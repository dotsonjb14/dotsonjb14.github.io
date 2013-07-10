// set this

var log = function (data) {} // do nothing
var useLogs = false;

// if it's set, do logging
if(useLogs)
	log = function (data) { console.log(data); } 

var jsReporting = {
	_rowTemplate: "",
	_rowType: "reg",
	_groups: [],
	_data: null,

	CreateRowTemplate: function(elem, rowType) {
		if(rowType != null)
			this._rowType = rowType;
		this._rowTemplate = elem;
	},
	CreateGroup: function(data) {
		this._groups.push(data);
	},
	LoadGroup: function(group,data) {
		if(data == null)
			data = this._data; // this is the root, so load ALL the dat

		var hasNextGroup = false
		var nextGroup = null;
		if(this._groups.length > group + 1) {
			nextGroup = this._groups[group+1];
			hasNextGroup = true;
		}
		else
			nextGroup = null;

		var elem = document.getElementById(this._groups[group].elem);

		var group_num = group;
		group = this._groups[group];

		if(nextGroup != null) {
			var nextGroupElem = document.getElementById(nextGroup.elem);
			var _buffer = nextGroupElem.outerHTML; // save this
			nextGroupElem.outerHTML = "{{ _hold_ }}";
		}
		// do the grouping
		var _grouper = {}

		for(var i in data) {
			if(_grouper[data[i][group.field]] == null)
				_grouper[data[i][group.field]] = []
			_grouper[data[i][group.field]].push(data[i]);
		}
		
		// clear the ID after you attach all the children
		var groupTemplate = elem.innerHTML;
		elem.innerHTML = "";

		for(var i in _grouper) {
			var t = groupTemplate;

			// do any quantitative handling here
			t = t.replace("{{ " + group.field + " }}", i);

			t = t.replace("{{ rowcount() }}", _grouper[i].length)

			for(var field in _grouper[i][0]) {
				// do sums
				if(new RegExp("{{ sum\\(" + field + "\\) }}", "i").test(t)) {
					var sumField = field
					var total = 0;
					for(var j in _grouper[i]) {
						total += _grouper[i][j][sumField];
					}
					t = t.replace("{{ sum(" + sumField + ") }}", total);
				}
				// do avg
				if(new RegExp("{{ avg\\(" + field + "\\) }}", "i").test(t)) {
					var sumField = field
					var total = 0;
					for(var j in _grouper[i]) {
						total += _grouper[i][j][sumField];
					}
					total = total / _grouper[i].length;
					t = t.replace("{{ avg(" + sumField + ") }}", total);
				}
			}

			t = t.replace("{{ _hold_ }}", _buffer);
			elem.innerHTML += t;

			// go down the rabbit hole
			if(nextGroup != null)
				this.LoadGroup(group_num+1, _grouper[i]);
			else
				this.LoadRow(_grouper[i]);
		}
		elem.id = "";
	},
	LoadRow: function(data) {
		if(data == null)
			data = this._data;

		var elem = document.getElementById(this._rowTemplate)
		var _template = elem.innerHTML;
		var parent = elem.parentNode;
		elem.innerHTML = "";
		for(var i = 0; i < data.length; i++) {
			var row = _template;
			for(var column in data[i]) {
				row = row.replace("{{ " + column + " }}", data[i][column]);
			}
			log(elem)
			elem.innerHTML += row;
		}
		// replace the template with all the data.
		elem.id = "";
	},
	Load: function() {
		if(this._groups.length)
			this.LoadGroup(0); // load the first group
		else
			this.LoadRow();
		return;
		// load the template data
		
	},
	// this loads the JSON data directly
	LoadData: function(data) {
		this._data = data;
	},
	LoadDataUrl: function(url) {
		// this does nothing
	},
	UseTableRowRenderer: function(fields) {
		this.__tableRowFields = fields;

		this.LoadRow = function(data) {
			var displayFields = this.__tableRowFields
			if(data == null)
				data = this._data;

			var elem = document.getElementById(this._rowTemplate)
			var _template = elem.children[0];

			for(var i = 0; i < data.length; i++) {
				var row = document.createElement("tr");

				for(var field in displayFields) {
					var cell = document.createElement("td");
					cell.setAttribute("class", "col" + field)
					cell.innerText = data[i][displayFields[field]];
					row.appendChild(cell)
				}

				elem.appendChild(row)
			}
			
			elem.removeChild(_template);
			elem.id = "";
		}
	},
	UseCustomRenderer: function(renderer, specialData) {
		if(specialData != null)
			this.__specialData = specialData;
		this.LoadRow = renderer;
	}
}