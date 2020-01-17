function Color ( params ) {
	Object.assign( this, Color.defaults, params );
}

Color.defaults = {
	r: 0,
	g: 0,
	b: 0,
	a: 1,
};

Color.fromString = function ( str ) {
	if ( /^\s*rgba\s*\(/i.test( str ) ) {
		let tmp = str.match( /^\s*rgba\s*\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*,\s*([\d.]*)\s*\)/i );
		return new Color({ r: tmp[1], g: tmp[2], b: tmp[3], a: tmp[4] });
	} else if ( /^\s*rgb\s*\(/i.test( str ) ) {
		let tmp = str.match( /^\s*rgb\s*\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/i );
		return new Color({ r: tmp[1], g: tmp[2], b: tmp[3] });
	} else {
		throw new Error ( 'Color parse error' );
	}
};

Color.prototype.toString = function () {
	return `rgba(${this.r},${this.g},${this.b},${this.a})`;
};

Object.defineProperty( Color.prototype, Symbol.toStringTag, {
	get: function () {
		return 'Color';
	}
});
