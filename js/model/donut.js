window.Donut = Backbone.Model.extend({
        defaults: {
            root: null,
            buttons: null,
            active: true,
            level: -1,
            offset:0,
            totalImportance:1
        },

        initialize: function () {
            this.set('buttons', new Buttons());
        },

        init: function (data) {
            this.set('root',new DButton({}, data, null, this))
            this.get('root').inherentWeight(1); 
            this.get('root').inherentStyle(-1,0);
        },
       
        // return the Button under the mouse
        getButton: function( dx ,dy ) {
            
            var h = Math.sqrt(dx*dx+dy*dy);
            var level = Math.floor((h-window.App.settings.rootOffset)/window.App.settings.buttonDicke);
            var tan = 0.25+Math.atan( dx/dy )/(Math.PI*2);
            if(dy>=0){tan+=0.5;}

            return this.getSegmentByPos(tan,level,0,0);
        },

        getSegmentByPos: function(alpha,level,currentLevel,pOffset) {
            if(level == -1) {return this.get('root');}
            return this.get('root').getSegmentByPos(alpha,level,currentLevel,pOffset);
        },

        restack: function(node,on) {
            this.get('root').restack(node,on);
        }
});

    
window.DButton = Backbone.Model.extend({
    
    defaults: {
        parent: null,
        children: [],

        id:null,
        parentId:null,

        name:"none",
        weight:null,
        health:1,
        active:true,

        level:-1,
        offset:null,
        totalImportance:null,

        active:true
    },

    initialize: function (data, button, parent, donut) {
        this.set('parent',parent);
        this.set('name',button.name);
        this.set('health',button.health);
        this.set('weight',button.weight);

        this.set('id',button.id);
        this.set('parentId',button.parentId);
        this.set('children',[])

        // Adding button to collection
        if(parent != null) donut.get('buttons').add(this);


        if( button.children.length != 0 ) {
            _.each(button.children, function(but){
                this.get('children').push(new window.DButton( {} ,but, this, donut));
            },this);
        }
    },

    addChild: function (button) {
        this.attributes.children.push(button);
    },

    setActive: function(b)
    {
        this.set('active', b);

        // _.each(this.get('children').models, function(button) {
        //     button.set('active', b);
        //     if(button.get('children').length > 0 ){
        //         button.setActive(b);
        //     }
        // });
        
        _.each(this.get('children'), function(button){
            button.set('active', b);
            if(button.get('children').length > 0 ){
                button.setActive(b);
            }
        });
    },

    childOf: function( button ) {
        return      this.get('children').length > 0 
                &&  this.get('children').indexOf(button)!=-1;
    },

    refreshInformation: function () {
            
    },

    inherentStyle: function(dasLevel, dasOffset) {
        this.set('level',dasLevel);
        this.set('offset',dasOffset)

        if(this.get('children').length > 0) {
            _.each(this.get('children'), function(but){
                but.inherentStyle(dasLevel+1, dasOffset);
                dasOffset+=but.get('totalImportance');
            },this);
        }
    },

    inherentWeight: function (dasGewicht) {
        
        this.set('totalImportance',dasGewicht) ;

        // Sum the Weight of All Children
        var totalWeight=0;
        _.each(this.get('children'), function(button) {
            if(parseFloat(button.get('weight'))<0.05) {
                button.set('weight',0.05)
            }
            totalWeight += parseFloat(button.get('weight'));
        });
        
        // Normalize the weight of all children
        _.each(this.get('children'), function(button) {
            button.set('weight', parseFloat(button.get('weight'))/totalWeight ) ;
            button.inherentWeight(parseFloat(button.get('weight')) * dasGewicht);
        });
    },

    getSegmentByPos: function(alpha,level,currentLevel,pOffset) {
        var retSegment = null;
        if( level == -1 ){ 
            retSegment = this; 
        } else {
            var counter=pOffset;
            _.each( this.get('children'), function(button) {
                if( alpha < parseFloat( button.get('totalImportance') ) + counter && alpha>counter)
                {
                    if(currentLevel == level)
                    {
                        retSegment = button;
                    }else if(button.get('children').length >0){
                        retSegment = button.getSegmentByPos(alpha, level, currentLevel+1, counter)
                    } 
                }
                counter+=parseFloat(button.get('totalImportance'));
            }); 
        }
        return retSegment;
    },

    // todo: redefine restack - _.each is unnecessary
    //
    restack: function(node, on) {
        var succes = false;
        var that = this;
        
        var index = node.get('parent').get('children').indexOf(node);
        node.get('parent').get('children').splice(index,1);
        node.set('parent',on);
        on.get('children').push(node);


        // _.each(this.get('childen'), function(button) {
        //     
        //     if(button == node)
        //     {
        //         that.get('children').splice(that.get('children').indexOf(button), 1);
        //         on.get('children').push(button);
        //         succes = true;
        //     }
        //     
        //     if(!succes && button.get('children').length > 0)
        //     {
        //         succes = button.get('children').restack( node, on ) ;
        //     }
        //     
        // });
        // 
        return succes;
    }
    
});

window.Buttons = Backbone.Collection.extend({
    model: DButton,
    url: ""
    
});


