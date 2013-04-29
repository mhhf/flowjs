window.FlowModel = Backbone.Model.extend({
    grid:null,
		state:{
			hover:null,
			selected:null
		},
    initialize: function () {

      this.grid = new FLOW.DynamicGRID();
    }
});
