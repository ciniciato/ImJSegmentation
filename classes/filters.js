var filters = {
	meanFilter: function(_data, _draw, _){
	    var data = _data,
			draw = (_draw === undefined) ? false : _draw,
			size = (_.size === undefined) ? 3 : _.size;
			mask = new Array(size).fill(new Array(size).fill( 1/(size*size) )),
			newData = [];
		if (draw)
		{
			var log = 'meanFilter[size: '+size+']';
			console.time(log);
		}

		newData = convolutionMask(data, mask);
		
		if (draw)
		{
			copyData(newData, data);
			canvas.draw({img: control.archives.current.getImg()});
	    	console.timeEnd(log);
		}
		else
			return newData;
	},
	gaussianFilter: function(_data, _draw, _){
		if (_ === undefined) _ = {};
	    var data = _data,
	    	width = data.length,
	    	height = data[0].length,
			draw = (_draw === undefined) ? false : _draw,
			sigma = (_.sigma === undefined) ? 1.4 : _.sigma,
			size = (_.size === undefined) ? 3 : _.size;
			mask = gausianMask(sigma, size),
			newData = [];

		if (draw)
		{
			var log = 'gaussianFilter[size: '+size+'; sigma: '+sigma+']';
			console.time(log);
		}

		newData = convolutionMask(data, mask);
		
		if (draw)
		{
			copyData(newData, data);
			canvas.draw({img: control.archives.current.getImg()});
	    	console.timeEnd(log);
		} 
		else
			return newData;
	},
	pixelate: function(_data, _draw, _){
	    var data = _data,
			width = data.length,
			height = data[0].length,
			windowSize = (_.windowSize === undefined) ? [3,3] : _.windowSize,
			draw = (_draw === undefined) ? false : _draw,
			newData = [];

		if (draw)
		{
			var log = 'pixelate[size: '+windowSize[0]+'x'+windowSize[1]+']';
			console.time(log);
			newData = data;
		}
		else
		{
			for (var x = 0; x < width; x++) newData[x] = new Array(height).fill([]);
		}
		for (y = 0; y < height; y+= windowSize[1])
		{	
			for (x = 0; x < width; x+= windowSize[0])
			{ 
				var newColor = [0, 0, 0], pixN = 0;
				for (var i = 0; i <= windowSize[0]; i++) 
				{
					for (var j = 0; j <= windowSize[1]; j++) 
					{
						if (data[x+i] !== undefined && data[x+i][y+j] !== undefined)
						{
							newColor[0] += data[x+i][y+j][0];
							newColor[1] += data[x+i][y+j][1];
							newColor[2] += data[x+i][y+j][2];
							pixN++;
						}
					}
				}
				newColor = [Math.round(newColor[0]/pixN), Math.round(newColor[1]/pixN), Math.round(newColor[2]/pixN)];
				for (var i = 0; i <= windowSize[0]; i++) 
					for (var j = 0; j <= windowSize[1]; j++)
						if (data[x+i] !== undefined && data[x+i][y+j] !== undefined)
						{
							newData[x+i][y+j] = newColor;
						}
			}//for x
		}//for y
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
	    	console.timeEnd(log);
		}
		else
			return newData;
	},
	medianFilter: function(_data, _draw, _){
	    var data = _data,
			width = data.length,
			height = data[0].length,
			windowSize = (_.windowSize === undefined) ? [3,3] : _.windowSize,
			maskSize = [(windowSize[0]-1)/2, (windowSize[1]-1)/2],
			draw = (_draw === undefined) ? false : _draw,
			newData = [];
		if (draw)
		{
			var log = 'medianFilter[size: '+windowSize[0]+'x'+windowSize[1]+']';
			console.time(log);
		}

		for (y = 0; y < height; y++)
		{	
			for (x = 0; x < width; x++)
			{ 
				if (y == 0) newData[x] = [];
				var colors = [];
				for (var i = -maskSize[0]; i <= maskSize[0]; i++) 
				{
					for (var j = -maskSize[1]; j <= maskSize[1]; j++) 
					{
						var iM = i + maskSize[0],
							jM = j + maskSize[1];
						if (data[x+i] !== undefined && data[x+i][y+j] !== undefined)
						{
							var avg = (data[x+i][y+j][0]+data[x+i][y+j][1]+data[x+i][y+j][2])/3
							colors.push({avg: avg, rgb: data[x+i][y+j]});
						}
					}
				}
				if (colors.length == 0)
					var color = colors[0].rgb
				else if (colors.length % 2 != 0)
				{ 
					var ind = (colors.length-1)/2;
					colors.sort((a,b)=>(a.avg > b.avg));
					var color = colors[ind].rgb;
				}
				else
				{ 
					var ind = (colors.length)/2;
					colors.sort((a,b)=>(a.avg > b.avg));
					var color = [(colors[ind].rgb[0]+colors[ind-1].rgb[0])/2,
								(colors[ind].rgb[1]+colors[ind-1].rgb[1])/2,
								(colors[ind].rgb[2]+colors[ind-1].rgb[2])/2];
				}
				newData[x][y] = [color[0], color[1], color[2]];
			}//for x
		}//for y
		if (draw)
		{
			copyData(newData, data);
			canvas.draw({img: control.archives.current.getImg()});
	   	 	console.timeEnd(log);
		}
		else
			return newData;
	},
	lowFilter: function(_data, _draw, _){
	    var data = _data,
			width = data.length,
			height = data[0].length,
			size = (_.size === undefined) ? 3 : _.size,
			maskSize = Math.floor(size/2),
			draw = (_draw === undefined) ? false : _draw,
			newData = [];

		if (draw)
		{
			var log = 'lowFilter[size: '+size+']';
			console.time(log);
		}
		for (y = 0; y < height; y++)
		{	
			for (x = 0; x < width; x++)
			{ 
				if (y == 0) newData[x] = [];
				var newColor = {avg:255, rgb:[]};
				for (var i = -maskSize; i <= maskSize; i++) 
				{
					for (var j = -maskSize; j <= maskSize; j++) 
					{
						var iM = i + maskSize,
							jM = j + maskSize;
						if (data[x+i] !== undefined && data[x+i][y+j] !== undefined)
						{
							var avg = (data[x+i][y+j][0]+data[x+i][y+j][1]+data[x+i][y+j][2])/3;
							if (avg < newColor.avg) newColor = {avg: avg, rgb: data[x+i][y+j]};
						}
					}
				}
				newData[x][y] = [newColor.rgb[0], newColor.rgb[1], newColor.rgb[2]];
			}//for x
		}//for y
		if (draw)
		{
			copyData(newData, data);
			canvas.draw({img: control.archives.current.getImg()});
	   	 	console.timeEnd(log);
		}
		else
			return newData;
	},	
	highFilter: function(_data, _draw, _){
	    var data = _data,
			width = data.length,
			height = data[0].length,
			size = (_.size === undefined) ? 3 : _.size,
			maskSize = Math.floor(size/2),
			draw = (_draw === undefined) ? false : _draw,
			newData = [];

		if (draw)
		{
			var log = 'highFilter[size: '+size+']';
			console.time(log);
		}
		for (y = 0; y < height; y++)
		{	
			for (x = 0; x < width; x++)
			{ 
				if (y == 0) newData[x] = [];
				var newColor = {avg:0, rgb:[]};
				for (var i = -maskSize; i <= maskSize; i++) 
				{
					for (var j = -maskSize; j <= maskSize; j++) 
					{
						var iM = i + maskSize,
							jM = j + maskSize;
						if (data[x+i] !== undefined && data[x+i][y+j] !== undefined)
						{
							var avg = (data[x+i][y+j][0]+data[x+i][y+j][1]+data[x+i][y+j][2])/3;
							if (avg > newColor.avg) newColor = {avg: avg, rgb: data[x+i][y+j]};
						}
					}
				}
				newData[x][y] = [newColor.rgb[0], newColor.rgb[1], newColor.rgb[2]];
			}//for x
		}//for y
		if (draw)
		{
			copyData(newData, data);
			canvas.draw({img: control.archives.current.getImg()});
	   	 	console.timeEnd(log);
		}
		else
			return newData;
	},
	LoGEdge: function(_data, _draw, _){
		if (_ === undefined) _ = {};
	    var data = _data,
			draw = (_draw === undefined) ? false : _draw,
			sigma = (_.sigma === undefined) ? 1.4 : _.sigma,
			size = (_.size === undefined) ? 3 : _.size;
			mask = LoGMask(sigma, size),
			newData = [];
		var log = 'LoGFilter[size: '+size+'; sigma: '+sigma+']';
		console.time(log);

		newData = convolutionMask(data, mask);
		
		if (draw){
			copyData(newData, data);
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	laplacianEdge: function(_data, _draw){//laplacian second-derivative
	    var data = _data,
			draw = (_draw === undefined) ? false : _draw,
			mask = [[0,  1, 0],
					[1, -4, 1],
					[0,  1, 0]],
			newData = [];
		var log = 'laplacianEdge';
		console.time(log);

		newData = convolutionMask(data, mask);
		
		if (draw){
			copyData(newData, data);
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	sobelEdge: function(_data, _draw){
	    var data = _data,
			width = data.length,
			height = data[0].length,
			draw = (_draw === undefined) ? false : _draw,
			newData = [],
			maskSize = 1,
			gradOperator = {x: [[-1,  0,  1],
								[-2,  0,  2],
								[-1,  0,  1]],
							y: [[ 1,  2,  1],
								[ 0,  0,  0],
								[-1, -2, -1]]};
		var log = 'sobelEdge';
		console.time(log);	

		for (y = 0; y < height; y++)
		{	
			for (x = 0; x < width; x++)
			{ 
				if (y == 0) newData[x] = [];
				var gradient = {x: 0, y: 0};
				for (var i = -maskSize; i <= maskSize; i++) 
				{
					for (var j = -maskSize; j <= maskSize; j++) 
					{
						var iM = i + maskSize,
							jM = j + maskSize;
						if (data[x+i] !== undefined && data[x+i][y+j] !== undefined)
						{
							var gray = (data[x+i][y+j][0]+data[x+i][y+j][1]+data[x+i][y+j][2])/3;
							gradient.x += gray * gradOperator.x[iM][jM];
							gradient.y += gray * gradOperator.y[iM][jM];
						}
					}
				}
				var gradMagnitude = Math.sqrt(gradient.x*gradient.x + gradient.y*gradient.y);
				if (gradMagnitude > 255) gradMagnitude = 255;
				var gradDirection = Math.atan2(gradient.y, gradient.x);
				newData[x][y] = [gradMagnitude, gradMagnitude, gradMagnitude];
			}//for x
		}//for y
		if (draw){
			copyData(newData, data);
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	}
}

function convolutionMask(_data, _mask){
    var data = _data,
		width = data.length,
		height = data[0].length,
		mask = _mask,
		maskSize = Math.floor(_mask.length/2),
		newData = [];

	for (y = 0; y < height; y++)
	{	
		for (x = 0; x < width; x++)
		{ 
			if (y == 0) newData[x] = [];
			var newColor = [0, 0, 0]
			for (var i = -maskSize; i <= maskSize; i++) 
			{
				for (var j = -maskSize; j <= maskSize; j++) 
				{
					var iM = i + maskSize,
						jM = j + maskSize;
					if (data[x+i] !== undefined && data[x+i][y+j] !== undefined)
					{
						newColor[0] += data[x+i][y+j][0] * mask[iM][jM];
						newColor[1] += data[x+i][y+j][1] * mask[iM][jM];
						newColor[2] += data[x+i][y+j][2] * mask[iM][jM];
					}
				}
			}
			newData[x][y] = [newColor[0], newColor[1], newColor[2]];
		}//for x
	}//for y
	return newData;
}