function newFile(_path)
{
	var newArchive = control.archives.add();
	canvas.loadImg(_path, 
			function(_){
				newArchive.img = _.data;

				var newLayer = newArchive.layers.add({data: _.data.getMatrix(), caption: 'Original'});
				control.changeArchive({id: newArchive.id});
				afterLoad();
			}
		);
	var node = document.createElement("span");
	var elem = document.getElementById('tab_container').appendChild(node);
	elem.id = 'window_'+newArchive.id;
	elem.innerHTML = '<strong class="light"><span onclick="control.changeArchive({id:'+ (newArchive.id) +'})">'+ 
						_path +'</span> <a onclick="control.closeArchive({id:'+ (newArchive.id) +'})">x</a></strong>';
}

/*
STABLE FUNCTIONS
adjustaments.invert([data, draw])
*/
/*
FUNCTION SCOPE
SCOPE = function(_){
    var data = _.data,
		height = data.length,
		width = data[0].length;
		draw = (_.draw === undefined) ? false : true;

	var log = 'LOREM';
	console.time(log);
	for (y = 0; y < height; y++)
	{
		for (x = 0; x < width; x++)
		{ 
		}//for x
	}//for y
	if (draw){
		canvas.draw({img: control.archives.current.getImg()});
	}
    console.timeEnd(log);
}
*/
function erode(_){//color
    var data = _.data,
		height = data.length,
		width = data[0].length;
		draw = (_.draw === undefined) ? false : true,
		color = _.color;
		newData = [],
		mask = _.mask,
		maskSize = [Math.floor(mask.length/2), Math.floor(mask[0].length/2)];

	function isPix(pix){
		return (pix[0] == color[0] && pix[1] == color[1] && pix[2] == color[2]);
	}

	function validPos(_x, _y){
		return (_x >= 0 && _x < width && _y >= 0 && _y < height);
	}

	var log = 'Erode';
	console.time(log);
	for (y = 0; y < height; y++)
	{
		if (newData[y] === undefined) newData[y] = [];
		for (x = 0; x < width; x++)
		{ 
			if (!isPix(data[y][x])){
				//check if the pix isEdge
				var isEdge = false;
				for (var i = 0; i < 9; i++)//4 neighbors
				{
				 	var yn =  Math.floor(i/3)-1,
				 		xn =  -1 + i -(yn+1)*3;
				 		yn += y;
				 		xn += x;
					if (validPos(xn, yn) && isPix(data[yn][xn]))//if neighbor is diferent, it is edge
					{
						isEdge = true;
						//newData[y][x] =[255,0,0];
						break;
					}
				}
				//apply mask
				if (isEdge)
					for (var yn = -maskSize[0]; yn <= maskSize[0]; yn++)
						for (var xn = -maskSize[1]; xn <= maskSize[1]; xn++)
						{
							if (mask[maskSize[0] + yn][maskSize[1] + xn] == 1 && validPos(x+xn, y+yn) && isPix(data[y+yn][x+xn]))
							{
								if (newData[y+yn] === undefined) newData[y+yn] = [];
								newData[y+yn][x+xn] = [data[y][x][0], data[y][x][1], data[y][x][2]];
							}
						}
			}
			if (newData[y][x] === undefined)
			{
				newData[y][x] = data[y][x];
			}
		}//for x
	}//for y
	copyData(newData, data);
	if (draw){
		canvas.draw({img: control.archives.current.getImg()});
	}
    console.timeEnd(log);
}

function gaussianBlur(_){
    var data = _.data,
		height = data.length,
		width = data[0].length;
		draw = (_.draw === undefined) ? false : true,
		newData = [],
		sigma = (_.sigma === undefined) ? 1 : _.sigma,
		maskSize = (_.size === undefined) ? 1 : Math.floor(_.size/2),
		mask = gausianMask(2, maskSize*2+1);

	function validPos(_x, _y){
		return (_x >= 0 && _x < width && _y >= 0 && _y < height);
	}

	var log = 'Gaussian Blur[Sigma:'+sigma+'; Size:'+maskSize+']';
	console.time(log);
	for (y = 0; y < height; y++)
	{
		newData[y] = [];
		for (x = 0; x < width; x++)
		{ 
			var newColor = [0, 0, 0];
			for (var i = -maskSize; i <= maskSize; i++) 
			{
				for (var j = -maskSize; j <= maskSize; j++) 
				{
					var iM = i + maskSize,
						jM = j + maskSize;
					if (validPos(x+j, y+i))
					{
						newColor[0] += data[y+i][x+j][0] * mask[iM][jM];
						newColor[1] += data[y+i][x+j][1] * mask[iM][jM];
						newColor[2] += data[y+i][x+j][2] * mask[iM][jM];
					}
				}
			}
			newData[y][x] = [newColor[0], newColor[1], newColor[2]];
		}//for x
	}//for y
	copyData(newData, data);
	if (draw){
		canvas.draw({img: control.archives.current.getImg()});
	}
    console.timeEnd(log);
}

