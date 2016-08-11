//adjustaments.invert([data, draw]) = INVERT COLORS
var adjustaments = {
	invert : function(_data, _draw){ 
	    var data = _data,
			width = data.length,
			height = data[0].length,
			draw = (_draw === undefined) ? false : _draw;

		var log = 'Invert';
		console.time(log);
		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
			{ 
				data[x][y] = [255 - data[x][y][0], 255 - data[x][y][1], 255 - data[x][y][2]];
			}//for x
		}//for y
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	desaturate : function(_data, _draw){
	    var data = _data,
			width = data.length,
			height = data[0].length,
			draw = (_draw === undefined) ? false : _draw;

		var log = 'Desaturate';
		console.time(log);
		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
			{ 
				var gray = 0.298 * data[x][y][0] + 0.586 * data[x][y][1] + 0.114 * data[x][y][2];//weighted value //avg value (data[x][y][0]+data[x][y][1]+data[x][y][2])/3;
				data[x][y] = [gray, gray, gray];
			}//for x
		}//for y
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	},
	threshold : function(_data, _draw, _){//data(matrix), draw, level 
		if (_ === undefined) _ = {};
	    var data = _data,
			width = data.length,
			height = data[0].length,
			draw = (_draw === undefined) ? false : _draw,
			level = (_.level === undefined) ? 128 : _.level,
			newData = [];
		if (!draw)
		{
			newData = new Array(width);
			for (var x = 0; x < width; x++) newData[x] = [];
		} 
		else
		{
			var log = 'Threshold[level:'+level+']';
			console.time(log);
			newData = data;		
		}

		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
				if(data[x][y][0] < 256)
				{ 
					var gray = (data[x][y][0]+data[x][y][1]+data[x][y][2])/3;
					
					if (gray > level)
						newData[x][y] = [255, 255, 255];
					else
						newData[x][y] = [0, 0, 0];
				}
				else
					newData[x][y] = [256, 256, 256];
		}//for y
		if (draw)
		{
			canvas.draw({img: control.archives.current.getImg()});
	    	console.timeEnd(log);
		}
		else
			return newData;
	},
	adaptativeThreshold : function(_data, _draw, _){
		if (_ === undefined) _ = {};
	    var data = _data,
			width = data.length,
			height = data[0].length;
			draw = (_draw === undefined) ? false : _draw,
			iData = [],//integralized data
			windowSize = (_.windowSize == undefined) ? Math.ceil(width/20) : Math.ceil(width/_.windowSize),
			threshold = (_.threshold == undefined) ? 5 : _.threshold,
			newData = [];
		if (!draw)
		{
			newData = new Array(width);
			for (var x = 0; x < width; x++) newData[x] = [];
		} 
		else
		{
			newData = data;		
			var log = 'Adaptative threshold[windowSize:'+Math.round(width/windowSize)+'%; threshold:'+threshold+'%]';
			console.time(log);
		}
		//INTEGRALIZE DATA
		for (x = 0; x < width; x++)
		{
			iData[x] = [];
			for (y = 0; y < height; y++)
			{ 
				var A = ( x - 1 < 0 || y - 1 < 0 ) ? 0 : iData[x-1][y-1];
					B = ( y - 1 < 0 ) ? 0 : iData[x][y-1];
					C = ( x - 1 < 0 ) ? 0 : iData[x-1][y];
				iData[x][y] = C - A + B + data[x][y][0]/255;
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
				var A = iData[posB.x][posB.y], 
					B = (posA.y - 1 < 0) ? 0 : iData[posB.x][posA.y - 1],
					C = (posA.x - 1 < 0) ? 0 : iData[posA.x - 1][posB.y],
					D = (posA.x - 1 < 0 || posA.y - 1 < 0) ? 0 : iData[posA.x - 1][posA.y - 1];

				var sum = A - B - C + D;
			 	if (data[x][y][0] * count/255 <= (sum * (100 -  threshold)/100) )
					newData[x][y] = [0, 0, 0]
				else 
					newData[x][y] = [255, 255, 255];
			}//for x
		}//for y
		if (draw)
		{
			canvas.draw({img: control.archives.current.getImg()});
	   	 	console.timeEnd(log);
		}
		else
			return newData;
	},
	linearPieceWise : function(_data, _draw, _){//points:[{i:0, o:0}] i = input pix, o = output pix
		var log = 'linearPieceWise[points:';
	    var data = _data,
			width = data.length,
			height = data[0].length,
			draw = (_draw === undefined) ? false : _draw,
			newData = [];
		//ADD POINTS
		var points = _.points;
		//CALCULATE LINEAR FUNCTIONS
		var slope = [], intercept = [];
		var lookUp = [];
		for (var i = 0; i < points.length-1; i++)
		{
			slope.push((points[i+1].o - points[i].o)/(points[i+1].i - points[i].i));
			intercept.push(points[i+1].o - slope.last() * points[i+1].i);
			for (var k = points[i].i; k < points[i+1].i; k++)
					lookUp.push(i)
			log += '{i: '+points[i].i+', o: '+points[i].o+'}, ';
		}
		lookUp.push(slope.length-1);
		log += '{i: '+points[i].i+', o: '+points[i].o+'}]';
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

		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)	
			{ 
				var rgb = data[x][y];
				newData[x][y] =  [	slope[lookUp[rgb[0]]]*rgb[0] + intercept[lookUp[rgb[0]]],
				  					slope[lookUp[rgb[1]]]*rgb[1] + intercept[lookUp[rgb[1]]],
				  					slope[lookUp[rgb[2]]]*rgb[2] + intercept[lookUp[rgb[2]]] ];
			}//for x
		}//for y
		if (draw)
		{
			canvas.draw({img: control.archives.current.getImg()});
	   	 	console.timeEnd(log);
		}
		else
			return newData;
	},
	histogramEqualization: function(_data, _draw){//SHIH 2010
	    var data = _data,
			width = data.length,
			height = data[0].length;
			draw = (_draw === undefined) ? false : _draw;

		var log = 'histogramEqualization';
		console.time(log);
		//HISTOGRAM COUNT
		var step = 20, pixN = 0, histogram = [new Array(256).fill(0), new Array(256).fill(0), new Array(256).fill(0)];
		for (y = 0; y < height; y+= step)
		{
			for (x = 0; x < width; x+= step)
			{ 
				var rgb = data[x][y];
				histogram[0][Math.round(rgb[0])]++;
				histogram[1][Math.round(rgb[1])]++;
				histogram[2][Math.round(rgb[2])]++;
				pixN++;
			}//for x
		}//for y
		//CUMULATIVE PROBABILITY
		var probHistogram = [new Array(256).fill(0), new Array(256).fill(0), new Array(256).fill(0)],
			sum = [0, 0, 0]
		for (var i = 0; i < 256; i++){
			sum[0] += histogram[0][i]; 
			probHistogram[0][i] = sum[0]/pixN;

			sum[1] += histogram[1][i]; 
			probHistogram[1][i] = sum[1]/pixN;

			sum[2] += histogram[2][i]; 
			probHistogram[2][i] = sum[2]/pixN;
		}
		for (y = 0; y < height; y++)
		{
			for (x = 0; x < width; x++)
			{ 
				var rgb = data[x][y];
				data[x][y][0] = Math.round(probHistogram[0][Math.round(rgb[0])]*255);
				data[x][y][1] = Math.round(probHistogram[0][Math.round(rgb[1])]*255);
				data[x][y][2] = Math.round(probHistogram[0][Math.round(rgb[2])]*255);

			}//for x
		}//for y
		if (draw){
			canvas.draw({img: control.archives.current.getImg()});
		}
	    console.timeEnd(log);
	}
}