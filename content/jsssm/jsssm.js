var SSM = {
	supportedFieldTypes: ["text"],
	states: {},
	dirty: {}, // dirty state list

	isAsync: false,

	SyncFunction: function(dirty){}, // replace this with your syncing function

	RegisterInputs: function(arr) {
		for(var i in arr) {
			/*if(this._getFieldType(document.getElementById(i)) === null) {
				console.log(i + " is not a supported field type");
				break;
			}*/
			var state = {};
			state.elem = i;
			state.dirty = false;
			state.origVal = document.getElementById(state.elem).value;
			state.newVal = null;

			// register custom functions
			if(arr[i].stateSynced != null) {
				state.stateSynced = arr[i].stateSynced
			}
			else {
				state.stateSynced == null;
			}

			if(arr[i].stateDirtied != null) {
				state.stateDirtied = arr[i].stateDirtied
			}
			else {
				state.stateDirtied == null;
			}

			$("#" + state.elem).keyup(function(event) {
				SSM.StateChanged(event.currentTarget.id);
			});

			this.states[state.elem] = state;
		}
	},

	StateChanged: function(elem) {
		var state = this.states[elem];

		var _elem = document.getElementById(state.elem)
		state.newVal = _elem.value;
		
		if(state.origVal === state.newVal) {
			// state returned
			if(state.stateSynced == null)
				this._singleStateSynced(state);
			else
				state.stateSynced(state);

			delete this.dirty[elem];
			return
		}

		if(!state.dirty) {		
			if(state.stateDirtied == null)
				this._singleStateDirtied(state);
			else
				state.stateDirtied(state);
		}
		
		state.dirty = true;

		this.dirty[state.elem] = state;
	},

	Set: function(states) {
		for(var i in states) {
			document.getElementById(i).value = states[i];
			this.StateChanged(i);
		}
	},

	SyncState: function() {
		this.SyncFunction(this.dirty);

		if(!this.isAsync) {
			// call this here
			this.SyncCallback();
		}
	},

	ResetState: function() {
		var dirty = this.dirty;
		for(var i in dirty) {
			var state = dirty[i];
			document.getElementById(state.elem).value = state.origVal;
			state.newVal = null; // reset this
			state.dirty = false;
			document.getElementById(state.elem).setAttribute("class", state.oldClass);
		}
		this.dirty = {}; // clear the list
	},

	SyncCallback: function() {
		var dirty = this.dirty;
		for(var i in dirty) {
			if(dirty[i].stateSynced == null)
				this._singleStateSynced(dirty[i]);
			else
				dirty[i].stateSynced(dirty[i]);
		}
		this.dirty = {}; // clear the list
	},

	_singleStateSynced: function(state) {
		state.origVal = state.newVal;
		state.newVal = null; // reset this
		state.dirty = false;
		document.getElementById(state.elem).setAttribute("class", state.oldClass);
	},

	_singleStateDirtied: function(state) {
		var _elem = document.getElementById(state.elem)
		state.oldClass = _elem.getAttribute("class"); // save the old class
		var nClass = "";
		if(state.oldClass != null) {
			nClass = state.oldClass + " ";
		}
		nClass += "dirty-state";
		_elem.setAttribute("class", nClass);
	},

	// get the type of the field in question
	_getFieldType: function(elem) {
		/*var x = ""
		for(var i in elem)
			x += i + ": " + elem[i] + "\n";
		console.log(x)*/

		if(elem.localName == "input") {
			if(elem.type == "text") {
				return "text";
			}
			else if(elem.type == "hidden") {
				return "hidden";
			}
		}
		else if(elem.localName == "textarea") {
			return "text";
		}

		return null;
	}
};