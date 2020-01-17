function objectTag ( data ) {
	return Object.prototype.toString.call( data ).slice( 8, -1 );
}

/**
 * Слияние обьектов
 * @param {Object} source
 * @param {Object} merged
 * @return {Object}
 */
function merge( source, merged ) {
	for ( let key in merged ) {
		if ( objectTag( merged[ key ] ) === 'Object' ) {
			if ( typeof( source[ key ] ) !== 'object' ) source[ key ] = {};
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

	if ( opts.log ) {
		console.log( data );
	}

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
	this.array = [];
	this.resize();
	this.onInit = opts.onInit;
	this.onTick = opts.onTick;
	this.timeoutId = null;
	this.node.particlesCanvas = this;

	window.addEventListener( 'resize', () => {
		this.resize();
	});

	if ( this.onInit instanceof Function ) this.onInit.call( this );

	this.play();
}

Object.defineProperty( ParticlesCanvas.prototype, Symbol.toStringTag, {
	get: function () {
		return 'ParticlesCanvas';
	}
});

ParticlesCanvas.prototype.resize = function () {
	this.rect = this.node.getBoundingClientRect();
	this.node.setAttribute( 'width', String( this.rect.width ) );
	this.node.setAttribute( 'height', String( this.rect.height ) );
};

ParticlesCanvas.prototype.pause = function () {
	clearTimeout( this.timeoutId );
};

ParticlesCanvas.prototype.play = function () {
	this.timeoutId = setInterval( () => {
		this.tick();
	}, 40 );
};

ParticlesCanvas.prototype.tick = function () {
	this.ctx.clearRect( 0, 0, this.rect.width, this.rect.height );
	this.array = Object.values( this.objects );

	for ( let id in this.objects ) {
		this.objects[ id ].live();
	}

	for ( let id in this.objects ) {
		this.objects[ id ].render();
	}

	if ( this.onTick instanceof Function ) this.onTick.call( this );
};


function Particle ( opts ) {
	// Слияние с параметрами по умолчанию и новыми
	merge( this, Particle.defaults );
	merge( this, opts );

	// Обработка цветов
	for ( let key in this.theme ) {
		if ( objectTag( this.theme[ key ] ) === 'String' ) {
			this.theme[ key ] = Color.fromString( this.theme[ key ] );
		}
	}

	// Генерация идентификатора если небыл задан
	if ( !this.id ) {
		this.id = Math.random().toString( 36 ).substring( 2 );
	}

	// Привязка к холсту по идентификатору
	this.canvas.objects[ this.id ] = this;

	// Колбек при инициализации
	if ( this.onInit instanceof Function ) this.onInit.call( this );
}

Object.defineProperty( Particle.prototype, Symbol.toStringTag, {
	get: function () {
		return 'Particle';
	}
});

Particle.defaults = {
	x: 0,
	y: 0,
	ax: 0,
	ay: 0,
	r: 3,
	theme: {
		body: 'rgba(255,255,255,.4)',
		connection: 'rgba(255,255,255,.2)'
	},
	connection: {
		length: 100,
		width: 1,
		quantity: 5,
		targets: []
	},
	state: null,
	hp: null,
	id: null,
	canvas: null,
	onInit: null,
	onLive: null,
	onRender: null
};

Particle.prototype.randomize = function () {
	this.x = Math.random() * this.canvas.rect.width;
	this.y = Math.random() * this.canvas.rect.height;
	this.ax = Math.random() * 4 - 2;
	this.ay = Math.random() * 4 - 2;
};

Particle.prototype.live = function () {
	if ( typeof( this.hp ) === 'number' ) {
		if ( this.hp <= 0 ) {
			this.die();
		} else {
			this.hp-=1;
		}
	}

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

	// Определение соединений
	this.checkConnections();

	if ( this.connection.targets.length < this.connection.quantity ) {
		this.updateConnections( this.connection.quantity - this.connection.targets.length );
	}

	if ( this.onLive instanceof Function ) this.onLive.call( this );
};

Particle.prototype.render = function () {
	// Отрисовка частицы
	this.canvas.ctx.fillStyle = this.theme.body;
	this.canvas.ctx.beginPath();
	this.canvas.ctx.arc( this.x, this.y, this.r, 0, Math.PI * 2, true );
	this.canvas.ctx.fill();
	this.canvas.ctx.closePath();

	// Отрисовка соединений
	this.connection.targets.forEach( ( target ) => {
		let tmp = new Color( this.theme.connection );
		tmp.a = tmp.a * ( 1 - this.distanceTo( target ) / this.connection.length );

		this.canvas.ctx.strokeStyle = tmp.toString();
		this.canvas.ctx.lineCap = 'round';
		this.canvas.ctx.lineWidth = this.connection.width;

		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo( this.x, this.y );
		this.canvas.ctx.lineTo( target.x, target.y );
		this.canvas.ctx.stroke();
		this.canvas.ctx.closePath();
	});

	// Колбек для дополнительных отрисовок
	if ( this.onRender instanceof Function ) this.onRender.call( this );
};

Particle.prototype.die = function () {
	delete this.canvas.objects[ this.id ];
};

Particle.prototype.distanceTo = function ( target ) {
	return Math.sqrt( Math.pow( this.x - target.x, 2 ) + Math.pow( this.y - target.y, 2 ) );
};

Particle.prototype.updateConnections = function ( n ) {
	let tmp = this.canvas.array.slice();

	tmp.forEach( ( object, index ) => {
		if ( object.id === this.id ) {
			delete tmp[ index ];
		}

		this.connection.targets.forEach( ( target ) => {
			if ( object.id === target.id ) {
				delete tmp[ index ];
			}
		});
	});

	tmp = tmp.filter( ( object ) => {
		return object !== null;
	});

	tmp.sort( ( a, b ) => {
		let
			x1 = this.distanceTo( a ),
			x2 = this.distanceTo( b );

		return x1 - x2;
	});

	tmp = tmp.slice( 0, n );

	tmp.forEach( ( target, index ) => {
		if ( this.distanceTo( target ) > this.connection.length ) {
			delete tmp[ index ];
		}
	});

	tmp = tmp.filter( ( object ) => {
		return object !== null;
	});

	this.connection.targets = this.connection.targets.concat( tmp );
};

Particle.prototype.checkConnections = function () {
	this.connection.targets.forEach( ( target, index, targets ) => {
		if ( this.distanceTo( target ) > this.connection.length ) {
			targets.splice( index, 1 );
		}
	});
};

Particle.prototype.toString = function () {
	return '[object Particle]';
};
