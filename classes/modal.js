var modal = {
	canvas: null,
	previewData: null,
	previewMatrix: null,
	currentWindow: null,
	position: {x: 0, y: 0},
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
		this.canvas.scale = {x:height/this.canvas.height,  y: width/this.canvas.width};
		
		this.previewData = this.canvas.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		this.preview(this.previewMatrix);

		var top = Math.round((bg.offsetHeight - winEl.offsetHeight)/2),
			left =  Math.round((bg.offsetWidth - winEl.offsetWidth)/2);
		winEl.style = 'top:'+top+'px; left:'+left+'px;';
		this.position = {x: left, y: top};
		
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
		control.previousData.push({
			layer: control.getLayer(),
			data: copyData(control.getLayer().data)
		});
		this.currentWindow.apply();
		this.close();
	}
}

modal.windows = {
	threshold: {
		caption: 'Threshold',
		data: null, 
		content: 	'<label>Threshold Level:</label><input id="thresh_value" value="128" type="text" id="threshold_level" onchange="modal.currentWindow.preview(\'text\')" />'+
		        	'<br>'+
		        	'<canvas id="cnv_histogram" class="border" width="255" height="100" style="margin-left:10px"></canvas>'+
		        	'<br>'+
					'<input id="thresh_range" type="range" min="0" max="255" step="1" value="128" style="width:255px;"  onchange="modal.currentWindow.preview(\'range\')" />'+
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
			this.preview();
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
			
			modal.preview(adjustaments.threshold(modal.previewMatrix, false, { level: value }));
		},
		apply: function(){
			var value = document.getElementById('thresh_value').value;
			adjustaments.threshold(control.getLayer().data, true, { level: value });
		}
	},

	linearPieceWise: {
		caption: 'Linear Piecewise',
		data: null, 
		pointer: null,
		points: [{i:0, o:0}, {i:255, o:255}],
		content: 	'<canvas id="cnv_curve" width="255" height="255"></canvas>',
		drawCurve: function(){
			var ctx = document.getElementById('cnv_curve').getContext("2d");

			ctx.clearRect(0,0,255,255);
			//GRID
			ctx.strokeStyle = 'rgba(0,0,0,.2)';
			ctx.beginPath();
			for (var i = 0; i < 255; i+=Math.round(255/4))
			{
				ctx.moveTo(i, 0);
				ctx.lineTo(i, 255);
				ctx.moveTo(0, i);
				ctx.lineTo(255, i);
			}
			ctx.stroke();

			this.points.sort((a,b) => (a.i > b.i));

			//CURVES
			ctx.strokeStyle = 'rgba(0,0,0,1)';
			ctx.beginPath();
			for (var i = 0; i < this.points.length; i++){
				ctx.lineTo(this.points[i].i, 255-this.points[i].o);
				ctx.moveTo(this.points[i].i, 255-this.points[i].o);
				ctx.arc(this.points[i].i, 255-this.points[i].o, 5, 0, (Math.PI/180)*360, false);
			}
			ctx.stroke();
		},
		onOpen: function(){
			this.points = [{i:0, o:0}, {i:255, o:255}];
			var canvas = document.getElementById('cnv_curve'),
				ctx = canvas.getContext("2d");
			canvas.position = {x: modal.position.x+canvas.offsetLeft, y: modal.position.y+canvas.offsetTop};
			this.pointer = new pointer(canvas);
			var that = this;
			this.pointer.events.onup = function(){
				that.points.push({i: that.pointer.position.x, o: 255-that.pointer.position.y});
				that.drawCurve();
				that.preview();
			}
			this.pointer.events.onmove = function(){
				if (that.pointer.isDown && that.pointer.hasMoved)
				{
					var newPoint = {i: that.pointer.position.x, o: 255-that.pointer.position.y};
					var ctx = document.getElementById('cnv_curve').getContext("2d");

					ctx.clearRect(0,0,255,255);
					//GRID
					ctx.strokeStyle = 'rgba(0,0,0,.2)';
					ctx.beginPath();
					for (var i = 0; i < 255; i+=Math.round(255/4))
					{
						ctx.moveTo(i, 0);
						ctx.lineTo(i, 255);
						ctx.moveTo(0, i);
						ctx.lineTo(255, i);
					}
					ctx.stroke();

					that.points.sort((a,b) => (a.x > b.x));

					//CURVES
					var points = [];
					ctx.strokeStyle = 'rgba(0,0,0,1)';
					ctx.beginPath();
					var flag = true;
					for (var i = 0; i < that.points.length; i++){
						if (flag && that.points[i].i > newPoint.i)
						{	
							flag = false;
							ctx.lineTo(newPoint.i, 255-newPoint.o);
							ctx.moveTo(newPoint.i, 255-newPoint.o);
							ctx.arc(newPoint.i, 255-newPoint.o, 5, 0, (Math.PI/180)*360, false);
							points.push(newPoint);
						}
						ctx.lineTo(that.points[i].i, 255-that.points[i].o);
						ctx.moveTo(that.points[i].i, 255-that.points[i].o);
						ctx.arc(that.points[i].i, 255-that.points[i].o, 5, 0, (Math.PI/180)*360, false);
						points.push(that.points[i]);
					}
					ctx.stroke();
					modal.preview(adjustaments.linearPieceWise(modal.previewMatrix, false, { points: points }));
				}	
			}
			var data = modal.previewMatrix;
			for (var x = 0; x < data.length; x++)	
				for (var y = 0; y < data[0].length; y++)
				{
					data[x][y] = [	roundRGB(data[x][y][0]),
									roundRGB(data[x][y][1]),
									roundRGB(data[x][y][2])];														 	
				}	
			this.drawCurve();
		},
		preview: function(){			
			modal.preview(adjustaments.linearPieceWise(modal.previewMatrix, false, { points: this.points }));
		},
		apply: function(){
			var data = control.getLayer().data;
			for (var x = 0; x < data.length; x++)	
				for (var y = 0; y < data[0].length; y++)
				{
					data[x][y] = [	roundRGB(data[x][y][0]),
									roundRGB(data[x][y][1]),
									roundRGB(data[x][y][2])];														 	
				}	
			adjustaments.linearPieceWise(data, true, { points: this.points });
		}
	},
	adaptativeThreshold: {
		caption: 'Adaptative Threshold',
		data: null, 
		content: 	
					'<label>minThreshold:</label><br><input id="thresh_range" type="range" min="0" max="100" step="1" value="5" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>'+
					'<label>windowSize%:</label><br><input id="window_range" type="range" min="1" max="100" step="1" value="20" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>',
		onOpen: function(){
			this.preview();
		},
		preview: function(){
			var thresh = document.getElementById('thresh_range').value;
			var windowSize = document.getElementById('window_range').value;
			
			modal.preview(adjustaments.adaptativeThreshold(modal.previewMatrix, false, { windowSize: windowSize, threshold: thresh }));
		},
		apply: function(){
			var thresh = document.getElementById('thresh_range').value;
			var windowSize = document.getElementById('window_range').value;
			adjustaments.adaptativeThreshold(control.getLayer().data, true, { windowSize: windowSize, threshold: thresh });
		}
	},
	segmentationHSV: {
		caption: 'Segmentation HSV',
		data: null, 
		content: 	
					'<label>tolerance:</label><br><input id="tolerance_range" type="range" min="0" max="100" step="1" value="15" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>',
		onOpen: function(){
			this.preview();
		},
		preview: function(){
			var tolerance = document.getElementById('tolerance_range').value;			
			modal.preview(segmentation.regionsGrowHSV(modal.previewMatrix, false, { threshold: tolerance, simbolicColor: false }));
		},
		apply: function(){
			var tolerance = document.getElementById('tolerance_range').value;
			segmentation.regionsGrowHSV(control.getLayer().data, true, { threshold: tolerance, simbolicColor: false });
		}
	},
	seedHSV: {
		caption: 'Segmentation Seed HSV',
		data: null, 
		pointer: null,
		points: [],
		content: 	
					'<label>tolerance:</label><br><input id="tolerance_range" type="range" min="0" max="100" step="1" value="15" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>',
		drawPoints: function(){
			var ctx = modal.canvas.ctx;
			ctx.strokeStyle = 'red';
			ctx.beginPath();
			for (var i = 0; i < this.points.length; i++){
				ctx.moveTo(this.points[i].x, this.points[i].y);
				ctx.arc(this.points[i].x, this.points[i].y, 2, 0, (Math.PI/180)*360, false);
			} 
			ctx.stroke();
		},
		onOpen: function(){
			this.points = [];

			var canvas = modal.canvas,
				ctx = canvas.ctx;
			canvas.position = {x: modal.position.x+canvas.offsetLeft, y: modal.position.y+canvas.offsetTop};
			this.pointer = new pointer(canvas);
			var that = this;
			this.pointer.events.onup = function(){
				that.points.push(that.pointer.position);
				that.preview();
			}		
		},
		preview: function(){
			var tolerance = document.getElementById('tolerance_range').value;
			modal.preview(segmentation.seedHSV(modal.previewMatrix, false, { threshold: tolerance, points: this.points }));
			this.drawPoints();
		},
		apply: function(){
			var tolerance = document.getElementById('tolerance_range').value,
				transformedPoints = [],
				scale = modal.canvas.scale;
				console.log(scale);
			for (var i = 0; i < this.points.length; i++)
				transformedPoints.push({x: Math.round(this.points[i].x*scale.x), y: Math.round(this.points[i].y*scale.y)});
			console.log(transformedPoints);
			segmentation.seedHSV(control.getLayer().data, true, { threshold: tolerance, points: transformedPoints });
		}
	},
	medianFilter: {
		caption: 'Median Filter',
		data: null, 
		content: 	
					'<label>Horizontal size:</label><br><input id="hor_range" type="range" min="1" max="21" step="2" value="3" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>'+
					'<label>Vertical size:</label><br><input id="vert_range" type="range" min="1" max="21" step="2" value="3" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>',
		onOpen: function(){
			this.preview();
		},
		preview: function(){
			var horsize = document.getElementById('hor_range').value,
				vertsize = document.getElementById('vert_range').value;
			modal.preview(filters.medianFilter(modal.previewMatrix, false, { windowSize: [horsize, vertsize] }));
		},
		apply: function(){
			var horsize = document.getElementById('hor_range').value,
				vertsize = document.getElementById('vert_range').value;
			filters.medianFilter(control.getLayer().data, true, { windowSize: [horsize, vertsize] });
		}
	},
	meanFilter: {
		caption: 'Mean Filter',
		data: null, 
		content: 	
					'<label>Mask size:</label><br><input id="mask_range" type="range" min="3" max="21" step="2" value="3" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>',
		onOpen: function(){
			this.preview();
		},
		preview: function(){
			var size = Number(document.getElementById('mask_range').value);
			modal.preview(filters.meanFilter(modal.previewMatrix, false, { size: size }));
		},
		apply: function(){
			var size = Number(document.getElementById('mask_range').value);
			filters.meanFilter(control.getLayer().data, true, { size: size });
		}
	},
	gaussianFilter: {
		caption: 'Gaussian Filter',
		data: null, 
		content: 	
					'<label>Mask size:</label><br><input id="mask_range" type="range" min="3" max="21" step="2" value="3" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>'+
					'<label>Sigma:</label><br><input id="sigma_range" type="range" min=".5" max="5" step=".1" value="1.4" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>',
		onOpen: function(){
			this.preview();
		},
		preview: function(){
			var size = Number(document.getElementById('mask_range').value),
				sigma = Number(document.getElementById('sigma_range').value);
			modal.preview(filters.gaussianFilter(modal.previewMatrix, false, { size: size, sigma: sigma }));
		},
		apply: function(){
			var size = Number(document.getElementById('mask_range').value),
				sigma = Number(document.getElementById('sigma_range').value);
			filters.gaussianFilter(control.getLayer().data, true, { size: size, sigma: sigma });
		}
	},
	pixelateFilter: {
		caption: 'Pixelate Filter',
		data: null, 
		content: 	
					'<label>Horizontal size:</label><br><input id="hor_range" type="range" min="1" max="21" step="2" value="3" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>'+
					'<label>Vertical size:</label><br><input id="vert_range" type="range" min="1" max="21" step="2" value="3" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>',
		onOpen: function(){
			this.preview();
		},
		preview: function(){
			var horsize = Number(document.getElementById('hor_range').value),
				vertsize = Number(document.getElementById('vert_range').value);
			modal.preview(filters.pixelate(modal.previewMatrix, false, { windowSize: [horsize, vertsize] }));
		},
		apply: function(){
			var horsize = Number(document.getElementById('hor_range').value),
				vertsize = Number(document.getElementById('vert_range').value);
			filters.pixelate(control.getLayer().data, true, { windowSize: [horsize, vertsize] });
		}
	},
	lowFilter: {
		caption: 'Low Filter',
		data: null, 
		content: 	
					'<label>Mask size:</label><br><input id="mask_range" type="range" min="3" max="21" step="2" value="3" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>',
		onOpen: function(){
			this.preview();
		},
		preview: function(){
			var size = Number(document.getElementById('mask_range').value);
			modal.preview(filters.lowFilter(modal.previewMatrix, false, { size: size }));
		},
		apply: function(){
			var size = Number(document.getElementById('mask_range').value);
			filters.lowFilter(control.getLayer().data, true, { size: size });
		}
	},
	highFilter: {
		caption: 'High Filter',
		data: null, 
		content: 	
					'<label>Mask size:</label><br><input id="mask_range" type="range" min="3" max="21" step="2" value="3" style="width:100px;"  onchange="modal.currentWindow.preview()" />'+
					'<br>',
		onOpen: function(){
			this.preview();
		},
		preview: function(){
			var size = Number(document.getElementById('mask_range').value);
			modal.preview(filters.highFilter(modal.previewMatrix, false, { size: size }));
		},
		apply: function(){
			var size = Number(document.getElementById('mask_range').value);
			filters.highFilter(control.getLayer().data, true, { size: size });
		}
	},
}