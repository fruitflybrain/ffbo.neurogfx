/*
 * Utils
 */

function style(element, styles) {
	for (var s in styles) {
		element.style[s] = styles[s];
	}
}

/*
function WaveViewer(divID, data, func) {

    console.log(data);
    this.colors = data['color'];
    this.data = data['data'];
    this.num = 3+Object.keys(this.data).length;
    var xdomain = data['xdomain'];
    var ydomain = data['ydomain'];
    var colormap;
    if (this.colors === undefined ) {
    colormap = d3.scale.quantize()
      .domain([0, this.num])
      .range(colorbrewer.Reds[this.num]);
    }
    var margin = {
      top: 40,
      right: 40,
      bottom: 50,
      left: 60
    }
    var boxRect = d3.select("#" + divID).node().getBoundingClientRect()
    var width = boxRect.width - margin.left - margin.right;
    var height = boxRect.height - margin.top - margin.bottom;
    d3.select("#" + divID).html("");
    var svgContainer = d3.select("#" + divID)
        .append("div")
        .style('display', 'inline-block')
        .style('position', 'relative')
        .style('width', '100%')
        .style('padding-bottom', '100%')
        .style('vertical-align', 'top')
        .style('overflow', 'hidden')
    var svg = svgContainer.append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", '0, 0, ' + boxRect.width + ', ' + boxRect.height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var x = d3.scale.linear()
      .range([0, width]).domain([0, xdomain]);

    var y = d3.scale.linear()
      .range([height, 0]).domain([0, ydomain]);

    var xAxis = d3.svg.axis() //.Bottom(x)
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis() //Left(y)
      .scale(y)
      .orient("left");

    var line = d3.svg.line()
      .x(function(d) {
        return x(d[0]);
      })
      .y(function(d) {
        return y(d[1]);
      });

    var band = svg.append("rect")
      .attr("width", 50)
      .attr("height", 50)
      .attr("x", 0)
      .attr("y", 0)
      .attr("class", "band");

    band.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr('fill','white')
      .text("test")
    svg.append("g")
      .attr("class", "x axis")
      .style("fill","none")
      .style("stroke","#fff")
      .call(xAxis)
      .attr("transform", "translate(-0.1," + height + ")");


    svg.append("g")
      .attr("class", "y axis")
      .style("fill","none")
      .style("stroke","#fff")
      .call(yAxis)

    svg.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    var dot = null;
    var lines = {};
    var glance = {};

    id = 0
    for (idx in this.data) {
      var c;
      if (this.colors === undefined || this.colors[idx] === undefined)
          c = colormap(id);
      else
          c = this.colors[idx];
      lines[idx] =
        svg.append("path")
          .datum(this.data[idx])
          .attr("class", "line line" + idx)
          .attr("clip-path", "url(#clip)")
          .style("stroke", c)
          .style("fill", "none")
          .attr("d", line)
      id++;
    }
    function play(index) {
        if (dot === null) {
            dot = svg.append("circle")
              .style("fill", "red")
              .attr("r", 2)
              .attr("cx", 0)
              .attr("cy", 0);
        }

        for (idx in this.data) {
          var i = index
          if (i >= this.data[idx].length )
              i = this.data[idx].length-1;
          glance[idx] = this.data[idx][i][1];
          lines[idx]
            .datum(this.data[idx].slice(0,i+1)) // set the new data
            .attr("d", line) // apply the new data values ... but the new value is hidden at this point off the right of the canvas
            .transition() // start a transition to bring the new value into view
            .ease("linear")
            .duration(1) // for this demo we want a continual slide so set this to the same as the setInterval amount below
        }
        if (func != undefined) {
            func(glance);
        }
        //dot.attr('transform', 'translate(' + x(this.data[0][index][0]) + ',' + y(this.data[0][index][1]) + ')');
    }
    function stop() {
        if (dot != null) {
            dot.remove();
            dot = null;
        }
        for (idx in this.data)
          lines[idx].datum(this.data[idx]).attr("d", line);
    }
    this.play = play.bind(this);
    this.stop = stop.bind(this);
    function resize() {
        var boxRect = d3.select("#" + divID).node().getBoundingClientRect()
        var width = boxRect.width - margin.left - margin.right;
        var height = boxRect.height - margin.top - margin.bottom;

        x.range([0, width]);
        y.range([height, 0]);

        svg.select('.x.axis')
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        svg.select('.y.axis')
          .call(yAxis);

        for (idx in lines)
          lines[idx].attr("d", line);
    }
    d3.select(window).on('resize', resize);
    $("#nk-panel").on('resize', resize);
}
*/

function range(start, stop, step){
  var a=[start], b=start;
  while(b<stop){b+=step;a.push(b)}
  return a;
};
function NKPanel(div_id, ffboMesh3d) {
	this.dispatcher = {'play':[],'stop':[]}
	this.container = document.getElementById( div_id );
	this.rect = this.container.getBoundingClientRect();
	this._createCtrlPanel();
	this._createInputPanel();
	this._createOutputPanel();
	this.inputChart = null;
	this.outputChart = null;
	this._createPlayBar();

	this.nkJSON = {
		'input-conifg':'',
		'output-conifg':'',
		'duration':'0.01',
		'dt': '0.0001',
		'result':{}
	};

	for (var i = 0; i<4; i++) {
		this.nkJSON['result'][i] = range(0,0.01,0.001);
	}

}

