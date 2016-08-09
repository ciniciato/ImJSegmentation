var segmentation = {
	regionsGrowRGB: function(_data, _draw, _){
		if (_ === undefined) _ = {};
	    var data = _data,
			width = data.length,
			height = data[0].length,
			draw = (_draw === undefined) ? false : _draw,
			threshold = (_.threshold === undefined) ? 50 : _.threshold,
			simbolicColor = (_.simbolicColor === undefined) ? false : _.simbolicColor,
			labeledData = [],
			neighbors = [],
			regionIndex = 0,
			regions = [];

		var log = 'regionsGrowRGB';
		console.time(log);
		function similarity(pixA, pixB){
			var dR = pixA[0] - pixB[0],
				dG = pixA[1] - pixB[1],
				dB = pixA[2] - pixB[2];
			return Math.sqrt(dR * dR + dG * dG + dB * dB);
		}
		var neighborsList = [	{x: 1, y: 0},//right|east 
								{x: 0, y: 1},//bottom|west
								{x:-1, y: 0},//left|south
								{x: 0, y:-1}];//top|north
		var neighborsList = [	{x: 1, y: 0},//right|east 
								{x: 0, y: 1},//bottom|west
								{x:-1, y: 0},//left|south
								{x: 0, y:-1},
								{x: 1, y: 1},
								{x: 1, y:-1},
								{x: -1, y: 1},
								{x: -1, y:-1}];//top|north
		for (x = 0; x < width; x++) labeledData[x] = new Array(height).fill(-1);
		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
				if (labeledData[x][y] == -1)
				{ 
					var color = [data[x][y][0], data[x][y][1], data[x][y][2]], size = 0;
					neighbors.push({x: x, y: y});
					labeledData[x][y] = regionIndex;

					while (neighbors.length > 0)
					{
						var xC = neighbors[0].x,
							yC = neighbors[0].y;
						for (var iN = 0; iN < neighborsList.length; iN++)
						{
							var xN = xC + neighborsList[iN].x,
								yN = yC + neighborsList[iN].y;
							if (data[xN] !== undefined && data[xN][yN] !== undefined)
								if (labeledData[xN][yN] == -1 && similarity(color, data[xN][yN]) <= threshold)
								{
									size++;
									color[0] = (size-1)*color[0]/size + data[xN][yN][0]/size;
									color[1] = (size-1)*color[1]/size + data[xN][yN][1]/size;
									color[2] = (size-1)*color[2]/size + data[xN][yN][2]/size;
									neighbors.push({x: xN, y: yN});
									labeledData[xN][yN] = regionIndex;
								}
						}
						neighbors.shift();
					}//while neighbors
					if (simbolicColor)
						regions.push(randomColor())
					else
						regions.push(color);
					regionIndex++;
				}//for x
		}//for y

		for (y = 0; y < height; y++)
			for (x = 0; x < width; x++)
			{
				var color = regions[labeledData[x][y]];
				data[x][y] = [color[0], color[1], color[2]];
			}

		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	regionsGrowYCC: function(_data, _draw, _){
		if (_ === undefined) _ = {};
	    var data = _data,
			width = data.length,
			height = data[0].length,
			draw = (_draw === undefined) ? false : _draw,
			threshold = (_.threshold === undefined) ? 10 : _.threshold,
			simbolicColor = (_.simbolicColor === undefined) ? false : _.simbolicColor,
			labeledData = [],
			neighbors = [],
			regionIndex = 0,
			regions = [];

		var log = 'regionsGrowYCC';
		console.time(log);
		function similarity(pixA, pixB){
			var Y = pixA[0] - pixB[0],
				Cr = pixA[1] - pixB[1],
				Cb = pixA[2] - pixB[2];
			return Math.sqrt(Y * Y + Cr * Cr + Cb * Cb);
		}
		var neighborsList = [	{x: 1, y: 0},//right|east 
								{x: 0, y: 1},//bottom|west
								{x:-1, y: 0},//left|south
								{x: 0, y:-1}];//top|north
		var neighborsList = [	{x: 1, y: 0},//right|east 
								{x: 0, y: 1},//bottom|west
								{x:-1, y: 0},//left|south
								{x: 0, y:-1},
								{x: 1, y: 1},
								{x: 1, y:-1},
								{x: -1, y: 1},
								{x: -1, y:-1}];//top|north
		for (x = 0; x < width; x++) labeledData[x] = new Array(height).fill(-1);
		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
				if (labeledData[x][y] == -1)
				{ 
					var YCC = RGBtoYCC(data[x][y], true);
					var color = [YCC[0], YCC[1], YCC[2]], size = 0, 
						rgbAvg = [data[x][y][0], data[x][y][1], data[x][y][2]];
					neighbors.push({x: x, y: y});
					labeledData[x][y] = regionIndex;
					while (neighbors.length > 0)
					{
						var xC = neighbors[0].x,
							yC = neighbors[0].y;
						for (var iN = 0; iN < neighborsList.length; iN++)
						{
							var xN = xC + neighborsList[iN].x,
								yN = yC + neighborsList[iN].y;
							if (data[xN] !== undefined && data[xN][yN] !== undefined && labeledData[xN][yN] == -1)
							{	
								var YCC = RGBtoYCC(data[xN][yN], true);
								if (similarity(color, YCC) <= threshold)
								{
									size++;
									color[0] = (size-1)*color[0]/size + YCC[0]/size;
									color[1] = (size-1)*color[1]/size + YCC[1]/size;
									color[2] = (size-1)*color[2]/size + YCC[2]/size;

									rgbAvg[0] = (size-1)*rgbAvg[0]/size + data[xN][yN][0]/size;
									rgbAvg[1] = (size-1)*rgbAvg[1]/size + data[xN][yN][1]/size;
									rgbAvg[2] = (size-1)*rgbAvg[2]/size + data[xN][yN][2]/size;

									neighbors.push({x: xN, y: yN});
									labeledData[xN][yN] = regionIndex;
								}
							}
						}
						neighbors.shift();
					}//while neighbors
					if (simbolicColor)
						regions.push(randomColor())
					else
						regions.push(rgbAvg);
					regionIndex++;
				}//for x
		}//for y
		for (y = 0; y < height; y++)
			for (x = 0; x < width; x++)
			{
				var color = regions[labeledData[x][y]];
				data[x][y] = [color[0], color[1], color[2]];
			}

		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	regionsGrowHSV: function(_data, _draw, _){
		if (_ === undefined) _ = {};
	    var data = _data,
			width = data.length,
			height = data[0].length,
			draw = (_draw === undefined) ? false : _draw,
			threshold = (_.threshold === undefined) ? 10 : _.threshold,
			simbolicColor = (_.simbolicColor === undefined) ? false : _.simbolicColor,
			labeledData = [],
			neighbors = [],
			regionIndex = 0,
			regions = [];

		var log = 'regionsGrowHSV';
		console.time(log);
		function similarity(pixA, pixB){
			var H = pixA[0] - pixB[0],
				S = pixA[1] - pixB[1],
				V = pixA[2] - pixB[2];
			return Math.sqrt(H * H + S * S + V * V);
		}
		var neighborsList = [	{x: 1, y: 0},//right|east 
								{x: 0, y: 1},//bottom|west
								{x:-1, y: 0},//left|south
								{x: 0, y:-1}];//top|north
		var neighborsList = [	{x: 1, y: 0},//right|east 
								{x: 0, y: 1},//bottom|west
								{x:-1, y: 0},//left|south
								{x: 0, y:-1},
								{x: 1, y: 1},
								{x: 1, y:-1},
								{x: -1, y: 1},
								{x: -1, y:-1}];//top|north
		for (x = 0; x < width; x++) labeledData[x] = new Array(height).fill(-1);
		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
				if (labeledData[x][y] == -1)
				{ 
					var YCC = RGBtoHSV(data[x][y], true);
					var color = [YCC[0], YCC[1], YCC[2]], size = 0, 
						rgbAvg = [data[x][y][0], data[x][y][1], data[x][y][2]];
					neighbors.push({x: x, y: y});
					labeledData[x][y] = regionIndex;
					while (neighbors.length > 0)
					{
						var xC = neighbors[0].x,
							yC = neighbors[0].y;
						for (var iN = 0; iN < neighborsList.length; iN++)
						{
							var xN = xC + neighborsList[iN].x,
								yN = yC + neighborsList[iN].y;
							if (data[xN] !== undefined && data[xN][yN] !== undefined && labeledData[xN][yN] == -1)
							{	
								var YCC = RGBtoHSV(data[xN][yN], true);
								if (similarity(color, YCC) <= threshold)
								{
									size++;
									color[0] = (size-1)*color[0]/size + YCC[0]/size;
									color[1] = (size-1)*color[1]/size + YCC[1]/size;
									color[2] = (size-1)*color[2]/size + YCC[2]/size;

									rgbAvg[0] = (size-1)*rgbAvg[0]/size + data[xN][yN][0]/size;
									rgbAvg[1] = (size-1)*rgbAvg[1]/size + data[xN][yN][1]/size;
									rgbAvg[2] = (size-1)*rgbAvg[2]/size + data[xN][yN][2]/size;

									neighbors.push({x: xN, y: yN});
									labeledData[xN][yN] = regionIndex;
								}
							}
						}
						neighbors.shift();
					}//while neighbors
					if (simbolicColor)
						regions.push(randomColor())
					else
						regions.push(rgbAvg);
					regionIndex++;
				}//for x
		}//for y
		for (y = 0; y < height; y++)
			for (x = 0; x < width; x++)
			{
				var color = regions[labeledData[x][y]];
				data[x][y] = [color[0], color[1], color[2]];
			}

		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	distanceTransform: function(_data, _draw){
	    var data   = _data,
			width  = data.length,
			height = data[0].length;
			draw   = (_draw === undefined) ? false : _draw;

		var regions     = [],
			neighbors   = [],
			labeledData = new Array(width),
			Tdistance   = new Array(width),//transformed matrix distance
			regionIndex = 1;

		var log = 'distanceTransform';
		console.time(log);
		for (x = 0; x < width; x++) 
		{
			labeledData[x] = new Array(height).fill(-1);
			Tdistance[x]  = new Array(height).fill(-1);
		}
		//GET EDGES
		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
			{ 
				if (data[x][y][0] != 0 && labeledData[x][y] == -1)
				{
					regions.push({points: [], area: 0});

					neighbors.push({x: x, y: y});
					labeledData[x][y] = 0;
					while (neighbors.length > 0){
						var isEdge = false;
						var d = Math.sqrt(2);
						for (var i = 0; i < SQUARENEIGHBORS.length; i++)//PARA
						{						
						 	var yn = neighbors[0].y + SQUARENEIGHBORS[i].y;
								xn = neighbors[0].x + SQUARENEIGHBORS[i].x;
							if (data[xn] !== undefined && data[xn][yn] !== undefined)
								if (data[neighbors[0].x][neighbors[0].y][0] != data[xn][yn][0])
								{
									isEdge = true;
									d = (i % 2 != 0) ? 1 : d;
								}
								else if (labeledData[xn][yn] == -1){	
									neighbors.push({x: xn, y: yn});	
									labeledData[xn][yn] = 0;						
								}
						}//for neighbor
						if (isEdge) {
							regions.last().points.push({y: neighbors[0].y, x: neighbors[0].x});
							Tdistance[neighbors[0].x][neighbors[0].y] = d;
						}else
							Tdistance[neighbors[0].x][neighbors[0].y] = 0;
						regions.last().area++;
						neighbors.shift();		
					}//while
				}
			}//for x
		}//for y
		//CALCULATE TRANSFORM	
		var localMin = 0;
		for (var r = 0; r < regions.length; r++)
		{
			var points = regions[r].points,
				region = regions[r];
			while (points.length>0){
				for (var i = 0; i < 8; i++)//NEIGHBORS
				{
				 	var yn = points[0].y + SQUARENEIGHBORS[i].y,
						xn = points[0].x + SQUARENEIGHBORS[i].x,
				 		value = Tdistance[points[0].x][points[0].y] + SQUARENEIGHBORS[i].d;
					if (data[xn] !== undefined && data[xn][yn] !== undefined)
						if (Tdistance[xn][yn] == 0)
						{	
							points.push({x: xn, y: yn});	
							Tdistance[xn][yn] = value;	
							if (localMin < value) localMin = value;				
						} 
						else if (value < Tdistance[xn][yn]){
							Tdistance[xn][yn] = value;	
							if (localMin < value) localMin = value;
						}
				}//for neighbor
				points.shift();
			}
		}
		//APLLY TRANSFORM		
		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
			{
				var color = Math.round(255*Tdistance[x][y]/localMin);
				data[x][y] = [color, color, color]; 
			}
		}
		
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	}
}