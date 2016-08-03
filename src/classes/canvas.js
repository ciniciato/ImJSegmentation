var canvas = {
	container: null,
	obj : null,
	ctx: null,
	buffer: null,
	histograms: {h: null, s: null, v: null},
}

canvas.init = function(){
	this.container = document.getElementById("td_canvas");

	this.obj = document.getElementById("cnv_workspace");
	this.ctx = this.obj.getContext("2d");	

	this.buffer = document.getElementById("cnv_buffer");
	this.buffer.ctx = this.buffer.getContext("2d");	

	this.histograms.h = document.getElementById("cnv_histogram_h");
	this.histograms.s = document.getElementById("cnv_histogram_s");
	this.histograms.v = document.getElementById("cnv_histogram_v");
	this.resize();
}

canvas.resize = function(){//get parent size to set canvas size
	var left = (this.obj.parentElement.offsetWidth - this.obj.width)/2,
		top = (this.obj.parentElement.offsetHeight - this.obj.height)/2;
	left = (left<0) ? 0 : left;
	top = (top<0) ? 0 : top;
	this.obj.style = 'margin-left: '+left+'px; margin-top: '+top+'px;'
}

canvas.clear = function(){
	this.ctx.clearRect(0, 0, this.obj.width, this.obj.height);
}

canvas.loadBuffer = function(_path, onload_callback){
	var img = new Image();
	img.src = _path;
	var that = this;
	img.onload = function(){
		that.buffer.width = img.naturalWidth;
		that.buffer.height = img.naturalHeight;
		that.buffer.ctx.drawImage(img, 0, 0);//draw img
		var imgData = that.buffer.ctx.getImageData(0, 0, that.buffer.width, that.buffer.height);
		onload_callback({data: imgData});//get img data
	}			
}

canvas.loadImg = function(_path, onload_callback){
	var img = new Image();
	img.src = _path;
	var that = this;
	img.onload = function(){		
		that.obj.width = img.naturalWidth;
		that.obj.height = img.naturalHeight;
		
		that.resize();
		that.clear();
		
		that.ctx.drawImage(img, 0, 0);//draw img
		var imgData = that.ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
		onload_callback({data: imgData });//get img data
	}	
}

canvas.setSize = function(_){//width, height
	var x = that.obj.width/2 - _.width/2,
		y = that.obj.height/2 - _.height/2;
	that.data = that.ctx.getImageData(x, y, _.width, _.height);
}

canvas.draw = function(_){//img
	//this.drawHistograms({levels: control.getLayer().hsv.levels, highestValues: control.getLayer().hsv.highestValues});
	this.obj.width = _.img.width;
	this.obj.height = _.img.height;
	this.resize();
	this.ctx.putImageData(_.img, 0, 0);
}

canvas.drawHistograms = function(_){
	/*
	var ctx  = this.histograms.h.getContext("2d"),
		data = _.levels[0];
	ctx.clearRect(0, 0, data.length, 100);
	ctx.lineWidth = 2;
		var r = 255, g = 0, b = 0;
	for (var i = 0; i < data.length; i+=1){

		if (i <= 60){
			g = Math.round(i*4.25);
		}else if (i <= 120){
			r = 255 - Math.round((i - 60)*4.25);
		}else if (i <= 180){
			b = Math.round((i - 120)*4.25);
		}else if (i <= 240){
			g = 255 - Math.round((i - 180)*4.25);
		}else if (i <= 300){
			r = Math.round((i - 240)*4.25);
		}else{
			b = 255 - Math.round((i - 300)*4.25);			
		}

		ctx.beginPath();
		ctx.strokeStyle = 'rgb('+ r +','+ g +','+ b +')';
		ctx.moveTo(i, 100);
		ctx.lineTo(i, 100 - 100*data[i]/_.highestValues[0]);
		ctx.stroke();
	}


	var ctx  = this.histograms.s.getContext("2d"),
		data = _.levels[1];
	ctx.clearRect(0, 0, data.length, 100);
	ctx.lineWidth = 2;
	for (var i = 0; i < data.length; i++){
		ctx.beginPath();
		var color = Math.round(255*i/100);
		ctx.strokeStyle = 'rgb('+ color +','+ color +','+ color +' )';
		ctx.moveTo(i, 100);
		ctx.lineTo(i, 100 - 100*data[i]/_.highestValues[1]);
		ctx.stroke();
	}
	ctx.stroke();


	var ctx  = this.histograms.v.getContext("2d"),
		data = _.levels[2];
	ctx.clearRect(0, 0, data.length, 100);
	ctx.lineWidth = 2;
	for (var i = 0; i < data.length; i++){
		ctx.beginPath();
		var color = Math.round(255*i/100);
		ctx.strokeStyle = 'rgb('+ color +','+ color +','+ color +' )';
		ctx.moveTo(i, 100);
		ctx.lineTo(i, 100 - 100*data[i]/_.highestValues[2]);
		ctx.stroke();
	}
	*/
}

canvas.getData = function(){
	var x = this.obj.width/2 - this.data.width/2,
		y = this.obj.height/2 - this.data.height/2;
	return this.ctx.getImageData(x, y, this.data.width, this.data.height);
}

window.onresize = function(event){
	canvas.resize();
}; 	