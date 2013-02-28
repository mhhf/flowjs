describe("Grid Test", function() {
	console.log(window);
	window.PART = window.FLOW5.PART;
	window.Connection = FLOW5.Connection;
	window.GRID = FLOW5.GRID;
	window.DynamicGRID = FLOW5.DynamicGRID;
	var grid;

	beforeEach(function(){
		grid = new window.DynamicGRID();
	});

	it("create new DynamicGrid", function() {
		expect(grid).toBeTruthy();
	});
	
	it("active Que must be empty",function(){
		expect(grid.activeQue.isEmpty()).toBeTruthy();
	});

	it("check grid size", function(){
		expect(grid.particleGrid.size).toBeGreaterThan(0);	
	});

	describe("Particle On Grid", function(){
		var p;

		beforeEach(function(){
			p = new window.PART(40,10);
			grid.addParticle(p);
		});

		it("is in que", function(){
			expect(grid.activeQue.first()).toEqual(p);
		});

		it("its in the bowl1", function(){
			expect(grid.particleGrid.inBowl(p,p.bx,p.by)).toBeTruthy();  
		});

		it("its in the bowl2", function(){
			expect(grid.particleGrid.inBowl(p,1,0)).toBeTruthy();  
		});
		
	});

	describe("Particle Dynamics",function(){
		var p1;
		var p2;
		var p3;

		beforeEach(function(){
			p1 = new PART(27,10);
			p1.fx = -30;
			p2 = new PART(34,10);
			p3 = new PART(70,10);
			grid.addParticle(p1);
			grid.addParticle(p2);
		});

		it("check que size",function(){
			expect(grid.activeQue.size()).toEqual(2);
		});
	
		describe("after updating", function() {
			beforeEach(function() {
				grid.updateGrid();
			});

			it("positions are different", function() {
				expect(p1.x).not.toEqual(27);
				console.log(p1.x);
			});

			it("valid bowls", function() {
				expect(p1.bx).toBeGreaterThan(-1);
				console.log(p1.bx);
			});
			
			
 
		});  
	});

	describe("Bowl Change", function() {
		var p1;

		beforeEach(function() {
			p1 = new PART(1,1);
			grid.addParticle(p1);
		});
		

		it("valid bowls", function() {
			p1.fx = -10;
			p1.fy = -10;
			grid.updateGrid();
			expect(p1.bx).toEqual(0);
			expect(p1.by).toEqual(0);
		});

		it("bowls change", function() {
			p1.fx = 40;
			grid.updateGrid();
			// console.log(p1.x);
			expect(p1.x>30).toBeTruthy();
			expect(p1.bx).toEqual(1);
			expect(grid.particleGrid.getBowl(0,0).length === 0).toBeTruthy();
		});
		
		
	});  

	describe("active", function() {
		var p1;
		beforeEach(function() {
			p1 = new PART(10,10);
			grid.addParticle(p1);
			grid.updateGrid();
		});
		

		it("turned off", function() {
			expect(!p1.active).toBeTruthy();
		});

		it("removed from que", function() {
			expect(grid.activeQue.size()).toEqual(0);
		});
		
	});  
	
	describe("connections", function() {
		var p1;
		var p2;
		var con;

		beforeEach(function() {
			p1=new PART(10,10);
			p2=new PART(34,10);
			grid.addParticle(p1);
			grid.addParticle(p2);
			con = p1.connect(p2);
			con.dist = 20;
		});

		it("should have bouth particles", function() {
			expect(con.getOther(p1)).toEqual(p2);
			expect(con.getOther(p2)).toEqual(p1);
		});


		it("should change position after updating", function() {
			grid.updateGrid();
			expect(p1.x).toBeGreaterThan(10);
		});
		
		
	});  
	
	
});
