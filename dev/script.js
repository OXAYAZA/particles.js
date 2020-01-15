document.addEventListener( 'DOMContentLoaded', function () {
	let
		canvas = new ParticlesCanvas({
			node: document.querySelector( '.particles-canvas' ),
			onInit: function () {
				for ( let i = 0; i < 300; i++ ) {
					let
						object = new Particle({
							canvas: this,
							theme: {
								body: `rgb(${55 + ~~(Math.random() * 100)},${55 + ~~(Math.random() * 100)},${55 + ~~(Math.random() * 100)})`
							}
						});

					object.randomize();
				}
			},
			onTick: function () {
				msg( `Objects: ${Object.keys( this.objects ).length}`, { id: 'keysLength' } );
			},
		}),
		unit = new Particle({
			x: ~~(canvas.rect.width/2),
			y: ~~(canvas.rect.height/2),
			r: 8,
			id: 'unit',
			canvas: canvas,
			onInit: function () {
				console.log( this );

				this.distanceTo = function ( target ) {
					return Math.sqrt( Math.pow( this.x - target.x, 2 ) + Math.pow( this.y - target.y, 2 ) );
				};

				this.updateConnections = function ( n ) {
					msg( `Require ${n} connections (${this.canvas.array.length})`, { id: 'connections', dur: 100, log: true } );

					this.canvas.array.sort( ( a, b ) => {
						let
							x1 = this.distanceTo( a ),
							x2 = this.distanceTo( b );

						a.$ = x1;
						b.$ = x2;

						return x1 - x2;
					});

					this.connection.targets = this.canvas.array.slice( 0, n );

					console.log( this.canvas.array );
				}
			},
			onLive: function () {
				if ( this.connection.targets.length < this.connection.quantity ) {
					this.updateConnections( this.connection.quantity - this.connection.targets.length );
				}

				// for ( let id in this.canvas.objects ) {
				// 	let
				// 		target = this.canvas.objects[ id ],
				// 		distance = Math.sqrt( Math.pow( this.x - target.x, 2 ) + Math.pow( this.y - target.y, 2 ) );
				//
				// 	if ( distance < this.connection.length && this.connection.targets.length < this.connection.quantity ) {
				// 		this.connection.targets.push( target );
				// 	} else if ( this.connection.targets.length >= this.connection.quantity ) {
				// 		break;
				// 	}
				// }

				let targetIds = this.connection.targets.map( function ( object ) {
					return object.id;
				});

				msg( `Unit: ${this.x}:${this.y} ${targetIds}`, { id: this.id } );
			}
		});

	// canvas.node.addEventListener( 'mousemove', function ( event ) {
	// 	unit.x = event.clientX;
	// 	unit.y = event.clientY;
	// });
});
