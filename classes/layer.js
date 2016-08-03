layer = function(_){
	this.id = (_.id === undefined) ? null : _.id;
	this.caption = (_.caption === undefined) ? null : _.caption;
	this.data = (_.data === undefined) ? null : _.data;
}

layer.prototype.copy = function(){
}
