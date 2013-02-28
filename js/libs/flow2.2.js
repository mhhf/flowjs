FLOW5 = {
	PART : function(x,y) {
		this.x = x;
		this.y = y;
		this.connection = new Array();
	},
	Connection : function(p1, p2) {
		this.p1 = p1;
		this.p2 = p2;
	},

	GRID : function() {
	},


DynamicGRID : function() {
	this.particles = new Array();
	var bowls = this.settings.gridSize/this.settings.bowlSize;
	this.activeQue = new buckets.LinkedList();
	this.particleGrid = new FLOW5.GRID();
	this.particleGrid.init(bowls);
}
};

FLOW5.PART.prototype.x = 0;
FLOW5.PART.prototype.y = 0;

FLOW5.PART.prototype.fx = 0;
FLOW5.PART.prototype.fy = 0;

FLOW5.PART.prototype.bx = 0;
FLOW5.PART.prototype.by = 0;


// Dynamics
FLOW5.PART.prototype.bowl=null;

// Propertys
FLOW5.PART.prototype.dist = 20.45;
FLOW5.PART.prototype.dv = 0;
FLOW5.PART.prototype.scale = 0.0069;


FLOW5.PART.prototype.border = 0;	
FLOW5.PART.prototype.finalFriction = 0.92;
FLOW5.PART.prototype.friction = 0.92;

FLOW5.PART.prototype.impactRadius = 25;

// Relations
FLOW5.PART.prototype.connection= null;


// Optimisation
FLOW5.PART.prototype.updated = true;
FLOW5.PART.prototype.active=true;

FLOW5.PART.prototype.removable= true;

FLOW5.PART.prototype.connect = function(p) {
	var con = new FLOW5.Connection(this,p);
	this.connection.push(con);
	p.connection.push(con);
	return con;
};

FLOW5.PART.prototype.getConnection = function(p) {
	var retVar = null;

	for (var i = 0; i < this.connection.length; i++) {
		if(this.connection[i].getOther(this) == p) {
			retVar = this.connection[i];
			break;
		}
	}
	return retVar;
};

FLOW5.PART.prototype.updateActive = function(b) {
	this.updated = b;
};


FLOW5.Connection.prototype.impactRadius=600;

FLOW5.Connection.prototype.dist = 50.45;
FLOW5.Connection.prototype.dv = 0;
FLOW5.Connection.prototype.scale = 0.0089;
FLOW5.Connection.prototype.border = 100;	
FLOW5.Connection.prototype.friction = 0.96;

FLOW5.Connection.prototype.active = true;

FLOW5.Connection.prototype.getOther= function(p) {
	if(p == this.p1) {
		return this.p2;
	} else {
		return this.p1;
	}
};

FLOW5.Connection.prototype.getDistance = function(){
	return Math.sqrt(Math.pow(this.p1.x-this.p2.x,2)+Math.pow(this.p1.y-this.p2.y,2));
};


FLOW5.GRID.prototype.grid= null;
FLOW5.GRID.prototype.size= -1;
FLOW5.GRID.prototype.iterationCycle = true;

FLOW5.GRID.prototype.init= function(size) {
	this.size = size;
	this.grid = new Array(size);

	for (var i = 0; i < size; i++) {
		this.grid[i] = new Array(size);
		for (var j = 0; j < size; j++) {
			this.grid[i][j] = new Array();
		}
	}
};

FLOW5.GRID.prototype.getBowl= function(x, y) {
	return this.grid[x][y];
};

FLOW5.GRID.prototype.addToGrid= function(p, x, y) {
	p.bx = x;
	p.by = y;
	this.grid[x][y].push(p);
	p.bowl = this.grid[x][y];
};

FLOW5.GRID.prototype.indexOf= function(p, x, y) {
	return this.grid[x][y].indexOf(p);
};

FLOW5.GRID.prototype.inBowl= function(p, x, y) {
	return this.indexOf(p, x, y) != -1;
};

// O(n^3) !!
FLOW5.GRID.prototype.inGrid= function(p) {
	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			if(this.inBowl(p,i,j)) { return true;}
		}
	}
	return false;
};

FLOW5.GRID.prototype.forEachBowl= function(f) {
	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			f(this.grid[j][i]);
		}
	}
};

