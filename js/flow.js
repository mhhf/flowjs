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
      var p1 = new PART(100,100);
      var p2 = new PART(160,100);
      var p3 = new PART(130,120);
      var p4 = new PART(170,140);
      p1.connect(p2);
      p1.connect(p3);
      p2.connect(p3);
      p4.connect(p3);
      p2.connect(p4);
      this.model.grid.addParticle(p1);
      this.model.grid.addParticle(p2);
      this.model.grid.addParticle(p3);
      this.model.grid.addParticle(p4);
      // this.model.grid.addParticle(new PART(106,104));
      var self= this;
      this.lastRendering = true;
      setInterval(function(){self.loop();},30);
    },

    loop: function() {
      if(this.model.grid.updateGrid()){
        this.view.render();
      } else if( this.lastRendering ){
        this.lastRendering = false;
        this.view.render();
      }
    }

});

