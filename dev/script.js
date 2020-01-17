document.addEventListener( 'DOMContentLoaded', function () {
	let
		btnPlay = document.querySelector( '#play' ),
		btnPause = document.querySelector( '#pause' ),
		btnTick = document.querySelector( '#tick' ),
		canvas = new ParticlesCanvas({
			node: document.querySelector( '.particles-canvas' ),
			onInit: function () {
				for ( let i = 0; i < 2000; i++ ) {
					let object = new Particle({
						r: 3,
						canvas: this,
						theme: {
							body: 'rgba(0,0,0,.01)',
							connection: 'rgba(0,0,0,.1)'
						},
						connection: {
							quantity: 0
						}
					});

					object.randomize();
				}

				for ( let i = 0; i < 6; i++ ) {
					let
						object = new Particle({
							r: 1,
							canvas: this,
							theme: {
								body: 'rgba(0,0,0,0)',
								connection: 'rgba(0,0,0,1)',
							},
							connection: {
								length: 300,
								width: 6,
								quantity: 100
							}
						});

					object.randomize();
				}
			}
		});

	btnPlay.addEventListener( 'click', function() {
		canvas.play();
		console.log( 'PLAY' );
	});

	btnPause.addEventListener( 'click', function() {
		canvas.pause();
		console.log( 'PAUSE' );
	});

	btnTick.addEventListener( 'click', function() {
		canvas.tick();
		console.log( 'TICK' );
	});
});
