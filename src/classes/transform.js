var transform = {
	resize: function(_data, _draw, _){
		var data = _data,
			width = data.length,
			height = data[0].length
		if (_.width !== undefined)
		{
			var newWidth = Math.round(_.width); 
			var newHeight = Math.round(newWidth*height/width);
		}
		else
		{
			var newHeight = Math.round(_.height); 
			var newWidth = Math.round(newHeight*width/height);
		}
		var size = {x: Math.round(width/newWidth), y: Math.round(height/newHeight)};
		size.x = (size.x % 2 == 0) ? size.x+1 : size.x;
		size.y = (size.y % 2 == 0) ? size.y+1 : size.y;
		var
			maskSize = {x: (size.x-1)/2, y: (size.y-1)/2},
			draw = (_draw === undefined) ? false : _draw,
			newData = [];

		var log = 'resize';
		console.time(log);
		for (y = 0; y < height; y+= size.y)
		{	
			for (x = 0; x < width; x+= size.x)
			{ 
				if (y == 0) newData[x/size.x] = [];
				var newColor = [0, 0, 0], pixN = 0;
				for (var i = -maskSize.x; i <= maskSize.x; i++) 
				{
					for (var j = -maskSize.y; j <= maskSize.y; j++) 
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
				newData[x/size.x][y/size.y] = [Math.round(newColor[0]/pixN), Math.round(newColor[1]/pixN), Math.round(newColor[2]/pixN)];
			}//for x
		}//for y
		console.timeEnd(log);
		if (draw){
			copyData(newData, data);
			canvas.draw({img: control.archives.current.getImg()});
		}
		else
			return newData;
	}
}