function regionSelect(_){
    var data = _.data,
		height = data.length,
		width = data[0].length;
		draw = (_.draw === undefined) ? false : true;

	var regions = [],
		neighbors = [],
		labeledData = new Array(height),
		regionIndex = 1;

	function validPos(_x, _y){
		return (_x >= 0 && _x < width && _y >= 0 && _y < height);
	}

	var log = 'regionSelect[';
	console.time(log);
	for (y = 0; y < height; y++) labeledData[y] = new Array(width).fill(-1);
	for (y = 0; y < height; y++)
	{
		for (x = 0; x < width; x++)
		{ 
			if (labeledData[y][x] == -1){
				regions.push({data: [], edge: []});

				neighbors.push({x: x, y: y});
				labeledData[y][x] = regionIndex;
				while (neighbors.length > 0){
					var isEdge = false;
					for (var i = 1; i < 9; i+=2)//PARA
					{
					 	var yn = Math.floor(i/3)-1,
					 		xn = -1 + i -(yn+1)*3;
							yn += neighbors[0].y;
							xn += neighbors[0].x;
						if (validPos(xn, yn))
							if (data[neighbors[0].y][neighbors[0].x][0] != data[yn][xn][0])
								isEdge = true;
							else if (labeledData[yn][xn] == -1){	
								neighbors.push({x: xn, y: yn});	
								labeledData[yn][xn] = regionIndex;						
							}
					}//for neighbor
					if (isEdge) 
					{
						regions.last().edge.push({x: neighbors[0].x, y: neighbors[0].y});
					}	
					else
					{
						regions.last().data.push({x: neighbors[0].x, y: neighbors[0].y});
					}
					neighbors.shift();		
				}//while
				regionIndex++;
			}
		}//for x
	}//for y
	for (var i = 0; i < regions.length; i++){
		{
			var color = randomColor(),
				ecolor = randomColor();
			if (regions[i].data.length > 3000 || regions[i].data.length<200) {
				color = ecolor = [256,256,256];
			}
			for (var e = 0; e < regions[i].data.length; e++){	
				data[regions[i].data[e].y][regions[i].data[e].x] = [color[0],color[1],color[2]];	
			}
			for (var e = 0; e < regions[i].edge.length; e++){
				data[regions[i].edge[e].y][regions[i].edge[e].x] = [ecolor[0],ecolor[1],ecolor[2]];
			}
		}

	}
	if (draw){
		canvas.draw({img: control.archives.current.getImg()});
	}
    console.timeEnd(log);
}

function waterShed(_){
    var data = _.data,
		height = data.length,
		width = data[0].length;
		draw = (_.draw === undefined) ? false : true;

	var regions = [],
		neighbors = [],
		labeledData = new Array(height),
		TwaterShed = new Array(height),
		regionIndex = 1;

	function validPos(_x, _y){
		return (_x >= 0 && _x < width && _y >= 0 && _y < height);
	}

	var log = 'waterShed[';
	console.time(log);
	for (y = 0; y < height; y++) labeledData[y] = new Array(width).fill(-1);
	for (y = 0; y < height; y++) TwaterShed[y] = new Array(width).fill(-1);
	//GET EDGES
	for (y = 0; y < height; y++)
	{
		for (x = 0; x < width; x++)
		{ 
			if (data[y][x][0] != 0 && labeledData[y][x] == -1)
			{
				regions.push({points: [], area: 0});

				neighbors.push({x: x, y: y});
				labeledData[y][x] = 0;
				while (neighbors.length > 0){
					var isEdge = false;
					for (var i = 1; i < 9; i+=2)//PARA
					{
					 	var yn = Math.floor(i/3)-1,
					 		xn = -1 + i -(yn+1)*3;
							yn += neighbors[0].y;
							xn += neighbors[0].x;
						if (validPos(xn, yn))
							if (data[neighbors[0].y][neighbors[0].x][0] != data[yn][xn][0])
								isEdge = true;
							else if (labeledData[yn][xn] == -1){	
								neighbors.push({x: xn, y: yn});	
								labeledData[yn][xn] = 0;						
							}
					}//for neighbor
					if (isEdge) 
						regions.last().points.push({y: neighbors[0].y, x: neighbors[0].x});
					TwaterShed[neighbors[0].y][neighbors[0].x] = 0;
					regions.last().area++;
					neighbors.shift();		
				}//while
			}
		}//for x
	}//for y
	//CALCULATE TRANSFORM	
	for (var r = 0; r < regions.length; r++)
	if (regions[r].area>150)
	{
		var points = regions[r].points;
		var region = regions[r];
		var buffPoints = [];
		for (var i = 0; i < points.length; i++)
			TwaterShed[points[i].y][points[i].x] = 1;
		while (points.length>0){
			for (var i = 0; i < 9; i+=1)//NEIGHBORS
			{
			 	var yn = Math.floor(i/3)-1,
			 		xn = -1 + i -(yn+1)*3,
			 		d  = (i % 2 == 0) ? Math.sqrt(2) : 1,
			 		value = TwaterShed[points[0].y][points[0].x]+d;
					yn += points[0].y;
					xn += points[0].x;
				if (validPos(xn, yn))
					if (TwaterShed[yn][xn] == 0){	
						points.push({x: xn, y: yn});	
						TwaterShed[yn][xn] = value;					
					} 
					else if (value < TwaterShed[yn][xn])
					{	
						TwaterShed[yn][xn] = value;	
					}
			}//for neighbor
			buffPoints.push({x: points[0].x, y: points[0].y})
			points.shift();
		}
		//normalize region by localMin
		var localMin = 0;
		for (var i = 0; i < buffPoints.length; i++)
			if (localMin < TwaterShed[buffPoints[i].y][buffPoints[i].x]) localMin = TwaterShed[buffPoints[i].y][buffPoints[i].x];
		for (var i = 0; i < buffPoints.length; i++){
			TwaterShed[buffPoints[i].y][buffPoints[i].x] /= localMin;
		}
	}
	//APLLY TRANSFORM	
	for (y = 0; y < height; y++)
	{
		for (x = 0; x < width; x++)
		{
			if (TwaterShed[y][x]<=0)
			{
				data[y][x] = [256,256,256];  
			}
			else
			{
				var color = Math.floor(255*TwaterShed[y][x]);
				data[y][x] = [color, color, color];  
			}
		}
	}
	if (draw){
		canvas.draw({img: control.archives.current.getImg()});
	}
    console.timeEnd(log);
}

