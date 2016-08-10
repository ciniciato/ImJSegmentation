var filters = {
	meanBlur: function(_data, _draw, _){
	    var data = _data,
			draw = (_draw === undefined) ? false : _draw,
			size = (_.size === undefined) ? 3 : _.size;
			mask = new Array(size).fill(new Array(size).fill( 1/(size*size) ));
		var log = 'meanBlur[size: '+size+']';
		console.time(log);

		convolutionMask(data, mask);
		
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	gaussianBlur: function(_data, _draw, _){
		if (_ === undefined) _ = {};
	    var data = _data,
	    	width = data.length,
	    	height = data[0].length,
			draw = (_draw === undefined) ? false : _draw,
			sigma = (_.sigma === undefined) ? 1.4 : _.sigma,
			size = (_.size === undefined) ? 3 : _.size;
			mask = gausianMask(sigma, size),
			newData = [];
		if (!draw)
		{
			newData = new Array(width);
			for (var x = 0; x < width; x++) newData[x] = new Array(height);
		} 
		else
		{
			newData = data;	
			console.time(log);
		}

		var log = 'gaussianBlur[size: '+size+'; sigma: '+sigma+']';
		console.time(log);

		convolutionMask(newData, mask);
		
		if (draw){
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
			size = (_.size === undefined) ? 3 : _.size,
			maskSize = Math.floor(size/2),
			draw = (_draw === undefined) ? false : _draw;

		var log = 'pixelate[size: '+size+']';
		console.time(log);
		for (y = 0; y < height; y+= size)
		{	
			for (x = 0; x < width; x+= size)
			{ 
				var newColor = [0, 0, 0], pixN = 0;
				for (var i = -maskSize; i <= maskSize; i++) 
				{
					for (var j = -maskSize; j <= maskSize; j++) 
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
				for (var i = -maskSize; i <= maskSize; i++) 
					for (var j = -maskSize; j <= maskSize; j++)
						if (data[x+i] !== undefined && data[x+i][y+j] !== undefined)
						{
							data[x+i][y+j][0] = Math.round(newColor[0]/pixN);
							data[x+i][y+j][1] = Math.round(newColor[1]/pixN);
							data[x+i][y+j][2] = Math.round(newColor[2]/pixN);
						}
			}//for x
		}//for y
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	medianFilter: function(_data, _draw, _){
	    var data = _data,
			width = data.length,
			height = data[0].length,
			size = (_.size === undefined) ? 3 : _.size,
			maskSize = Math.floor(size/2),
			draw = (_draw === undefined) ? false : _draw,
			newData = [];

		var log = 'medianFilter[size: '+size+']';
		console.time(log);
		for (y = 0; y < height; y++)
		{	
			for (x = 0; x < width; x++)
			{ 
				if (y == 0) newData[x] = [];
				var colors = [];
				for (var i = -maskSize; i <= maskSize; i++) 
				{
					for (var j = -maskSize; j <= maskSize; j++) 
					{
						var iM = i + maskSize,
							jM = j + maskSize;
						if (data[x+i] !== undefined && data[x+i][y+j] !== undefined)
						{
							var gray = (data[x+i][y+j][0]+data[x+i][y+j][1]+data[x+i][y+j][2])/3
							colors.push({gray: gray, rgb: data[x+i][y+j]});
						}
					}
				}
				var ind = Math.round(colors.length/2);
				colors.sort((a, b) => (a.gray > b.gray));
				newData[x][y] = [colors[ind].rgb[0], colors[ind].rgb[1], colors[ind].rgb[2]];
			}//for x
		}//for y
		copyData(newData, data);
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	lowFilter: function(_data, _draw, _){
	    var data = _data,
			width = data.length,
			height = data[0].length,
			size = (_.size === undefined) ? 3 : _.size,
			maskSize = Math.floor(size/2),
			draw = (_draw === undefined) ? false : _draw,
			newData = [];

		var log = 'lowFilter[size: '+size+']';
		console.time(log);
		for (y = 0; y < height; y++)
		{	
			for (x = 0; x < width; x++)
			{ 
				if (y == 0) newData[x] = [];
				var newColor = {gray:255, rgb:[]};
				for (var i = -maskSize; i <= maskSize; i++) 
				{
					for (var j = -maskSize; j <= maskSize; j++) 
					{
						var iM = i + maskSize,
							jM = j + maskSize;
						if (data[x+i] !== undefined && data[x+i][y+j] !== undefined)
						{
							var gray = (data[x+i][y+j][0]+data[x+i][y+j][1]+data[x+i][y+j][2])/3;
							if (gray < newColor.gray) newColor = {gray: gray, rgb: data[x+i][y+j]};
						}
					}
				}
				newData[x][y] = [newColor.rgb[0], newColor.rgb[1], newColor.rgb[2]];
			}//for x
		}//for y
		copyData(newData, data);
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},	
	LoGEdge: function(_data, _draw, _){
		if (_ === undefined) _ = {};
	    var data = _data,
			draw = (_draw === undefined) ? false : _draw,
			sigma = (_.sigma === undefined) ? 1.4 : _.sigma,
			size = (_.size === undefined) ? 3 : _.size;
			mask = LoGMask(sigma, size);
		var log = 'LoGFilter[size: '+size+'; sigma: '+sigma+']';
		console.time(log);

		convolutionMask(data, mask);
		
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	laplacianEdge: function(_data, _draw){//laplacian second-derivative
	    var data = _data,
			draw = (_draw === undefined) ? false : _draw,
			mask = [[0,  1, 0],
					[1, -4, 1],
					[0,  1, 0]];
		var log = 'laplacianEdge';
		console.time(log);

		convolutionMask(data, mask);
		
		if (draw){
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
		copyData(newData, data);
		if (draw){
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

	var log = 'convolutionMask';
	console.time(log);
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
	copyData(newData, data);
    console.timeEnd(log);
}