FLOW5.DynamicGRID.prototype.addParticle = function(p) {
	// Push in the Array
	this.particles.push(p);
	this.activeQue.add(p);

	// Push in the bowls
	var bX = Math.floor(p.x/this.settings.bowlSize);
	var bY = Math.floor(p.y/this.settings.bowlSize);
	this.particleGrid.addToGrid(p, bX, bY);
};

FLOW5.DynamicGRID.prototype.updateGrid = function() {
	this.calculateF();
	this.applyF();
	return this.activeQue.size() !== 0;
};

FLOW5.DynamicGRID.prototype.calculateF = function(){
	var bX=0;
	var bY=0;
	var p;
	var b;
	var p2;
	var dx,dy;


	var self = this;

	// Each Particle
	this.iterationCycle = !this.iterationCycle;
	this.activeQue.forEach(function(p){
		bX = p.bx;
		bY = p.by;

		// Alle Verbindungen, die noch nicht angeschaut wurden:
		for (var c = 0; c < p.connection.length; c++) {
			conn = p.connection[c];
			if(conn.active == self.iterationCycle) {
				conn.active = !self.iterationCycle;
				distance = conn.getDistance();
				if( distance <= conn.impactRadius){
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
										if(!p2.active) {
											self.setActive(p2,true);
										}
										f = 0;
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

										fdx = (p.x-p2.x)*f;
										fdy = (p.y-p2.y)*f;

										p.fx	+= fdx;
										p.fy	+= fdy;
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
		p.updated = false;

	});
};

FLOW5.DynamicGRID.prototype.applyF = function(){
	var self = this;
	this.activeQue.forEach(function(p){
		p.updated = true;
		p.fx*=p.friction;
		p.fy*=p.friction;

		if(p.friction != p.finalFriction){
			var dfric = (p.finalFriction-p.friction)*0.8;
			p.friction += dfric;
			if(dfric<0.05){p.friction =p.finalFriction;}
		}

		if(Math.abs(p.fx)<0.05 && Math.abs(p.fy)<0.05) {
			p.fx=0;
			p.fy=0;
			self.setActive(p,false);
		} else {
			if(p.x<0) {
				p.fx -= (p.x)*0.5;	
			} else if(p.x>self.settings.gridSize){
				p.fx -= (p.x-self.settings.gridSize);
			}

			if(p.y<0) {
				p.fy -= (p.y)*0.5;	
			} else if(p.y>self.settings.gridSize){
				p.fy -= (p.y-self.settings.gridSize);
			}
			p.x += p.fx;
			p.y += p.fy;

			

			nbX = Math.floor(p.x/self.settings.bowlSize);
			nbY = Math.floor(p.y/self.settings.bowlSize);

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

FLOW5.DynamicGRID.prototype.force = function(dist, nullR, dv, scale, border, stable){
	var cVar = -(Math.pow(dist-nullR,3)*dv+(dist-nullR)*scale);
	if(!stable){
		if(cVar<0){cVar = 0;}
	}
	// if(cVar<border){cVar=border;}
	S.f++;	
	return cVar;
};

FLOW5.DynamicGRID.prototype.setActive = function(p, b) {
	if(b) {
		this.activeQue.add(p);
		p.active = true;
	} else if(p.removable){
		p.friction = 0.6;
		this.activeQue.remove(p);
		p.active = false;
	}
};

FLOW5.DynamicGRID.prototype.cleanup = function(){
	for (var i = 0; i < this.particles.length; i++) {
		this.particles[i].friction = this.particles[i].finalFriction;
	};
};

FLOW5.DynamicGRID.prototype.settings={
	gridSize: 600,
	bowlSize: 30
};

FLOW5.DynamicGRID.prototype.getParticleByPos = function(x,y){
	var bX = Math.floor(x/this.settings.bowlSize);
	var bY = Math.floor(y/this.settings.bowlSize);
	var b = this.particleGrid.getBowl(bX,bY);
	var tx,ty,dist;

	for (var i = 0; i < b.length; i++) {
		tx = (b[i].x-x);
		ty = (b[i].y-y);
		dist = Math.sqrt(tx*tx+ty*ty);
		if(dist<10){return b[i];}
	}

	return null;
}


FLOW5.DynamicGRID.prototype.particles = null;
FLOW5.DynamicGRID.prototype.activeQue=null;

FLOW5.DynamicGRID.prototype.particleGrid=null;

window.log = function(t){console.log(t);};

window.S = {
	f:0,
	c:0,
	p:0
	};
