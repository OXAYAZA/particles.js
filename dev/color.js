function Color ( params ) {
	Object.assign( this, params );
}

Color.defaults = {
	r: 0,
	g: 0,
	b: 0,
	a: 1,
};

Color.fromString = function ( string ) {
	
};

Color.hex2rgb = function ( string ) {
	
};

Color.toString = function () {
	return `rgba(${this.r},${this.g},${this.b},${this.a})`
};
