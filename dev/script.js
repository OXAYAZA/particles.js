// Based at https://codepen.io/Mamboleoo/pen/PowKoxe


/**
 * Слияние обьектов
 * @param {Object} source
 * @param {Object} merged
 * @return {Object}
 */
function merge( source, merged ) {
	for ( let key in merged ) {
		if (
			merged[ key ] instanceof Object
			&& !( merged[ key ] instanceof Node )
			&& !( merged[ key ] instanceof Function )
			&& !( merged[ key ] instanceof ParticlesCanvas )
			&& !( merged[ key ] instanceof Particle )
		) {
			source[ key ] = {};
			source[ key ] = merge( source[ key ], merged[ key ] );
		} else {
			source[ key ] = merged[ key ];
		}
	}

	return source;
}


// Notification
function msg ( data, opts ) {
	let
		area = document.querySelector( '.notifications' ),
		node = null,
		defaults = {
			id: null,
			dur: 10000
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
	this.resize();
	this.onTick = opts.onTick;
	this.onInit = opts.onInit;

	window.addEventListener( 'resize', () => {
		this.resize();
	});

	if ( this.onInit instanceof Function ) this.onInit.call( this );

	setInterval( () => {
		this.ctx.clearRect( 0, 0, this.rect.width, this.rect.height );

		for ( let id in this.objects ) {
			let object = this.objects[ id ];
			object.live();
			object.render();
		}

		if ( this.onTick instanceof Function ) this.onTick.call( this );
	}, 40 );
}

ParticlesCanvas.prototype.resize = function () {
	this.rect = this.node.getBoundingClientRect();
	this.node.setAttribute( 'width', String( this.rect.width ) );
	this.node.setAttribute( 'height', String( this.rect.height ) );

	this.area = [];

	for ( let i = 0; i <= this.rect.width; i++ ) {
		this.area[i] = [];

		for ( let j = 0; j <= this.rect.height; j++ ) {
			this.area[i][j] = [];
		}
	}
};


function Particle ( opts ) {
	// Слияние с параметрами по умолчанию и новыми
	merge( this, Particle.defaults );
	merge( this, opts );

	// Генерация идентификатора если небыл задан
	if ( !this.id ) {
		this.id = Math.random().toString( 36 ).substring( 2 );
	}

	// Привязка к холсту по идентификатору
	this.canvas.objects[ this.id ] = this;

	// Колбек при инициализации
	if ( this.onInit instanceof Function ) this.onInit.call( this );
}

Particle.defaults = {
	x: 0,
	y: 0,
	ax: 0,
	ay: 0,
	r: 3,
	bg: 'rgba(255,255,255,1)',
	id: null,
	canvas: null,
	address: {
		x: 0,
		y: 0
	},
	view: {
		size: 100,
		x1: null,
		y1: null,
		x2: null,
		y2: null,
		targets: []
	},
	onInit: null,
	onLive: null,
	onRender: null
};

Particle.prototype.randomize = function () {
	this.x = Math.random() * this.canvas.rect.width;
	this.y = Math.random() * this.canvas.rect.height;
	this.ax = Math.random() * 4 - 2;
	this.ay = Math.random() * 4 - 2;
	this.bg = `rgba(255,255,255,${Math.random()})`
};

Particle.prototype.live = function () {
	// Движение
	this.x+=this.ax;
	this.y+=this.ay;

	// Отталкиваие от стенок
	if ( this.x < 0 ) {
		this.x = 0;
		this.ax = -this.ax;
	}

	if ( this.x > this.canvas.rect.width ) {
		this.x = this.canvas.rect.width ;
		this.ax = -this.ax;
	}

	if ( this.y < 0 ) {
		this.y = 0;
		this.ay = -this.ay;
	}

	if ( this.y > this.canvas.rect.height ) {
		this.y = this.canvas.rect.height ;
		this.ay = -this.ay;
	}

	// Обновление обзора
	this.view.x1 = ~~( this.x - this.view.size / 2 );
	this.view.x2 = ~~( this.x + this.view.size / 2 );
	this.view.y1 = ~~( this.y - this.view.size / 2 );
	this.view.y2 = ~~( this.y + this.view.size / 2 );

	// Обновление адреса
	if ( this.address.x <= this.canvas.rect.width && this.address.x >= 0 && this.address.y <= this.canvas.rect.height && this.address.y >= 0 ) {
		let index = this.canvas.area[this.address.x][this.address.y].indexOf( this.id );
		if ( index !== -1 ) this.canvas.area[ this.address.x ][ this.address.y ].splice( index, 1 );
	}

	this.address.x = ~~this.x;
	this.address.y = ~~this.y;

	if ( this.address.x <= this.canvas.rect.width && this.address.x >= 0 && this.address.y <= this.canvas.rect.height && this.address.y >= 0 ) {
		this.canvas.area[ this.address.x ][ this.address.y ].push( this.id );
	}

	// Обновление списка видимых обьектов
	this.view.targets = [];

	for ( let x = this.view.x1; x < this.view.x2; x++ ) {
		if ( x >= 0 && x <= this.canvas.rect.width ) {
			for ( let y = this.view.y1; y < this.view.y2; y++ ) {
				if ( y >= 0 && y <= this.canvas.rect.height ) {
					let adress = this.canvas.area[ x ][ y ];

					for ( let i = 0; i < adress.length; i++ ) {
						if ( this !== this.canvas.objects[ adress[ i ] ] ) {
							this.view.targets.push( adress[ i ] );
						}
					}
				}
			}
		}
	}

	if ( this.onLive instanceof Function ) this.onLive.call( this );
};

Particle.prototype.render = function () {
	// Отрисовка частицы
	this.canvas.ctx.fillStyle = this.bg;
	this.canvas.ctx.beginPath();
	this.canvas.ctx.arc( this.x, this.y, this.r, 0, Math.PI * 2, true );
	this.canvas.ctx.fill();
	this.canvas.ctx.closePath();

	// Отрисовка полосок к видимым обьектам
	this.view.targets.forEach( ( targetId ) => {
		let target = this.canvas.objects[ targetId ];
		this.canvas.ctx.strokeStyle = this.bg;
		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo( this.x, this.y );
		this.canvas.ctx.lineTo( target.x, target.y );
		this.canvas.ctx.stroke();
		this.canvas.ctx.closePath();
	});

	// Колбек для дополнительных отрисовок
	if ( this.onRender instanceof Function ) this.onRender.call( this );
};


// Init
document.addEventListener( 'DOMContentLoaded', function () {
	let
		canvas = new ParticlesCanvas({
			node: document.querySelector( '.particles-canvas' ),
			onInit: function () {
				for ( let i = 0; i < 100; i++ ) {
					let object = new Particle({ canvas: this });
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
			ax: 0,
			ay: 0,
			r: 5,
			bg: 'rgba(255,0,0,.5)',
			id: 'unit',
			canvas: canvas,
			view: {
				size: 250
			}
		});

	canvas.node.addEventListener( 'mousemove', function ( event ) {
		unit.x = event.clientX;
		unit.y = event.clientY;
	})
});
