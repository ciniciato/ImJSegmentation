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
function SCOPE(_data, _draw, _){
    var data = _data,
		width = data.length,
		height = data[0].length,
		draw = (_draw === undefined) ? false : _draw;

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



function afterLoad()
{
	var data = control.getLayer().data;
	//transform.resize(data, true, { width: 300 });
	//linearPieceWise(data, true, { points: [{i: 50, o: 0}, {i: 200, o: 255}] });
	//histogramEqualization(data, true);
	//meanBlur(data, true, { size: 9});
	//pixelate(data, true, { size: 5});
	//gaussianBlur(data, true, {size: 9});
	//medianFilter(data, true, {size: 3});
	//lowFilter(data, true, {size: 25});
	//LoGFilter(data, true, {size: 9, sigma: 1.4});
	//laplacianEdge(data, true);
	//sobelEdge(data, true);
	//regionsGrowYCC(data, true, { threshold: 15, simbolicColor: true });
	//regionsGrowRGB(data, true, { threshold: 55, simbolicColor: true });
	
	//adjustaments.adaptativeThreshold(data, true);	
	//regionsGrowHSV(data, true, { threshold: 15, simbolicColor: true });
	//adjustaments.threshold(data, true);
	//adjustaments.invert(data);
	//distanceTransform(data, true);
	//filters.sobelEdge(data, true);
	//modal.open('pixelateFilter');
}

function attempt(){
	newFile('img/embryo.jpg');
}