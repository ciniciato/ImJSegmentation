var modal = {
	canvas: null,
	previewData: null,
	previewMatrix: null,
	currentWindow: null,
	init: function(){
		this.canvas = document.getElementById('cnv_preview');
		this.canvas.ctx = this.canvas.getContext("2d");
	},
	open: function(_window){
		this.currentWindow = this.windows[_window];

		document.getElementById('title').innerHTML = this.currentWindow.caption;
		document.getElementById('content').innerHTML = this.currentWindow.content;

		var bg = document.getElementById('modal'),
			winEl = document.getElementById('window');
		bg.style = "display: block";

		var top = (bg.offsetHeight - winEl.offsetHeight)/2,
			left =  (bg.offsetWidth - winEl.offsetWidth)/2;
		winEl.style = 'top:'+top+'px; left:'+left+'px;';

		//load preview
		this.previewMatrix = control.getLayer().data;
		var
			width = this.previewMatrix.length,
			height = this.previewMatrix[0].length;
		if (width > height)
			this.previewMatrix = transform.resize(this.previewMatrix, false, { width : 300 })
		else
			this.previewMatrix = transform.resize(this.previewMatrix, false, { height : 300 });
		this.canvas.height = this.previewMatrix[0].length;
		this.canvas.width = this.previewMatrix.length;
		
		this.previewData = this.canvas.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		this.preview(this.previewMatrix);
		
		this.currentWindow.onOpen();
	},
	preview: function(_data){
		this.previewData.set(_data);
		this.canvas.ctx.putImageData(this.previewData, 0, 0);
	},
	close: function(){
		document.getElementById('modal').style = "display: none";
	},
	apply: function(){
		this.currentWindow.apply();
		this.close();
	}
}

modal.windows = {
	threshold: {
		caption: 'Threshold',
		data: null, 
		content: 	'<label>Threshold Level:</label><input id="thresh_value" value="120" type="text" id="threshold_level" onchange="modal.currentWindow.preview(\'text\')" />'+
		        	'<br>'+
		        	'<canvas id="cnv_histogram" class="border" width="255" height="100" style="margin-left:10px"></canvas>'+
		        	'<br>'+
					'<input id="thresh_range" type="range" min="0" max="255" step="1" style="width:255px;"  onchange="modal.currentWindow.preview(\'range\')" />'+
					'<br>',
		onOpen: function(){
			this.data = control.getLayer().data;
			var histogram = new Array(256).fill(0);
			for (var x = 0; x < this.data.length; x++)
				for (var y = 0; y< this.data[0].length; y++)
				{
					var grayTone = Math.round((this.data[x][y][0] + this.data[x][y][1] + this.data[x][y][2])/3);
					histogram[grayTone]++;
				}
			var maxValue = 0;
			for (var i = 0; i < 256; i++){
				if (histogram[i] > maxValue) maxValue = histogram[i];
			}
			var ctx = document.getElementById('cnv_histogram').getContext("2d");
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
			ctx.beginPath();
			for (var i = 0; i < 256; i++){
				ctx.moveTo(i, 100);
				ctx.lineTo(i, 100-100*histogram[i]/maxValue);
			}
			ctx.stroke();
		},
		preview: function(_input){
			if (_input == 'text')
			{
				var value = document.getElementById('thresh_value').value;
				document.getElementById('thresh_range').value = value;
			}
			else
			{
				var value = document.getElementById('thresh_range').value;
				document.getElementById('thresh_value').value = value;				
			}
			 
			modal.preview(adjustaments.threshold(modal.previewMatrix, false, { level: value}));
		},
		apply: function(){
			var value = document.getElementById('thresh_value').value;
			adjustaments.threshold(control.getLayer().data, true, { level: value });
		}
	}
}