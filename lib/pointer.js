pointer = function(_canvas){
	this.canvas = _canvas;
	this.ctx    = this.canvas.getContext("2d");

	this.position         = {x: 0, y: 0};
	this.dragPosition     = {x: 0, y: 0};
	this.wheelDelta = 0;
	this.isDown     = false;
	this.hasMoved   = false;
	this.cursor     = 'default';

	this.events = {
		onclick: function(){},
		onmove: function(){},
		onup: function(){}
	};

	this.init();
}

pointer.prototype.setCursor = function(_cursor){
	if (this.cursor != _cursor){
		this.cursor = _cursor;
	}
}

pointer.prototype.isIntersected = function(_cursor)function(area){
	return (Math.abs(this.position.x - area.position.x) < area.size.width && 
				Math.abs(this.position.y - area.position.y) < area.size.height);
}

pointer.prototype.resetDrag = function(){
	var dif = {x: this.dragPosition.x - this.position.x, y: this.dragPosition.y - this.position.y};
	this.dragPosition.x = this.position.x;
	this.dragPosition.y = this.position.y;
	return dif;
}

pointer.prototype.getDistance = function(point){
	var dx = point.x - this.position.x, dy = point.y - this.position.y;
	return Math.sqrt(dx*dx + dy*dy);
}


pointer.prototype.getAngle = function(point){
	return Math.atan2(this.position.y - point.y, this.position.x - point.x);
}


pointer.prototype.render = function(){
}


pointer.prototype.onDown = function (e) {
	if (!this.isDown) {
		this.isDown = true;
		this.dragPosition.x = this.position.x;
		this.dragPosition.y = this.position.y;
		this.events.onclick();
	} 
}

pointer.prototype.onMove = function(e) {
	if (e != undefined)
		this.position = { x: e.pageX - this.canvas.position.x,
						  y: e.pageY - this.canvas.position.y};
	this.hasMoved = (this.position.x != this.dragPosition.x || this.position.y != this.dragPosition.y);
	this.events.onmove();
}


pointer.prototype.onUp = function(e) {
	this.isDown = false;
	this.events.onup();
}

pointer.prototype.onCancel = function(e){
	this.isDown = false;
}

pointer.prototype.init = function(){
	var that = this;
	if ('ontouchstart' in window) {
		that.canvas.ontouchstart      = function(e) {that.onDown(e)};
		that.canvas.ontouchmove       = function(e) {that.onMove(e)};
		that.canvas.ontouchend        = function(e) {that.onUp(e)};
		that.canvas.ontouchcancel     = function(e) {that.onCancel(e)};
	}
	that.canvas.addEventListener('mousedown', function(e) {that.onDown(e)}, false);
	that.canvas.addEventListener('mousemove', function(e) {that.onMove(e)}, false);
	that.canvas.addEventListener('mouseup',   function(e) {that.onUp(e)}, false);
}