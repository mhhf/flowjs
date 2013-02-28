window.Router = Backbone.Router.extend({

		routes: {
				'': 'home'
		},

		initialize: function() {
			window.FLOW = FLOW5;
			window.PART = FLOW.PART;
			window.DynamicGRID = FLOW.DynamicGRID;
			window.Connection = FLOW.Connection;
			window.GRID = FLOW.GRID;

			this.model = new window.FlowModel();
			this.view = new window.FlowCanvas({
					el:$('#mainWrapper'),
					model: this.model
			});
		},

		home: function() {
			var p1 = new PART(100,100);
			var p2 = new PART(160,100);
			var p3 = new PART(130,120);
			var p4 = new PART(170,140);
			var p5 = new PART(135,60);
			// p1.removable = false;
			// p2.removable = false;
			// p3.removable = false;
			// p4.removable = false;
			// p4.removable = false;
			// p5.removable = false;
			p1.connect(p2);
			p1.connect(p3);
			p2.connect(p3);
			p4.connect(p3);
			p2.connect(p4);
			p2.connect(p5);
			p1.connect(p5);
			this.model.grid.addParticle(p1);
			this.model.grid.addParticle(p2);
			this.model.grid.addParticle(p3);
			this.model.grid.addParticle(p4);
			this.model.grid.addParticle(p5);
			// this.model.grid.addParticle(new PART(106,104));
			var self= this;
			this.lastRendering = true;
			this.interval = setInterval(function(){self.loop();},30);
			this.loopRunning = true;
		},

		loop: function() {
			var p = this.model.get('selected');;
			if(p!=null) {
				p.fx += (this.model.mX-p.x)*0.04;
				p.fy += (this.model.mY-p.y)*0.04;
			}

			if(this.model.grid.updateGrid()){
				this.view.render();
			} else if( this.lastRendering ){
				this.lastRendering = false;
				this.view.render();
				// this.interval = clearInterval(this.interval);
				this.loopRunning = false;
			}
		},

		onchange: function(e){
			log("asd");	
		}

});

