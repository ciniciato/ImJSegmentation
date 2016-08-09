//RGBtoHSV
//HSVtoRGB
//Array.last
//Array.removeDuplicates
//randomColor
//loadTemplate
//euclideanDistance
//simplifyPoints
//sortPoly
function degToRad(_deg){
	return Math.PI*_deg/180;
}
const 	CROSSNEIGHBORS = [	{x: 1, y: 0, d: 1, theta: degToRad(0)},//right|east 
							{x: 0, y:-1, d: 1, theta: degToRad(90)},//top|north
							{x: 0, y: 1, d: 1, theta: degToRad(180)},//left|west
							{x:-1, y: 0, d: 1, theta: degToRad(270)}],//bottom|south

	 	SQUARENEIGHBORS = [	{x: 1, y: 0, d: 1,            theta: degToRad(0)},//right|east = 0 degree
							{x: 1, y: 1, d: Math.sqrt(2), theta: degToRad(45)},//nort-east = 45 degree
							{x: 0, y:-1, d: 1,            theta: degToRad(90)},//top|north = 90 degree
							{x:-1, y: 1, d: Math.sqrt(2), theta: degToRad(135)},//north-west = 135 degree
							{x: 0, y: 1, d: 1,            theta: degToRad(180)},//left|west
							{x:-1, y:-1, d: Math.sqrt(2), theta: degToRad(225)},//south-west
							{x:-1, y: 0, d: 1,            theta: degToRad(270)},//bottom|south
							{x: 1, y:-1, d: Math.sqrt(2), theta: degToRad(315)}];//south-east


//CONVERT RGB(Red, Green, Blue) COLOR TO HSV(Hue, Saturation, Value)
function RGBtoHSV(_rgb, _normalize){//Travis method
	var normalize = (_normalize === undefined) ? false : _normalize;
	_rgb = [_rgb[0]/255, _rgb[1]/255, _rgb[2]/255];//normalize
	var min = 255, max = 0, delta;
	var HSV = [0, 0, 0];

	for (var i = 0; i < _rgb.length; i++){
		max = (max < _rgb[i]) ? _rgb[i] : max;
		min = (min > _rgb[i]) ? _rgb[i] : min;
	}

	HSV[2] = max;
	delta = max - min;
	if (delta != 0){
		HSV[1] = delta / max;
		if (_rgb[0] == max)
			HSV[0] = (_rgb[1] - _rgb[2]) / delta
		else if (_rgb[1] == max)
			HSV[0] = 2 + (_rgb[2] - _rgb[0]) / delta
		else
			HSV[0] = 4 + (_rgb[0] - _rgb[1]) / delta;
		HSV[0] *= 60;
		if( HSV[0] < 0 )
			HSV[0] += 360;
	}else{
		HSV[1] = 0;
		HSV[0] = 361;	
	} 
	if (normalize)
		HSV = [Math.round(HSV[0])/360, Math.round(HSV[1]*100), Math.round(HSV[2]*100)]
	else
		HSV = [Math.round(HSV[0]), Math.round(HSV[1]*100), Math.round(HSV[2]*100)];
	return HSV;
}
//CONVERT HSV(Hue, Saturation, Value) COLOR TO RGB(Red, Green, Blue)
function HSVtoRGB(_hsv){//Travis method
	var hex = _hsv[0]/60,
		S   = _hsv[1] / 100; 
	 	V   = _hsv[2] / 100; 
	var primaryColor   = Math.floor(hex),
		secondaryColor = hex - primaryColor,
		a = (1 - S)*V,
		b = (1 - (S * secondaryColor) )*V,
		c = (1 - (S * (1 - secondaryColor) ) )*V;


	var RGB = [];
	if (primaryColor == 0){
		RGB[0] = V;
		RGB[1] = c;
		RGB[2] = a;
	}else if (primaryColor == 1){
		RGB[0] = b;
		RGB[1] = V;
		RGB[2] = a;
	}else if (primaryColor == 2){
		RGB[0] = a;
		RGB[1] = V;
		RGB[2] = c;
	}else if (primaryColor == 3){
		RGB[0] = a;
		RGB[1] = b;
		RGB[2] = V;
	}else if (primaryColor == 4){
		RGB[0] = c;
		RGB[1] = a;
		RGB[2] = V;
	}else{
		RGB[0] = V;
		RGB[1] = a;
		RGB[2] = b;
	}

	return [Math.round(RGB[0]*255), Math.round(RGB[1]*255), Math.round(RGB[2]*255)];
}

