function ToolTip(id) {
	this.toolTipDiv = document.createElement('div');
	this.toolTipDiv.id = id || 'tool-tip';
	this.toolTipDiv.style.cssText = 'z-index:999; position: absolute; text-align: left; width: 250px; height: 250px; padding: 2px; font: 12px arial; background: lightsteelblue; border: 0px; border-radius: 8px; pointer-events: none; opacity: 0; td,th{ border: 1px solid #dddddd; text-algin: left; padding: 8px;} table {font-family: arial, sans-serif; border-collapse: collapse; width: 100%;} tr:nth-child(even) {background-color: #dddddd;}';
	this.toolTipDiv.style.transition = "opacity 0.5s";
	document.body.appendChild(this.toolTipDiv);

}

ToolTip.prototype._computeXY = function(x, y) {

	if (x + this.toolTipDiv.clientWidth > window.innerWidth)
		x = x - this.toolTipDiv.clientWidth;
	if (y + this.toolTipDiv.clientHeight > window.innerHeight)
		y = y - this.toolTipDiv.clientHeight;
	return {'x':x, 'y':y};
}

ToolTip.prototype.showText = function(x, y, text) {

	this.toolTipDiv.style.height = "150px";
	this.toolTipDiv.style.width = "200px";
	var pos = this._computeXY(x, y);
	this.toolTipDiv.style.opacity = .9;
	this.toolTipDiv.style.left = pos.x + "px";
	this.toolTipDiv.style.top = pos.y + "px";
	this.toolTipDiv.innerHTML = "<h4>" + text + "</h4>";

}

ToolTip.prototype.showNeuronInfo = function(x, y, neuronName, infodict) {

	var pos = this._computeXY(x, y);
	this.toolTipDiv.style.opacity = .9;
	this.toolTipDiv.style.left = pos.x + "px";
	this.toolTipDiv.style.top = pos.y + "px";
    
    var text = "<h4 style='text-align:center;color:red'>" + neuronName + "</h4>";
    var height = 40;
    text += "<table class='table-striped'> <tr><th>Attribute</th><th>Value</th></tr>";
    height += 15
    
    for (var key in infodict) {
        text += "<tr><td>" + key + "</td><td>" + infodict[key] + "</td></tr>";
        height += 15;
    }
    text += "</table>";
    this.toolTipDiv.style.height = height + "px";
	this.toolTipDiv.style.width = "220px";
    this.toolTipDiv.innerHTML = text;
}


ToolTip.prototype.showTextAndImg = function(x, y, text, img) {

	this.toolTipDiv.style.height = "250px";
	this.toolTipDiv.style.width = "250px";
	var pos = this._computeXY(x, y);
	this.toolTipDiv.style.opacity = .9;
	this.toolTipDiv.style.left = pos.x + "px";
	this.toolTipDiv.style.top = pos.y + "px";
	this.toolTipDiv.innerHTML = "<h3>" + text + "</h3><div><img width='246px' alt='Image Not Available' src='" + img + "'></div>";

}

ToolTip.prototype.hide = function() {

	this.toolTipDiv.style.opacity = 0.0;

}
