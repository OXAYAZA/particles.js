// Based at https://codepen.io/Mamboleoo/pen/PowKoxe


// Notification
function msg ( data, opts ) {
	let
		area = document.querySelector( '.notifications' ),
		node = null,
		defaults = {
			id: null,
			dur: 1000
		};

	opts = {
		...defaults,
		...opts
	};

	try {
		data = JSON.stringify( data )
	} catch ( error ) {
		data = error;
	}

	if ( opts.id ) {
		node = document.getElementById( opts.id );
	}

	if ( !node ) {
		node = document.createElement( 'pre' );
		node.classList.add( 'notification' );
		if ( opts.id ) node.id = opts.id;
		area.appendChild( node );
	}

	node.innerHTML = data;

	clearTimeout( node.notificationTimeout );
	node.notificationTimeout = setTimeout( () => {
		node.remove();
	}, opts.dur );
}


// Core
function ParticlesCanvas ( opts ) {
	this.node = opts.node;
	this.ctx = this.node.getContext( '2d' );
	this.objects = {};
	this.node.style.width = '100vw';
	this.node.style.height = '100vh';
	this.rect = this.node.getBoundingClientRect();
	this.node.setAttribute( 'width', String( this.rect.width ) );
	this.node.setAttribute( 'height', String( this.rect.height ) );

	setInterval( () => {
		this.ctx.clearRect( 0, 0, this.rect.width, this.rect.height );

		if ( Object.keys( this.objects ).length < 30 ) {
			let
				id = Math.random().toString( 36 ).substring( 2 ),
				object = new Particle({ id: id, canvas: this });

			this.objects[ id ] = object;
			object.randomize();
		}

		for ( let id in this.objects ) {
			let object = this.objects[ id ];

			for ( let targetId in this.objects ) {
				if ( targetId !== id ) {
					let
						target = this.objects[ targetId ],
						length = Math.sqrt( Math.pow( target.x - object.x, 2 ) + Math.pow( target.y - object.y, 2 ) );

					this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
					this.ctx.beginPath();
					this.ctx.moveTo( object.x, object.y );
					this.ctx.lineTo( target.x, target.y );
					this.ctx.stroke();
					this.ctx.closePath();
				}
			}

			object.move();
			object.render();

			if ( object.x < 0 || object.x > this.rect.width ) {
				object.ax=-object.ax;
			}

			if ( object.y < 0 || object.y > this.rect.height ) {
				object.ay=-object.ay;
			}
		}

		msg( Object.keys( this.objects ).length, { id: 'keysLength' } );
	}, 20 );
}

function Particle ( opts ) {
	// Merge defaults and options
	for ( let key in Particle.defaults ) {
		this[ key ] = Particle.defaults[ key ];

		if ( opts && opts[ key ] ) {
			this[ key ] = opts[ key ];
		}
	}
}

Particle.defaults = {
	x: 0,
	y: 0,
	ax: 1,
	ay: .5,
	w: 6,
	h: 6,
	bg: '#ffffff',
	id: null,
	canvas: null
};

Particle.prototype.randomize = function () {
	this.x = ~~( Math.random() * this.canvas.rect.width );
	this.y = ~~( Math.random() * this.canvas.rect.height );
	this.ax = Math.random() * 4 - 2;
	this.ay = Math.random() * 4 - 2;
};

Particle.prototype.move = function () {
	this.x+=this.ax;
	this.y+=this.ay;
};

Particle.prototype.render = function () {
	this.canvas.ctx.fillStyle = this.bg;
	this.canvas.ctx.fillRect( this.x - this.w / 2, this.y - this.h / 2, this.w, this.h );
};


// Init
document.addEventListener( 'DOMContentLoaded', function () {
	new ParticlesCanvas({
		node: document.querySelector( '.particles-canvas' )
	});
});
