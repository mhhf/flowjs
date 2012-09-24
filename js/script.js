
var MOPS = {};


(function($){

    MOPS = {
        state:{// Der derzeitige Zustand in dem sich das System befindet
            time:null, // Zeit, die in diesem Zustand verracht wird
            dragging:null,//Das Segment was gerade getragen wird
            cOver:null, // Das Segment, über dem sich derzeit die Maus befindet. Null wenn leer
            selected:null, // Das derzeit ausgewählte segment
            addNewElement:false
        },
        settings:{
            buttonDicke:80,
            rootOffset:50,
            randDicke:2
        },
        colors:{
            darkGreen : "#1d8e04",
            lightGreen : "#bbddb3",
            strokeColor: "#888888"
        },
        init: function(){
            this.canvas = document.getElementById('canvas1');// get Context
            this.offset = $('#canvas1').offset();
            this.ctx = MOPS.canvas.getContext('2d');
            this.bgCtx = document.getElementById('canvas2').getContext('2d');
            this.bgCtx.shadowBlur    = 39;
            this.bgCtx.shadowColor   = "rgba(20, 20, 20, 0.5)";
            //setzt den momentanen Punkt auf die Mitte
            this.ctx.translate(MOPS.canvas.width/2,MOPS.canvas.height/2);
            this.bgCtx.translate(MOPS.canvas.width/2+4,MOPS.canvas.height/2);
            $('#newSegment').click(function(e){
                //                this.root.addChild("new",0.1,0.5); 
            }); 

            $('#segmentName').change(function(e){
                if(MOPS.state.selected != null){
                    MOPS.state.selected.name = e.target.value;
                    MOPS.drawDonut();
                }
            });

            $('#addBtn').mousedown(function(e){
                MOPS.state.dragging = new MOPS.Donut();
                MOPS.state.dragging.name = 'new Segment';
                MOPS.state.dragging.weight = 0.5;
                MOPS.state.dragging.health = 1;

                MOPS.draggingOnTop = true;
                MOPS.state.selected = false;
                MOPS.state.addNewElement = true;

            });
            //                      INTERACTION
            //
            //
            //
            $('#canvas1').mousemove( function(e){
                // Rechnet die Position aus um das Segment zu identifizieren
                // dazu wird der Winkel [0,1] und der Abstand in leveln abhängig von der dicke errechnet
                // todo: div positionen abziehen
                var x = e.pageX - MOPS.canvas.width/2;
                var y = MOPS.canvas.height/2-e.pageY;
                var h = Math.sqrt(x*x+y*y);
                var level = Math.floor((h-MOPS.settings.rootOffset)/MOPS.settings.buttonDicke);
                var tan = 0.25+Math.atan( x/y )/(Math.PI*2);
                if(y>=0){tan+=0.5;}

                var segment = MOPS.root.getSegmentByPos(tan,level,0,0);
                if(MOPS.state.cOver != segment){
                    MOPS.state.cOver = segment; 
                    MOPS.drawDonut();
                }

                if(MOPS.state.dragging != null)
                {
                    if(MOPS.state.dragging.active && MOPS.state.dragging != MOPS.state.cOver ){
                        MOPS.state.dragging.setActive(false);
                        MOPS.drawDonut();
                    }
                    MOPS.state.draggingOnTop=(h-MOPS.settings.rootOffset)/MOPS.settings.buttonDicke%1>0.3 || (h<MOPS.settings.rootOffset);
                    if(MOPS.state.cOver != null)
                    {
                        MOPS.drawDonut(); 
                    }
                }
            }); 

            $('#canvas1').mousedown(function(e){
                if( MOPS.state.cOver != null && MOPS.state.cOver != MOPS.root){
                    MOPS.state.selected = null;
                    MOPS.state.dragging = MOPS.state.cOver;
                    MOPS.state.time = new Date().getTime();
                    MOPS.drawDonut();
                }
            });

            $('canvas').mouseup(function(e){
                if( MOPS.state.dragging != null ){
                    var newTime = new Date().getTime()-MOPS.state.time;
                    if(MOPS.state.cOver == MOPS.state.dragging && newTime<250)
                    {
                        MOPS.state.selected = MOPS.state.cOver;
                        MOPS.refreshInformation();
                    } else if(
                        MOPS.state.cOver != null && 
                        MOPS.state.cOver != MOPS.state.dragging && 
                        MOPS.state.cOver.active &&
                        !MOPS.state.cOver.childOf(MOPS.state.dragging)
                    ){
                        if(MOPS.state.addNewElement)
                        {
                            MOPS.state.cOver.addNode(MOPS.state.dragging);
                            MOPS.state.addNewElement = false;
                        }else{
                            MOPS.root.restack(MOPS.state.dragging,MOPS.state.cOver);
                        }
                        //window.log(MOPS.state.cOver.children.length);
                        MOPS.root.inherentWeight();

                    }
                    // Aufräumen
                    MOPS.state.dragging.setActive(true);
                    MOPS.state.dragging = null;
                    MOPS.drawDonut();
                }
            });

            

            this.root = new MOPS.Donut(); 
            MOPS.getData();
            //this.root.inherentWeight();
        } ,

        drawDonut: function (){
            //Clear 
            MOPS.bgCtx.clearRect(-MOPS.canvas.width/2,-MOPS.canvas.height/2,MOPS.canvas.width,MOPS.canvas.height);
            MOPS.ctx.clearRect(-MOPS.canvas.width/2,-MOPS.canvas.height/2,MOPS.canvas.width,MOPS.canvas.height);
            //Draw all segments
            MOPS.drawInnerCircle();
            MOPS.drawSegment(0,0,1,MOPS.root) ;
            //if selected Draw selected Visual
            if(MOPS.state.selected != null) MOPS.drawSelectedVisual(MOPS.ctx);
            if( 
                MOPS.state.dragging != null && 
                MOPS.state.cOver != null && 
                MOPS.state.cOver.active &&
                MOPS.state.cOver != MOPS.state.dragging && 
                MOPS.state.draggingOnTop
            ) MOPS.drawDraggingVisual(MOPS.ctx);
        },

        drawInnerCircle:function(){
            MOPS.ctx.beginPath();
            MOPS.ctx.fillStyle = MOPS.colors.lightGreen;
            MOPS.ctx.arc(0,0,MOPS.settings.rootOffset,0,2*Math.PI,false);
            MOPS.ctx.closePath();
            MOPS.ctx.fill();
        },
        
        drawSegment:function(numLevel,offset,totalRadius,parentNode)
        {
            var current = offset;
            $.each(parentNode.children,function(i,item){
                var radius = parseFloat(item.weight)*totalRadius;
              

                if( !item.active ){
                    innerColor = "#d5d9d9";
                }else if( MOPS.state.cOver == item && MOPS.state.dragging == null ){
                    innerColor = "#cae4e6"; 
                }else{
                    innerColor = MOPS.colors.lightGreen;
                }


                item.offset = current;
                //item.totalImportance = radius;
                MOPS.drawCBtn(  MOPS.ctx,
                    item.offset,
                    item.totalImportance,
                    MOPS.settings.buttonDicke, 
                    MOPS.settings.rootOffset+numLevel*MOPS.settings.buttonDicke,
                    MOPS.settings.randDicke,
                    MOPS.colors.strokeColor,
                    innerColor,
                    numLevel > 0
                );


                // FONT
                // todo: Eeinstellungen aufräumen
                MOPS.ctx.fillStyle = '#000000';
                MOPS.ctx.textAlign = 'center';
                var rot= current* Math.PI*2+Math.PI*radius; 
                if(current*2+radius>=0.5 && current*2+radius<1.5){
                    MOPS.ctx.rotate(rot+Math.PI);
                    MOPS.ctx.fillText( item.name,- MOPS.settings.rootOffset-(numLevel+1)*MOPS.settings.buttonDicke+MOPS.settings.buttonDicke/2, 0);
                    MOPS.ctx.rotate(-rot-Math.PI);
                }else{
                    MOPS.ctx.rotate(current* Math.PI*2+Math.PI*radius );
                    MOPS.ctx.fillText(item.name, MOPS.settings.rootOffset+numLevel*MOPS.settings.buttonDicke+MOPS.settings.buttonDicke/2, +3);
                    MOPS.ctx.rotate(-current * Math.PI*2-Math.PI*radius);
                }

                if(item.children.length > 0){
                    MOPS.drawSegment(numLevel+1,current,radius,item);
                }
                current += radius; 
            });

        },
        drawSelectedVisual : function(ctx){
            var c=MOPS.state.selected; 
            var doffset = MOPS.settings.rootOffset+c.level*MOPS.settings.buttonDicke;
            var dicke = MOPS.settings.buttonDicke;  
            var rand = MOPS.settings.randDicke;
            var percent = c.totalImportance; 
            var roffset = c.offset;
            if(c.level>0) {
                makeRadiusSmaller=rand;
            }else{
                makeRadiusSmaller=0;
            }
           percent += roffset;
            ctx.beginPath(); 
            ctx.lineWidth=4;
            ctx.strokeStyle= "#5853a9";
            ctx.fillStyle = "#ff0000"; 
            ctx.arc ( 
                    0, 0, 
                    doffset+dicke-makeRadiusSmaller, 
                    Math.PI*2*roffset,
                    Math.PI*2*percent, 
                    false
                    );
            ctx.arc ( 
                    0, 0, 
                    doffset-makeRadiusSmaller, 
                    Math.PI*2*percent, 
                    Math.PI*2*roffset,
                    true
                    );

            ctx.closePath();

            ctx.stroke();
       



        }, 
        drawDraggingVisual: function(ctx){
            var c=MOPS.state.cOver; 
            var doffset = MOPS.settings.rootOffset+c.level*MOPS.settings.buttonDicke;
            var dicke = MOPS.settings.buttonDicke;  
            var rand = MOPS.settings.randDicke;
            var percent = c.totalImportance; 
            var roffset = c.offset;
            if(c.level>0) {
                makeRadiusSmaller=rand;
            }else{
                makeRadiusSmaller=0;
            }
            percent += roffset;
            ctx.beginPath(); 
            ctx.lineWidth=8;
            ctx.strokeStyle= "#5853a9";
            ctx.fillStyle = "#ff0000"; 
            ctx.arc ( 
                    0, 0, 
                    doffset+dicke-makeRadiusSmaller-3, 
                    Math.PI*2*roffset-(rand/2)/(doffset+dicke+(rand/2)-rand),
                    Math.PI*2*percent+(rand/2)/(doffset+dicke+(rand/2)-rand), 
                    false
                    );
            ctx.stroke();
            ctx.closePath();
        },
        drawCBtn : function (ctx, roffset, percent, dicke, doffset, rand, outerColor, innerColor ){

            var bg = MOPS.bgCtx; 

            percent += roffset;

            var w1 = Math.PI*2*roffset+(rand/2)/(doffset+dicke-(rand/2)-rand); 
            var w2 = Math.PI*2*percent-(rand/2)/(doffset+dicke-(rand/2)-rand);
            var w3 = Math.PI*2*percent-(rand/2)/(doffset+(rand/2)+rand);
            var w4 = Math.PI*2*roffset+(rand/2)/(doffset+(rand/2)+rand); 
            var oneR = 1/(doffset+dicke+(rand/2+1)-rand); 
            MOPS.drawSegmentGfx(
                ctx,
                outerColor,
                doffset+dicke, 
                doffset-1,
                w1-oneR*2, w2+oneR*2, w2+oneR, w1-oneR
            );
            MOPS.drawSegmentGfx(
                bg,
                "#aaaaaa",
                doffset+dicke+1, 
                doffset-1,
                w1-oneR*3,
                w2+oneR*3,
                w2+oneR*3,
                w1-oneR*3
            );

            MOPS.drawSegmentGfx(
                ctx,
                innerColor,
                doffset+dicke-rand/2,
                doffset+rand/2, 
                w1, w2, w3, w4
            ); 
        },
        drawSegmentGfx : function( ctx, color, r, d, w1, w2, w3, w4 ){
            ctx.beginPath();
            ctx.fillStyle =  color;
            ctx.arc ( 0, 0,r,w1,w2, false);
            ctx.arc ( 0, 0, d, w3, w4,true); 
            ctx.closePath();
            ctx.fill();
        },
        assignTriggers: function(){
        },
        
        getData: function(){
            $.getJSON(
                "modules/getJson.php",
                {
                    tags:"cat",
                    tagmode: "any",
                    format: "json"
                },
                function(data) 
                {
                    MOPS.json2donut(data,MOPS.root);
                    MOPS.root.weight = 1;
                    MOPS.root.totalImportance = 1;
                    MOPS.root.offset = 0;
                    MOPS.root.name = "root";
                    MOPS.root.inherentWeight();
                    MOPS.drawDonut();
                }
            );            
        },
        
        Donut:function(){
            this.name;
            this.weight;
            this.health;
            this.children = new Array();
            this.active = true;// zeigt an ob das segment sammt kinder interagiert werden kann
            this.level = -1;
            this.offset;
            this.totalImportance;
            
            this.addChild = function(name, weight, health){
                var child = new MOPS.Donut(); 
                child.name = name;
                child.weight = parseFloat(weight);
                child.health = parseFloat(health);
                child.level = this.level+1;
                this.children.push(child);
                return child;
            };

            this.addNode = function(node)
            {
                this.children.push(node);
                node.level = this.level+1;
            }

            this.restack= function(node,on){
                var succes = false;
                var kinder = this.children;
                $.each(this.children,function(i,child){
                    if(child == node)
                    {
                        kinder.splice(i,1);
                        on.addNode(child);
                        succes = true;
                    }
                    if(!succes && child.children.length >0)
                    {
                       succes = child.restack(node,on) ;
                    }
                });
                return succes;
            }

            this.childOf = function(node){
                return this.children.indexOf(node)!=-1;
            }
            
            this.getSegmentByPos = function(alpha,level,currentLevel,pOffset){
                var retSegment = null;
                if( level == -1 ){ 
                    retSegment=this; 
                }else{
                    var counter=pOffset;
                    $.each(this.children,function(i,item){
                        if(alpha<item.totalImportance+counter && alpha>counter)
                        {
                            if(currentLevel == level)
                            {
                                retSegment = item;
                            }else{
                                retSegment = item.getSegmentByPos(alpha,level,currentLevel+1,counter)
                            } 
                        }
                        counter+=item.totalImportance;
                    }); 
                }
                return retSegment;
            };

            this.inherentWeight = function()
            {
                var totalWeight=0;
                $.each(this.children,function(i,child){
                     totalWeight += child.weight;
                });
                var dasGewicht = this.totalImportance;
                $.each(this.children,function(i,child){
                     child.weight /= totalWeight;
                     child.totalImportance = child.weight*dasGewicht;
                     if(child.children.length >0) child.inherentWeight();
                });
            }

            this.setActive = function(b)
            {
                this.active = b;
                $.each(this.children,function(i,item){
                    this.active = b;
                    if(item.children.length > 0 ){
                        item.setActive(b);
                    }
                });
            };
        },
        refreshInformation:function(){
            $('#segmentName').val(MOPS.state.selected.name);
        },
        json2donut:function(data,parentNode){
            $.each(data.children,function(i,item){
                var node = parentNode.addChild( item.name, parseFloat(item.weight), parseFloat(item.health) ); 
                //totalWeight *= this.weight;
                if(item.children.length>0){
                    MOPS.json2donut(item,node);
                }
            });
        }
    };
    


})(jQuery);


$(document).ready(function () {
    //COCO.init(true, true);
    MOPS.init();
});