function countRegions(_){//data
    var data = _.data,
		height = data.length,
		width = data[0].length;
		draw = (_.draw === undefined) ? false : true,
		regions =[];
 
	var	neighbors = [],
		labeledData = new Array(height);

	function validPos(_x, _y){
		return (_x >= 0 && _x < width && _y >= 0 && _y < height);
	}

	var log = 'countRegions';
	console.time(log);
	for (y = 0; y < height; y++) labeledData[y] = new Array(width).fill(-1);
	for (y = 0; y < height; y++)
	{
		for (x = 0; x < width; x++)
		{ 
			if (data[y][x][0] == 255 && labeledData[y][x] == -1){
				regions.push({minX: width, maxX: 0, minY: height, maxY: 0});
				neighbors.push({x: x, y: y});
				labeledData[y][x] = 1;
				while (neighbors.length > 0){
					if (neighbors[0].x < regions.last().minX) regions.last().minX = neighbors[0].x;
					if (neighbors[0].x > regions.last().maxX) regions.last().maxX = neighbors[0].x;
					if (neighbors[0].y < regions.last().minY) regions.last().minY = neighbors[0].y;
					if (neighbors[0].y > regions.last().maxY) regions.last().maxY = neighbors[0].y;
					var isEdge = false;
					for (var i = 0; i < 9; i+=1)//PARA
					{
					 	var yn = Math.floor(i/3)-1,
					 		xn = -1 + i -(yn+1)*3;
							yn += neighbors[0].y;
							xn += neighbors[0].x;
						if (validPos(xn, yn))
							if (data[yn][xn][0] == 255 && labeledData[yn][xn] == -1){	
								neighbors.push({x: xn, y: yn});	
								labeledData[yn][xn] = 1;						
							}
					}//for neighbor
					neighbors.shift();		
				}//while					y: regions.last().minY+(regions.last().maxY - regions.last().minY)};
			}
		}//for x
	}//for y
	var ctx = canvas.ctx;
	for (var i = 0; i < regions.length; i++){
		var width = regions[i].maxX-regions[i].minX,
			height = regions[i].maxY-regions[i].minY,
			cx = regions[i].minX+width/2,
			cy = regions[i].minY+height/2;

		ctx.font = '20px Sans-Serif';
		ctx.textBaseline = 'top';
		ctx.fillStyle = 'red';
		ctx.fillText(i+1, cx-7, cy-7);
	}
    console.timeEnd(log);
}

function afterLoad()
{
	var log = 'countCells';
	console.time(log);
	var data = control.getLayer().data;
	gaussianBlur({data: data, size: 3, sigma: 1.4});
	adjustaments.adaptativeThreshold({data: data, threshold: 0});	
	waterShed({data: data});
	adjustaments.threshold({data: data});
	countRegions({data: data})
    console.timeEnd(log);
}

function attempt(){
	newFile('data/example/cells.png');  
}