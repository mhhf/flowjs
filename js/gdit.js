(function ($) {
    "use strickt";
    
    window.Router = Backbone.Router.extend({
        routes: {
            '': 'home'
        },
        settings: {
            buttonDicke:70,
            rootOffset:50,
            randDicke:2
        },
        initialize: function() {

            this.model = new window.GDit();
            this.view = new window.View({
                el:$('#mainWrapper'),
                model: this.model
            });

            this.inspector = new window.Inspector({
                el:$('#interactionWrapper'),
                model: this.model
            });
        },

        home: function () {
        }
    });


    window.deb = function (text) {
        if(window.debug) {
            console.log(text);
        } 
    }

    window.debug = true;




}(jQuery));
