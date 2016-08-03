archive = function(_){
	var that = this;
	this.id = (_.id === undefined) ? null : _.id;
	this.img = (_.img === undefined) ? null : _.img;
	this.layers = {
		current: null,
		items: [],
		size: 0,
		add: function(_){
			this.items.push(new layer({data: _.data, caption: _.caption}));
			this.size++;
			this.current = this.items.last();
			return this.items.last();
		}
	};//vector of objects from class img.js
}

archive.prototype.getImg = function()
{
	this.img.data.fill(0);//empty data
	for (var i = this.layers.items.length-1; i>=0 ;i--)
	{
		for (y = 0; y < this.img.height; y++)
		{
			for (x = 0; x < this.img.width; x++)
			{
				var index = (x + y * this.img.width) * 4;
				var data = this.layers.items[i].data;
				if (data[y][x][0] != 256 && data[y][x][1] != 256 && data[y][x][0] != 256)//256,256,256 = TRANSPARENT
				{
					this.img.data[index+0] = data[y][x][0];
					this.img.data[index+1] = data[y][x][1];
					this.img.data[index+2] = data[y][x][2];
					this.img.data[index+3] = 255;		
				}
			}
		}
		this.layers.items[i].data
	}
	return this.img;
}