NKPanel.prototype.updateDuration = function(duration) {

	this.nkJSON['duration'] = duration;
}

NKPanel.prototype.updateDt = function(dt) {

	this.nkJSON['dt'] = dt;
}

NKPanel.prototype.updateCircuit = function(comp_list) {

	this.nkJSON['circuit'] = comp_list;
}

NKPanel.prototype._createCtrlPanel = function() {

	this.ctrlPanel = document.createElement("div");
	this.ctrlPanel.id = "nk-panel-ctrl";
	this.container.appendChild(this.ctrlPanel);
	style(this.ctrlPanel,{
		position: 'relative',
		'margin-top': "1px",
		height: '30px'
	})
	var btnNKPlay = document.createElement('button');
	btnNKPlay.id = 'btn-play-sim';
	btnNKPlay.className = 'btn btn-xs btn-success unclicked';
	btnNKPlay.innerHTML = "Play Result";
	btnNKPlay.style.visibility = "hidden";
	this.ctrlPanel.appendChild(btnNKPlay);
	btnNKPlay.addEventListener('click', (function() {
		if (btnNKPlay.classList.contains('unclicked')) {
			btnNKPlay.classList.remove('unclicked');
			btnNKPlay.classList.add('clicked');
			btnNKPlay.innerHTML = "Close Result";
			this.playBar.style.visibility = "visible";
		} else {
			btnNKPlay.classList.remove('clicked');
			btnNKPlay.classList.add('unclicked');
			btnNKPlay.innerHTML = "Play Result";
			this.playBar.style.visibility = "hidden";
		}
	}).bind(this));
}

NKPanel.prototype._createInputPanel = function() {

	this.inputPanel = document.createElement("div");
	this.inputPanel.id = "nk-panel-input";
	this.container.appendChild(this.inputPanel);
	style(this.inputPanel,{
		width: "100%",
		height: document.body.clientHeight*0.4 + "px",
		position: 'relative',
		'border-bottom': "solid 0.5px #1c1c1c",
	})
}

NKPanel.prototype.updateInput = function(data) {
	this.inputPanel.innerHTRML = "";
	this.inputChart = new WaveViewer(this.inputPanel.id, data);
}

NKPanel.prototype.updateDispatcher = function() {
	this.dispatcher.play = [];
	if (this.inputChart.play != undefined) this.dispatcher.play.push(this.inputChart.play);
	if (this.outputChart.play != undefined) this.dispatcher.play.push(this.outputChart.play);
	this.dispatcher.stop = [];
	if (this.inputChart.stop != undefined) this.dispatcher.stop.push(this.inputChart.stop);
	if (this.outputChart.stop != undefined) this.dispatcher.stop.push(this.outputChart.stop);
}

NKPanel.prototype._createOutputPanel = function() {

	this.outputPanel = document.createElement("div");
	this.outputPanel.id = "nk-panel-output";
	this.container.appendChild(this.outputPanel);
	style(this.outputPanel,{
		width: "100%",
		height: document.body.clientHeight*0.4 + "px",
		position: 'relative',
	})
}

NKPanel.prototype.updateOutput = function(data, func) {
	this.outputPanel.innerHTRML = "";
	this.outputChart = new WaveViewer(this.outputPanel.id, data);
	this.outputChart.dispatch.play_hook =  func;
	this.updatePlayBar(data["xdomain"], data["dt"]);
	this.updateDispatcher();
}

NKPanel.prototype._createPlayBar = function() {

	this.playBar = document.createElement("div");
	this.playBar.id = "nk-panel-playbar";
	document.body.appendChild(this.playBar);
	style(this.playBar,{
		position: 'fixed',
		width: '100%',
		height: '50px',
		'z-index': 9999,
		bottom: '0px',
		background: '#5e5e5e',
		visibility: 'hidden'
	})
	this.playBarCtrl = d3.select(this.playBar)
		.append('div')
		.call(
			chroniton(this.dispatcher)
				.width(document.body.clientWidth)
				.domain([0, 0, 1])
				.playButton(true)
				.stopButton(true));
}

NKPanel.prototype.showPlayBar = function() {
	this.playBar.style.visibility = "visible";
}
NKPanel.prototype.hidePlayBar = function() {
	this.playBar.style.visibility = "hidden";
}
NKPanel.prototype.updatePlayBar = function(duration, dt) {
    console.log(duration, dt)
	this.playBarCtrl.remove();
	this.playBarCtrl = d3.select(this.playBar)
		.append('div')
		.call(
			chroniton(this.dispatcher)
				.width(document.body.clientWidth)
				.domain([0, duration, dt])
				.playButton(true)
				.stopButton(true));

}
NKPanel.prototype.drawInput = function() {

	
}
