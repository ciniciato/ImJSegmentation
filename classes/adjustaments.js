//adjustaments.invert([data, draw]) = INVERT COLORS
var adjustaments = 
{
	invert : function(_)//data(matrix), draw
	{ 
	    var data = _.data,
			height = data.length,
			width = data[0].length;
			draw = (_.draw === undefined) ? false : true;

		var log = 'Invert';
		console.time(log);
		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
			{ 
				data[y][x] = [255 - data[y][x][0], 255 - data[y][x][1], 255 - data[y][x][2]];
			}//for x
		}//for y
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	desaturate : function(_)//data(matrix), draw
	{ 
	    var data = _.data,
			height = data.length,
			width = data[0].length;
			draw = (_.draw === undefined) ? false : true;

		var log = 'Desaturate';
		console.time(log);
		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
			{ 
				var gray = (data[y][x][0]+data[y][x][1]+data[y][x][2])/3;
				data[y][x] = [gray, gray, gray];
			}//for x
		}//for y
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	threshold : function(_)//data(matrix), draw, level
	{ 
	    var data = _.data,
			height = data.length,
			width = data[0].length,
			draw = (_.draw === undefined) ? false : true,
			level = (_.level === undefined) ? 128 : _.level;

		var log = 'Threshold[level:'+level+']';
		console.time(log);
		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
			if(data[y][x][0] < 256)
				{ 
					var gray = (data[y][x][0]+data[y][x][1]+data[y][x][2])/3;
					if (gray > level)
						data[y][x] = [255, 255, 255];
					else
						data[y][x] = [0, 0, 0];
				}//for x
		}//for y
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	adaptativeThreshold : function(_){//data, draw, windowSize, threshold
	    var data = _.data,
			height = data.length,
			width = data[0].length;
			draw = (_.draw === undefined) ? false : true,
			iData = [],//integralized data
			windowSize = (_.windowSize == undefined) ? Math.ceil(width/20) : _.windowSize,
			threshold = (_.threshold == undefined) ? 5 : _.threshold;

		var log = 'Adaptative threshold, windowSize:'+windowSize+' threshold:'+threshold+'%';
		console.time(log);
		//INTEGRALIZE DATA
		for (y = 0; y < height; y++)
		{
			iData[y] = [];
			for (x = 0; x < width; x++)
			{ 
				var A = ( x - 1 < 0 || y - 1 < 0 ) ? 0 : iData[y-1][x-1];
					B = ( y - 1 < 0 ) ? 0 : iData[y-1][x];
					C = ( x - 1 < 0 ) ? 0 : iData[y][x-1];
				iData[y][x] = C - A + B + data[y][x][0]/255;
			}//for x
		}//for y
		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
			{
				var posA = {x: (x - windowSize < 0) ? 0 : x - windowSize, 
							y: (y - windowSize < 0) ? 0 : y - windowSize},
					posB = {x: (x + windowSize >= width) ? width-1: x + windowSize, 
							y: (y + windowSize >= height) ? height-1: y + windowSize};
				var count = (posB.x - posA.x)*(posB.y - posA.y);
				var A = iData[posB.y][posB.x], 
					B = (posA.y - 1 < 0) ? 0 : iData[posA.y - 1][posB.x],
					C = (posA.x - 1 < 0) ? 0 : iData[posB.y][posA.x - 1],
					D = (posA.x - 1 < 0 || posA.y - 1 < 0) ? 0 : iData[posA.y - 1][posA.x - 1];


				var sum = A - B - C + D;
			 	if (data[y][x][0] * count/255 <= (sum * (100 -  threshold)/100) )
					data[y][x] = [0, 0, 0]
				else 
					data[y][x] = [255, 255, 255];
			}//for x
		}//for y
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	}
}