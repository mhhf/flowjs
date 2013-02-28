var testFlow = function(flow) {
	var grid = new flow.DynamicGRID();
	var p1 = new flow.PART(100,100);
	var p2 = new flow.PART(160,100);
	var p3 = new flow.PART(130,120);
	var p4 = new flow.PART(170,140);
	var p5 = new flow.PART(135,110);
	p1.removable = false;
	p2.removable = false;
	p3.removable = false;
	p4.removable = false;
	p4.removable = false;
	p5.removable = false;
	p1.connect(p2);
	p1.connect(p3);
	p2.connect(p3);
	p4.connect(p3);
	p2.connect(p4);
	grid.addParticle(p1);
	grid.addParticle(p2);
	grid.addParticle(p3);
	grid.addParticle(p4);
	grid.addParticle(p5);
	
	return grid;
};

var grid1 = testFlow(FLOW4);
var grid2 = testFlow(FLOW5);

// benchsuite('FLOW Creating World', function(){
// 	// bench('Simulate FLOW1', function() {
// 	// 	testFlow(FLOW1);
// 	// });
// 
// 	bench('flow prototype raw', function() {
// 		testFlow(FLOW2);
// 	});
// 
// 	bench('Simulate FLOW4', function(){
// 		testFlow(FLOW4);
// 		});
// });


benchsuite('Update Particle Test', function(){
	// bench('Simulate FLOW1', function() {
	// 	testFlow(FLOW1);
	// });

	bench('update original', function() {
		grid1.updateGrid();
	});
	bench('update improved', function(){
		grid2.updateGrid();
	});

});
