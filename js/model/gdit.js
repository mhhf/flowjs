   window.GDit = Backbone.Model.extend({
        defaults: {
            donut: null,
            dragging: null,
            cOver: null,
            selected: null,
            taskStack: []
        },

        

        initialize: function () {
            this.set('donut', new window.Donut());
            this.loadData();
        },

        session: {
            sid:''
        },

        login: function (user, pass) {
            //todo: ajax request an den Server mit logindaten
            //      sid = rückgabewert
            //      erfolg: laden die Benutzerdaten
        },
        
        loadData: function(){

            $.getJSON(
                "modules/getJson.php",
                {
                    tags:"cat",
                    tagmode: "any",
                    format: "json"
                },
                function (data) {
                    window.App.model.initFromData(data);
                }
            );            
        },

        initFromData: function (data) {
            this.attributes.donut.init(data);
            this.trigger('change');
        },

        addNewButton: function(data,success) {
            
        },

        addTask: function(data){
            this.get('taskStack').push(data);
        },

        syncronize: function() {
            
            var nextTask;
            var ts = this.get('taskStack');
            while(ts.length > 0) {
                nextTask = ts.pop();
                
                switch(nextTask.action) {
                    case 'addNewBtn':
                        $.ajax({
                            type    : 'POST',
                            url     : 'modules/dbInterface.php',
                            data    : nextTask.data,
                            success : nextTask.success
                        });
                    break;
                }
            }
        }

    });

