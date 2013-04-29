window.FlowCanvas = Backbone.View.extend({

	events: {
		'mousemove' : 'onMM',
		'mousedown' : 'onMD',
		'mouseup'  : 'onMU' 
	},

	initialize: function () {
		_.bindAll(this,'render'); 
		this.model.bind('change',this.render);
		
		this.canvasBback = $('#canvasBack')[0];
		this.width = this.canvasBback.width;
		this.canvasB = this.canvasBback.getContext('2d');
	},

	render: function () {
		var p;
		var ctx = this.canvasB;
		var x,y;
		// Store the current transformation matrix
		ctx.save();

		// Use the identity matrix while clearing the canvas
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.width, this.width);

		// Restore the transform
		ctx.restore();

		for (var i = 0; i < this.model.grid.particles.length; i++) {
			ctx.fillStyle = "#000000";
			p = this.model.grid.particles[i];
			if(p.active) ctx.fillStyle = "#550000";
			ctx.beginPath();
			ctx.arc(p.x,p.y,10,0,2*Math.PI);
			ctx.closePath();
			ctx.fill();
			for (var j = 0; j < p.connection.length; j++) {
				ctx.moveTo(p.x,p.y);
				p2 = p.connection[j].getOther(p);
				ctx.lineTo(p2.x,p2.y);
				ctx.stroke();
				// p.connection[j].active = true;
			}
		}
	},

	onMM: function(e){
		this.model.mX = e.offsetX;
		this.model.mY = e.offsetY;
		this.model.trigger('updatedGrid');
	},

	onMD: function(e) {
		var s = this.model.grid.getParticleByPos(e.offsetX, e.offsetY);
		if(s != null){
			this.model.set('selected', s);
			s.removable = false;
			if(!s.active) {
				this.model.grid.setActive(s,true);
			}
		}
	},

	onMU: function(e) {
		var s = this.model.get('selected');
		if(s!=null) {
			s.removable = true;
			this.model.set('selected',null);
		}
	}


});