//YCbCr
//Y[16,235] Cb,Cr[16,240]
function RGBtoYCC(_rgb, _normalize){
	normalize = (_normalize !== undefined) ? _normalize : false;
	var r = _rgb[0]/255, g = _rgb[1]/255, b = _rgb[2]/255;
	var Y  = Math.round(r*65.481+g*128.553+b*24.966);
		Cb = Math.round(r*(-39.797)+g*(-70.203)+b*112);
		Cr = Math.round(r*112+g*(-93.786)+b*(-18.214));
	if (normalize)
		return [100*Y/219, 100*(Cb+112)/224, 100*(Cr+112)/224];
	else
		return [Y+16, Cb+128, Cr+128];
}

//RETURN LAST ELEMENT IN ARRAY
Array.prototype.last = function(pos){
    var ind = (pos == undefined) ? 1 : (1 + Math.abs(pos));
    return this[this.length - ind];
}; 

//REMOVE DUPLICATES ELEMENTS IN ARRAY
Array.prototype.removeDuplicates = function (){
  var temp = new Array();
  label : for (i = 0; i < this.length; i++){
            for (var j = 0; j < temp.length; j++){
              if (temp[j].x == this[i].x && temp[j].y == this[i].y)
                continue label;      
            }
            temp[temp.length] = this[i];
          }
  return temp;
}

//CALCULATE MEAN, VARIANCE, STANDARD DEVIATION IN A NUMERIC ARRAY
Array.prototype.stats = function(){
	var stats = this.reduce((a, x) => {
		a.N++;
		var delta = x - a.mean;
		a.mean += delta/a.N;
		a.M2 += delta*(x - a.mean);
		return a;
	}, { N: 0, mean: 0, M2: 0 });
	if(stats.N > 2) {
		stats.variance = stats.M2 / (stats.N - 1);
		stats.stdev = Math.sqrt(stats.variance);
	}
	return stats;
}

Array.prototype.sum = function(){
	var sum = 0;
	for (var i = 0; i < this.length; i++){
		if (this[i].length !== undefined){
			sum += this[i].sum();
		} else
			sum = Math.round((sum+this[i])*10000)/10000;
	}
	return Math.round(sum*10000)/10000;
}


ImageData.prototype.set = function(_data){
	var data   = _data,
		width  = data.length,
		height = data[0].length;
	for (y = 0; y < height; y++)
	{
		for (x = 0; x < width; x++)
		{
			var index = (x + y * width) * 4;
			if (data[x][y][0] != 256 && data[x][y][1] != 256 && data[x][y][0] != 256)
			{
				this.data[index] = data[x][y][0];
				this.data[index+1] = data[x][y][1];
				this.data[index+2] = data[x][y][2];
				this.data[index+3] = 255;
			} else
			{
				this.data[index+3] = 0;				
			}
		}
	}
				
	return this;
}; 

//transform vector data to matrix
ImageData.prototype.getMatrix = function()
{
	var matrix = [];
	for (var c = 0; c < this.width; c++)//for column
	{
		matrix[c] = [];
		for (var r = 0; r < this.height; r++)//for row
		{
			var index = (c + r * this.width) * 4;
			matrix[c][r] = [ this.data[index], this.data[index+1], this.data[index+2] ];//rgb colors
		}
	}
	return matrix;
}

//RETURN A RANDOMCOLOR BETWEEN 0-255
randomColor = function(){
	return [Math.round(Math.random()*255), Math.round(Math.random()*255), Math.round(Math.random()*255)];
}

