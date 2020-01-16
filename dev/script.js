document.addEventListener( 'DOMContentLoaded', function () {
	let
		btnPlay = document.querySelector( '#play' ),
		btnPause = document.querySelector( '#pause' ),
		btnTick = document.querySelector( '#tick' ),
		canvas = new ParticlesCanvas({
			node: document.querySelector( '.particles-canvas' ),
			onInit: function () {
				for ( let i = 0; i < 300; i++ ) {
					let
						object = new Particle({
							canvas: this
						});

					object.randomize();
				}
			},
			onTick: function () {
				msg( `Objects: ${Object.keys( this.objects ).length}`, { id: 'keysLength' } );
			}
		}),
		unit = new Particle({
			x: ~~(canvas.rect.width/2),
			y: ~~(canvas.rect.height/2),
			r: 10,
			id: 'unit',
			canvas: canvas,
			theme: {
				body: 'rgba(255,0,0,1)',
			},
			onRender: function () {
				this.canvas.ctx.font = `${this.r * 1.5}px sans-serif`;
				this.canvas.ctx.fillStyle = 'rgb(0,0,0)';
				this.canvas.ctx.fillText( `${this.connection.targets.length}`, this.x - this.r * 0.5, this.y + this.r * 0.5 );
				// this.canvas.ctx.fillText( this.id, this.x + this.r * 2, this.y + this.r );
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

	canvas.node.addEventListener( 'mousemove', function ( event ) {
		unit.x = event.clientX;
		unit.y = event.clientY;
	});
});
