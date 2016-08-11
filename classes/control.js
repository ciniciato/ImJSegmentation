var control = {
	undo: function(){
		if (this.previousData.length > 0)
		{
			console.log('Undo');
			this.previousData.last().layer.data = copyData(this.previousData.last().data);
			this.previousData.pop();
			canvas.draw({img: control.archives.current.getImg()});
		}
	},
	previousData:[],
	archives: {
		current: {id: null},
		id: 0,
		size: 0,
		items: [],
		get: function(_){
			return this.items.find(o => o.id === _.id);
		},
		delete: function(_){
			var ind = this.items.findIndex(o => o.id === _.id);
			this.size--;
			this.items.splice(ind, 1);
		},
		next: function(_){//return next item in list by id
			var ind = this.items.findIndex(o => o.id === _.id);
			if (ind + 1 == this.size)//if item is the last, return prior item
				return this.items[ind-1].id
			else			
				return this.items[ind+1].id;
		},
		add: function(){
			this.size++;
			this.items.push(new archive({id: this.id++}));
			return this.items.last();
		}
	}//map[id, archive] of objects from class archive.js | map functions: set, get, has, delete, clear, size, values | for(let u of userRoles.keys())
};

control.getLayer = function(){
	return this.archives.current.layers.current;
}

control.init = function(){
	canvas.init();
	modal.init();
	Keys.init();

	Keys.hotkey_events.push({
		keys: [Keys.CTRL, Keys.I],
		event: function(){
			apply(function(){adjustaments.invert(control.getLayer().data, true)});	
		}
	});
	Keys.hotkey_events.push({
		keys: [Keys.CTRL, Keys.SHIFT, Keys.U],
		event: function(){
			apply(function(){adjustaments.desaturate(control.getLayer().data, true)});	
		}
	});
	Keys.hotkey_events.push({
		keys: [Keys.CTRL, Keys.Z],
		event: function(){
			control.undo();
		}
	});

	document.getElementById('openFile').addEventListener('change', this.openArchive, false);
}

apply = function(_event){
	control.previousData.push({
		layer: control.getLayer(),
		data: copyData(control.getLayer().data)
	});
	_event();
}

control.closeArchive = function(_){
	if (this.archives.size == 1){
		canvas.clear();
		this.archives.current = {id: null};
	}else if (this.archives.current.id == _.id){
		var nextId = this.archives.next({id: _.id});
		this.changeArchive({id: nextId});
	}
	document.getElementById('tab_container').removeChild(document.getElementById('window_' + _.id));
	this.archives.delete({id: _.id});
}

control.changeArchive = function(_){
	if (this.archives.current.id != _.id){
		if (this.archives.current.id != null) 
			document.getElementById('window_' + this.archives.current.id).className = '';
		document.getElementById('window_' + _.id).className = 'selected';

		this.archives.current = this.archives.get({id: _.id});
		canvas.draw({img: this.archives.current.getImg()});

		var list = document.getElementById('list_layers');
		list.innerHTML = '';//clear all items
		for(var i = 0; i < this.archives.current.layers.size; i++){
			var node = document.createElement("li");
			var elem = list.appendChild(node);
			if (i == 0) elem.className = 'selected';
			elem.innerHTML = '<a>Hide</a><span>'+  this.archives.current.layers.items[i].caption +'</span>';
		}
	}
}

control.openArchive = function(evt) {
    var files = evt.target.files; // FileList object
    // Loop through the FileList and load archives
    for (var i = 0, f; f = files[i]; i++) {
      // Only process image files.
      if (!f.type.match('image.*'))
        continue;
      var reader = new FileReader();
      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
        	var path = e.target.result,
             	fileName = escape(theFile.name);
        	var newArchive = control.archives.add();
			canvas.loadImg(path, 
					function(_){
						newArchive.img = _.data;

						var newLayer = newArchive.layers.add({data: _.data.getMatrix(), caption: 'Original'});
						control.changeArchive({id: newArchive.id});
					}
				);
			var node = document.createElement("span");
			var elem = document.getElementById('tab_container').appendChild(node);
			elem.id = 'window_'+newArchive.id;
			elem.innerHTML = '<strong class="light"><span onclick="control.changeArchive({id:'+ (newArchive.id) +'})">'+ 
								fileName +'</span> <a onclick="control.closeArchive({id:'+ (newArchive.id) +'})">x</a></strong>';
        };
      })(f);
      // Read in the image file as a data URL.
      reader.readAsDataURL(f);
    }
  }