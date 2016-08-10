var transform = {
	resize: function(_data, _draw, _){
		var data = _data,
			width = data.length,
			height = data[0].length
		if (_.width !== undefined)
		{
			var newWidth  = Math.round(_.width); 
			var newHeight = Math.round(newWidth*height/width);
		}
		else
		{
			var newHeight = Math.round(_.height); 
			var newWidth  = Math.round(newHeight*width/height);
		}
		var size = {x:width/newWidth, y: height/newHeight},
			draw = (_draw === undefined) ? false : _draw,
			newData = new Array(newWidth);		
		for (var x = 0; x < newWidth; x++) newData[x] = new Array(newHeight);	
		if (draw){
			var log = 'resize';
			console.time(log);			
		}	
		for (var yN = 0; yN < newHeight; yN++)
		{	
			for (var xN = 0; xN < newWidth; xN++)
			{ 
				var x = Math.floor(xN*size.x),
				 	y = Math.floor(yN*size.y);
				newData[xN][yN] =  data[x][y];
			}//for x
		}//for y
		if (draw){			
			console.timeEnd(log);
			copyData(newData, data);
			canvas.draw({img: control.archives.current.getImg()});
		}
		else
			return newData;
	}
}