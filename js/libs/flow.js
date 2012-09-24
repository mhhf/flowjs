window.PART = function(x,y) {
  // Dynamics
  this.x=0;
  this.y=0;
  this.fx=0;
  this.fy=0;

  this.bx=0;
  this.by=0;
  this.bowl=null;

  // Propertys
  this.dist = 20.45;
  this.dv = 0;
  this.scale = 0.0069;
  this.border = 0;  
  this.verschleiss = 0.96;

  this.impactRadius = 25;

  // Relations
  this.connection= null;

  // Optimisation
  this.updated = true;
  this.active=true;
  this.inMap = true;

  this._init= function(x, y) {
    this.x = x;
    this.y = y;
    this.connection = new Array();
  };

  this.connect = function(p) {
    var con = new window.Connection(this,p);
    this.connection.push(con);
    p.connection.push(con);
  };

  this.getConnection = function(p) {
    var retVar = null;

    for (var i = 0; i < this.connection.length; i++) {
      if(this.connection[i].getOther(this) == p) {
        retVar = this.connection[i];
        break;
      }
    }
    return retVar;
  };

  this.updateActive = function(b) {
    this.updated = b;
  };
 
  this._init(x,y);
};

window.Connection = function(p1, p2) {
  this.p1=null;
  this.p2=null;
  this.impactRadius=600;

  this.dist = 50.45;
  this.dv = 0;
  this.scale = 0.0019;
  this.border = 100;  
  this.verschleiss = 0.96;

  this.active = true;

  this._init=function (p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  };

  this.getOther= function(p) {
    if(p == this.p1) {
      return this.p2;
    } else {
      return this.p1;
    }
  };

  this.getDistance = function(){
    return Math.sqrt(Math.pow(p1.x-p2.x,2)+Math.pow(p1.y-p2.y,2));
  };

  this._init(p1,p2);


};

window.GRID = function() {
  this.grid= null;
  this.size= -1;

  this.init= function(size) {
    this.size = size;
    this.grid = new Array(size);

    for (var i = 0; i < size; i++) {
      this.grid[i] = new Array(size);
      for (var j = 0; j < size; j++) {
        this.grid[i][j] = new Array();
      }
    }
  };

  this.getBowl= function(x, y) {
    return this.grid[x][y];
  };

  this.addToGrid= function(p, x, y) {
    p.bx = x;
    p.by = y;
    this.grid[x][y].push(p);
    p.bowl = this.grid[x][y];
  };

  this.indexOf= function(p, x, y) {
    return this.grid[x][y].indexOf(p);
  };

  this.inBowl= function(p, x, y) {
    return this.indexOf(p, x, y) != -1;
  };

  // O(n^3) !!
  this.inGrid= function(p) {
    for (var i = 0; i < this.size; i++) {
      for (var j = 0; j < this.size; j++) {
        if(this.inBowl(p,i,j)) { return true;}
      }
    }
    return false;
  };

  this.forEachBowl= function(f) {
    for (var i = 0; i < this.size; i++) {
      for (var j = 0; j < this.size; j++) {
        f(this.grid[j][i]);
      }
    }
  };
};


