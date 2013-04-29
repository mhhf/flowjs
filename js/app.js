window.Router = Backbone.Router.extend({

	routes: {
		'': 'home'
	},

	initialize: function() {
		this.model = new window.FlowModel();
		this.view = new window.FlowCanvas({
			el:$('#mainWrapper'),
			model: this.model
		});
	},

	home: function() {

		// Create particles on the Grid
		var p1 = new FLOW.PART(100,100);
		var p2 = new FLOW.PART(160,100);
		var p3 = new FLOW.PART(130,120);
		var p4 = new FLOW.PART(170,140);
		var p5 = new FLOW.PART(135,60);

		// force the particles to stay in the update Que
		// p1.removable = false;
		// p2.removable = false;
		// p3.removable = false;
		// p4.removable = false;
		// p5.removable = false;

		// connect the Particles
		p1.connect(p2);
		p1.connect(p3);
		p2.connect(p3);
		p4.connect(p3);
		p2.connect(p4);
		p2.connect(p5);
		p1.connect(p5);

		// add the Particles to a the Grid
		this.model.grid.addParticle(p1);
		this.model.grid.addParticle(p2);
		this.model.grid.addParticle(p3);
		this.model.grid.addParticle(p4);
		this.model.grid.addParticle(p5);


		// Settings
		// lastRendering indicates if the scene is rendered, after the particles have stop changing
		this.lastRendering = true;

		// Switch on the update loop
		this.toggleIntervall(true);

		// Bind the mouse event to the update loop
		this.model.bind('updatedGrid', function( e ){
			this.toggleIntervall(true);
		}, this);

	},

	// Switch the update loop based on the current running state
	toggleIntervall: function( updateFlag ){
		if( updateFlag != this.loopRunning ){
			if( this.loopRunning ) {
				this.interval = clearInterval(this.interval);
				this.loopRunning = false;
			} else {
				var that = this;
				this.interval = setInterval(function(){that.loop();},30);
				this.loopRunning = true;
			}
		}
	}, 

	// main update Loop
	loop: function() {

		// Pull the selected particle to the mouse
		var p = this.model.get('selected');;
		if(p!=null) {
			p.fx += (this.model.mX-p.x)*0.04;
			p.fy += (this.model.mY-p.y)*0.04;
		}

		// Update grid physic and render the grid
		if(this.model.grid.updateGrid()){
			this.view.render();
		} else {
			if( this.lastRendering ){
				this.view.render();
			}
			this.toggleIntervall(false);
		}
	},

});

