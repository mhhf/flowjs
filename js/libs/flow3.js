FLOW3={PART:function(a,b){this.x=a;this.y=b;this.connection=[]},Connection:function(a,b){this.p1=a;this.p2=b},GRID:function(){},DynamicGRID:function(){this.particles=[];var a=this.settings.gridSize/this.settings.bowlSize;this.activeQue=new buckets.LinkedList;this.particleGrid=new FLOW1.GRID;this.particleGrid.init(a)}};FLOW3.PART.prototype.x=0;FLOW3.PART.prototype.y=0;FLOW3.PART.prototype.fx=0;FLOW3.PART.prototype.fy=0;FLOW3.PART.prototype.bx=0;FLOW3.PART.prototype.by=0;FLOW3.PART.prototype.bowl=null;
FLOW3.PART.prototype.dist=20.45;FLOW3.PART.prototype.dv=0;FLOW3.PART.prototype.scale=0.0069;FLOW3.PART.prototype.border=0;FLOW3.PART.prototype.verschleiss=0.96;FLOW3.PART.prototype.impactRadius=25;FLOW3.PART.prototype.connection=null;FLOW3.PART.prototype.updated=!0;FLOW3.PART.prototype.active=!0;FLOW3.PART.prototype.inMap=!0;FLOW3.PART.prototype.connect=function(a){var b=new FLOW1.Connection(this,a);this.connection.push(b);a.connection.push(b)};
FLOW3.PART.prototype.getConnection=function(a){for(var b=null,c=0;c<this.connection.length;c++)if(this.connection[c].getOther(this)==a){b=this.connection[c];break}return b};FLOW3.PART.prototype.updateActive=function(a){this.updated=a};FLOW3.Connection.prototype.p1=null;FLOW3.Connection.prototype.p2=null;FLOW3.Connection.prototype.impactRadius=600;FLOW3.Connection.prototype.dist=50.45;FLOW3.Connection.prototype.dv=0;FLOW3.Connection.prototype.scale=0.0019;FLOW3.Connection.prototype.border=100;
FLOW3.Connection.prototype.verschleiss=0.96;FLOW3.Connection.prototype.active=!0;FLOW3.Connection.prototype.getOther=function(a){return a==this.p1?this.p2:this.p1};FLOW3.Connection.prototype.getDistance=function(){return Math.sqrt(Math.pow(p1.x-p2.x,2)+Math.pow(p1.y-p2.y,2))};FLOW3.GRID.prototype.grid=null;FLOW3.GRID.prototype.size=-1;FLOW3.GRID.prototype.init=function(a){this.size=a;this.grid=Array(a);for(var b=0;b<a;b++){this.grid[b]=Array(a);for(var c=0;c<a;c++)this.grid[b][c]=[]}};
FLOW3.GRID.prototype.getBowl=function(a,b){return this.grid[a][b]};FLOW3.GRID.prototype.addToGrid=function(a,b,c){a.bx=b;a.by=c;this.grid[b][c].push(a);a.bowl=this.grid[b][c]};FLOW3.GRID.prototype.indexOf=function(a,b,c){return this.grid[b][c].indexOf(a)};FLOW3.GRID.prototype.inBowl=function(a,b,c){return-1!=this.indexOf(a,b,c)};FLOW3.GRID.prototype.inGrid=function(a){for(var b=0;b<this.size;b++)for(var c=0;c<this.size;c++)if(this.inBowl(a,b,c))return!0;return!1};
FLOW3.GRID.prototype.forEachBowl=function(a){for(var b=0;b<this.size;b++)for(var c=0;c<this.size;c++)a(this.grid[c][b])};FLOW3.DynamicGRID.prototype.addParticle=function(a){this.particles.push(a);this.activeQue.add(a);this.particleGrid.addToGrid(a,Math.floor(a.x/this.settings.bowlSize),Math.floor(a.y/this.settings.bowlSize))};FLOW3.DynamicGRID.prototype.updateGrid=function(){this.calculateF();this.applyF();return 0!==this.activeQue.size()};
FLOW3.DynamicGRID.prototype.calculateF=function(){var a=0,b=0,c,d,j,i,g=this;this.activeQue.forEach(function(e){a=e.bx;b=e.by;if(e.inMap){for(var h=-1;1>=h;h++)if(0<=a+h&&a+h<g.particleGrid.size)for(var k=-1;1>=k;k++)if(0<=b+k&&b+k<g.particleGrid.size){c=g.particleGrid.getBowl(a+h,b+k);for(var l=0;l<c.length;l++)d=c[l],e!=d&&d.updated&&(j=Math.abs(e.x-d.x),i=Math.abs(e.y-d.y),maxImpectRadadius=Math.max(e.impactRadius,d.impactRadius),j<maxImpectRadadius&&i<maxImpectRadadius&&(distance=Math.sqrt(j*
j+i*i),distance<maxImpectRadadius&&(!d.active&&d.inMap&&g.setActive(d,!0),conn=e.getConnection(d),f=0,conn?distance<conn.impactRadius&&(f=g.force(distance,conn.dist,conn.dv,conn.scale,conn.border,!0)):(distance<e.impactRadius&&(f=g.force(distance,e.dist,e.dv,e.scale,e.border,!1)),distance<d.impactRadius&&(f+=g.force(distance,d.dist,d.dv,d.scale,d.border,!1))),fdx=(e.x-d.x)*f,fdy=(e.y-d.y)*f,e.fx+=fdx,e.fy+=fdy,d.fx-=fdx,d.fy-=fdy)))}for(h=0;h<e.connection.length;h++)conn=e.connection[h],conn.active&&
(distance=conn.getDistance(),distance<=conn.impactRadius&&(conn.active=!1,f=g.force(distance,conn.dist,conn.dv,conn.scale,conn.border,!0),fdx=(conn.p1.x-conn.p2.x)*f,fdy=(conn.p1.y-conn.p2.y)*f,conn.p1.fx+=fdx,conn.p1.fy+=fdy,conn.p2.fx-=fdx,conn.p2.fy-=fdy,conn.p1.active||g.setActive(conn.p1,!0),conn.p2.active||g.setActive(conn.p2,!0)));e.updateActive(!1)}})};
FLOW3.DynamicGRID.prototype.applyF=function(){var a=this;this.activeQue.forEach(function(b){b.updateActive(!0);b.fx*=b.verschleiss;b.fy*=b.verschleiss;if(0.05>Math.abs(b.fx)&&0.05>Math.abs(b.fy))b.fx=0,b.fy=0,a.setActive(b,!1);else if(b.x+=b.fx,b.y+=b.fy,nbX=Math.floor(b.x/a.particleGrid.size),nbY=Math.floor(b.y/a.particleGrid.size),nbX!=b.bx||nbY!=b.by)b.bowl.splice(b.bowl.indexOf(b),1),0>nbX&&(nbX=0),nbX>=a.particleGrid.size&&(nbX=a.particleGrid.size-1),0>nbY&&(nbY=0),nbY>=a.particleGrid.size&&
(nbY=a.particleGrid.size-1),a.particleGrid.addToGrid(b,nbX,nbY)})};FLOW3.DynamicGRID.prototype.force=function(a,b,c,d,j,i){a=-(Math.pow(a-b,3)*c+(a-b)*d);i||0>a&&(a=0);return a};FLOW3.DynamicGRID.prototype.setActive=function(a,b){b?(a.onGrid||this.activeQue.add(a),a.active=!0,a.onGrid=!0):(this.activeQue.remove(a),a.onGrid=!1,a.active=!1)};FLOW3.DynamicGRID.prototype.settings={gridSize:600,bowlSize:30};FLOW3.DynamicGRID.prototype.particles=null;FLOW3.DynamicGRID.prototype.activeQue=null;
FLOW3.DynamicGRID.prototype.particleGrid=null;