//TRANSFORM IMAGE INTO MASK MATRIX
loadTemplate = function(_path, _callback){//transform image into binary matrix
	var img = [];
	canvas.loadBuffer(_path,
		function(_){
			img = _.data;
			var template = [];
			for (var y = 0; y < _.data.height; y++){
				template[y] = [];
				for (var x = 0; x < _.data.width; x++){
					var ind = (x + y * _.data.width) * 4;
					template[y][x] = (_.data.data[ind] < 128) ? 0 : 1;
				}
			}
			_callback(template);
		});
}

//CALCULATE EUCLIDEAN DISTANCE
euclideanDistance = function(_pointA, _pointB){
	var d = [];
	 d[0] = Math.pow(_pointA.x - _pointB.x, 2);
	 d[1] = Math.pow(_pointA.y - _pointB.y, 2);
	return Math.sqrt(d.reduce( (a, x) => a += x ));
}

//TRANFORM NEAR POINTS IN ONE
simplifyPoints = function(_points, _threshold){
	for (var i = 0; i < _points.length; i++){
		_points[i].x = Math.round(_points[i].x/_threshold)*_threshold;
		_points[i].y = Math.round(_points[i].y/_threshold)*_threshold;
	}
	return _points.removeDuplicates();
}

//SORT POINTS IN ARRAY BY PROXIMITY
sortPoly = function(_points){
	var sortedPoints = [];
	_points = simplifyPoints(_points, 1);

	sortedPoints.push(_points[0]);
	_points.shift();
	while (_points.length > 0){
		var min = 1000000, id = -1;
		for (var i = 0; i < _points.length; i++){//loop other points in poly
			var d = euclideanDistance(sortedPoints.last(), _points[i]);
			if (d < min){
				id = i;
				min = d;	
			}	 
		}
		if (min<=15)
		sortedPoints.push(_points[id]);
		_points.splice(id, 1);
	}//while
	var d = euclideanDistance(sortedPoints.last(), sortedPoints[0]);
	return sortedPoints
}

//
numAr = function(_item){
	if (_item === undefined) 
		return 0
	else
		_item;
}

copyData = function(_src, _tgt)
{
	var isNew  =  (_tgt === undefined);
	var newData = (_tgt !== undefined) ? _tgt : [];
	var width = _src.length,
		height  = _src[0].length;
	for (x = 0; x < width; x++)
	{
		if (isNew) newData[x] = [];
		for (y = 0; y < height; y++)
		{
			newData[x][y] = [_src[x][y][0], _src[x][y][1], _src[x][y][2]];
		}
	}
	return newData;
}

gausianMask = function(_sigma, _size)
{
	var sigma = _sigma,
	 	size = _size;
    var mask = [];
    var E = 2.718;//Euler's number rounded of to 3 places
    for (var y = -(size - 1)/2, i = 0; i < size; y++, i++) {
      mask[i] = [];
      for (var x = -(size - 1)/2, j = 0; j < size; x++, j++) {
        //create kernel round to 3 decimal places
        mask[i][j] = 1/(2 * Math.PI * Math.pow(sigma, 2)) * Math.pow(E, -(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2))/(2 * Math.pow(sigma, 2)));
      }
    }
    //normalize the kernel to make its sum 1
    var normalize = 1/mask.sum();
    for (var k = 0; k < mask.length; k++) {
      for (var l = 0; l < mask[k].length; l++) {
        mask[k][l] = Math.round(normalize * mask[k][l] * 1000)/1000;
      }
    }
    return mask;
};

//Laplace of Gaussian
LoGMask = function(_sigma, _size)
{
	var sigma = _sigma,
	 	size = _size;
    var mask = [];
    for (var x = -(size - 1)/2, j = 0; j < size; x++, j++)
    {
    	mask[j] = [];
       	for (var y = -(size - 1)/2, i = 0; i < size; y++, i++)
		{
			var term1 = -1/(Math.PI * Math.pow(sigma, 4) );
			var term2 = -(y*y + x*x)/(2*sigma*sigma);
			var term3 = Math.exp(term2);
			mask[j][i] = 30*Math.round((term1 * ( 1 + term2 ) * term3)*10000)/10000;
		}
    }
    var dif = mask.sum();
    var center = (size-1)/2;
    mask[center][center] -= dif; 
    return mask;
};