window.DynamicGRID = function() {
  this.settings={
    gridSize: 600,
    bowlSize: 30
  };

  this.particles = null;
  this.activeQue=null;

  this.particleGrid=null;

  this._init= function() {
    this.particles = new Array();
    var bowls = this.settings.gridSize/this.settings.bowlSize;
    this.activeQue = new buckets.LinkedList();
    this.particleGrid = new window.GRID();
    this.particleGrid.init(bowls);
  };

  this.addParticle = function(p) {
    // Push in the Array
    this.particles.push(p);
    this.activeQue.add(p);

    // Push in the bowls
    var bX = Math.floor(p.x/this.settings.bowlSize);
    var bY = Math.floor(p.y/this.settings.bowlSize);
    this.particleGrid.addToGrid(p, bX, bY);
  };

  this.updateGrid = function() {
    this.calculateF();
    this.applyF();
    return this.activeQue.size() !== 0;
  };

  this.calculateF = function(){
    var bX=0;
    var bY=0;
    var p;
    var b;
    var p2;
    var dx,dy;


    var self = this;
    // todo: first all connections -> then all particles
    // Each Particle
    this.activeQue.forEach(function(p){
      bX = p.bx;
      bY = p.by;
      if(p.inMap) {
        
        // Each surounding bowl
        for (var x = -1; x <= 1; x++) {
          if( bX+x>=0 && bX+x<self.particleGrid.size ){
            for (var y = -1; y <= 1; y++) {
              if( bY+y>=0 && bY+y<self.particleGrid.size ){
                b = self.particleGrid.getBowl(bX+x, bY+y);

                // Each Particle in the bowl
                for (var j = 0; j < b.length; j++) {
                  p2 = b[j];
                  
                  if(p != p2 && p2.updated){
                    dx = Math.abs(p.x-p2.x);
                    dy = Math.abs(p.y-p2.y);
                    maxImpectRadadius = Math.max(p.impactRadius, p2.impactRadius);
                    if(dx<maxImpectRadadius && dy<maxImpectRadadius){
                      distance = Math.sqrt(dx*dx+dy*dy);

                      if(distance<maxImpectRadadius) {
                        
                        // turn the particle on
                        if(!p2.active && p2.inMap) {
                          self.setActive(p2,true);
                        }
                        conn = p.getConnection(p2);
                        f = 0;
                        if(conn) {
                          if(distance<conn.impactRadius) {
                            f = self.force(
                                distance,
                                conn.dist,
                                conn.dv,
                                conn.scale,
                                conn.border,
                                true );
                          }// distance < conn.impactRadius
                        } else {
                          //todo: add function force
                          if (distance<p.impactRadius) {
                            f = self.force(
                                distance,
                                p.dist,
                                p.dv,
                                p.scale,
                                p.border,
                                false);
                          }
                          if(distance<p2.impactRadius){
                            f+= self.force(
                                distance,
                                p2.dist,
                                p2.dv,
                                p2.scale,
                                p2.border,
                                false );
                          }
                        }//conn

                        fdx = (p.x-p2.x)*f;
                        fdy = (p.y-p2.y)*f;

                        p.fx  += fdx;
                        p.fy  += fdy;
                        p2.fx -= fdx;
                        p2.fy -= fdy;
                      }//force impact on the particle
                    }
                  }
                }
              }
            }
          }
        } // Each surrounding Bowl

        // Alle Verbindungen, die noch nicht angeschaut wurden:
        for (var c = 0; c < p.connection.length; c++) {
          conn = p.connection[c];
          if(conn.active) {
            distance = conn.getDistance();
            if( distance <= conn.impactRadius){
              //todo: check conn.active
              conn.active = false;
              f = self.force(
                  distance,
                  conn.dist,
                  conn.dv,
                  conn.scale,
                  conn.border,
                  true );
              fdx = (conn.p1.x-conn.p2.x)*f;
              fdy = (conn.p1.y-conn.p2.y)*f;
              conn.p1.fx += fdx;
              conn.p1.fy += fdy;
              conn.p2.fx -= fdx;
              conn.p2.fy -= fdy;
              if(!conn.p1.active){self.setActive(conn.p1,true);}
              if(!conn.p2.active){self.setActive(conn.p2,true);}
            }
          }
        } // for each connection
        p.updateActive(false);
      }
      
    });
  };

  this.applyF = function(){
    var self = this;
    this.activeQue.forEach(function(p){
      p.updateActive(true);
      p.fx*=p.verschleiss;
      p.fy*=p.verschleiss;

      if(Math.abs(p.fx)<0.05 && Math.abs(p.fy)<0.05) {
        p.fx=0;
        p.fy=0;
        self.setActive(p,false);
      } else {
        p.x += p.fx;
        p.y += p.fy;
        // todo nbX,nbY
        nbX = Math.floor(p.x/self.particleGrid.size);
        nbY = Math.floor(p.y/self.particleGrid.size);

        if(nbX != p.bx || nbY != p.by) {
          p.bowl.splice(p.bowl.indexOf(p),1);

          if( nbX<0 ){nbX=0;}
          if( nbX>=self.particleGrid.size ) {
            nbX=self.particleGrid.size-1;
          }
          if( nbY<0 ){nbY=0;}
          if( nbY>=self.particleGrid.size ) {
            nbY=self.particleGrid.size-1;
          }
          
          self.particleGrid.addToGrid(p, nbX, nbY);
        }
      }
    });
  };

  this.force = function(dist, nullR, dv, scale, border, stable){
    var cVar = -(Math.pow(dist-nullR,3)*dv+(dist-nullR)*scale);
    if(!stable){
      if(cVar<0){cVar = 0;}
    }
    // if(cVar<border){cVar=border;}
      
    return cVar;
  };

  this.setActive = function(p, b) {
    if(b) {
      if (!p.onGrid) {
        this.activeQue.add(p);
      }
      p.active = true;
      p.onGrid = true;
    } else {
      this.activeQue.remove(p);
      p.onGrid = false;
      p.active = false;
    }
  };

  this._init();
};

window.log = function(t){console.log(t);};
