window.FlowModel = Backbone.Model.extend({
    grid:null,
    initialize: function () {

      this.grid = new window.DynamicGRID();
    }
});
