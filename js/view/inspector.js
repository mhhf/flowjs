
window.Inspector = Backbone.View.extend({

    events: {
        'change #segmentName' : 'onNameChange',
        'click #newBtn' : 'onNewButton',
        'click #removeBtn' : 'onRemoveButton',
        'click #sync' : 'onSync'
    },

    initialize: function () {

        _.bindAll(this,'render');
        this.model.bind('selected',this.render);

        this.template = _.template( $("#inspectorTemplate").html(), {} ); 
        $(this.el).html(this.template);
        var that = this;
        $( "#slider" ).slider({
            slide: function(){that.onSliderChange()},
            range: "min",
            step: 0.01,
            min:2,
            max:98
        });

    },

    render: function () {
        var selected = this.model.get('selected');

        if(selected != null){
            $('#segmentName').val(selected.get('name'));

            var stat = 'enable';
            if(selected.get('weight')==1){
                stat = 'disable';
            }

            $('#slider').slider({
                value:parseFloat(selected.get('weight'))*100
            }).slider(stat);
        }
        return this;
    },

    onNameChange: function (e) {
        if(this.model.get('selected') != null) {
            this.model.get('selected').set('name',e.target.value);
            this.model.trigger('change');
        }
    },

    onSliderChange: function (e) {      
        if(this.model.get('selected') != null) {
            this.model.get('selected').set('weight',parseFloat($('#slider').slider('value'))/100);
            this.model.get('donut').get('children').inherentWeight(1);
            this.model.trigger('change');
        }
    },

    onNewButton: function(e) {
        var hlted = this.model.get('selected');

        if( hlted != null ) {
            var newButton = new window.DButton({
                name: 'new Button',
                health: 1,
                weight: 0.5,
                children: []
            },
                hlted
            );

            hlted.addChild(newButton);
            hlted.get('children').inherentWeight(hlted.get('totalImportance'));
            this.model.trigger('change');


            this.model.addTask({
                action: 'addNewBtn',
                data: {
                    parentId:hlted.get('id'),
                    weight:newButton.get('weight')
                },
                success: function (data) {
                    newButton.set('id',data);
                }
            });
        }
    },

    onRemoveButton: function(e) {
        
        var hlted = this.model.get('selected');
        var id = hlted.get('id');


        if( hlted != null ) {
            hlted.get('parent').get('children').remove(hlted);
        }
        this.model.attributes.selected = null; 
        hlted.get('parent').get('children').inherentWeight(hlted.get('parent').get('totalImportance'));

        this.model.trigger('change');


        this.model.addTask({
            action: 'removeButton',
            data: {
                id:id
            }
        });
    },

    onSync: function() {
        this.model.syncronize();
    }
});

