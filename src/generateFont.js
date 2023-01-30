const fs = require( 'fs' );
const SVGIcons2SVGFontStream = require( 'svgicons2svgfont' );
const svg2ttf = require( 'svg2ttf' );
// const ttf2woff = require( 'ttf2woff' );
const ttf2woff2 = require( 'ttf2woff2' );

const toSvg = ( options ) => {

	return new Promise( ( resolve ) => {

		const svgOptions = {
			fontName: options.fontName,
			fontHeight: options.fontHeight,
			descent: options.descent,
			normalize: options.normalize,
			round: options.round,
		};

		svgOptions.log = function () {};

		let result = '';
		const fontStream = new SVGIcons2SVGFontStream( svgOptions );
		fontStream.on( 'data', ( data ) => result += data );
		fontStream.on( 'finish', () => resolve( result ) );

		options.files.forEach( ( file, i ) => {

			const glyph = fs.createReadStream( file );
			const name = options.names[ i ];
			const unicode = String.fromCharCode( options.codepoints[ name ] );

			let ligature = '';
			for ( let i = 0; i < name.length; i ++ ) {

				ligature += String.fromCharCode( name.charCodeAt( i ) );

			}

			glyph.metadata = {
				name: name,
				unicode: [ unicode, ligature ],
			};

			fontStream.write( glyph );

		} );

		fontStream.end();

	} );

};

const toTtf = ( buffer, options ) => Buffer.from( svg2ttf( buffer, options ).buffer );
// const toWoff = ( buffer, options ) => Buffer.from( ttf2woff( buffer, options ).buffer );
const toWoff2 = ( buffer ) => Buffer.from( ttf2woff2( buffer ).buffer );

const generateFonts = async( options ) => {

	const svgFontString = await toSvg( options );
	const ttfBuffer = toTtf( svgFontString, options );
	// const woffBuffer = toWoff( ttfBuffer, options );
	const woff2Buffer = toWoff2( ttfBuffer );

	return ( woff2Buffer );

};

module.exports = generateFonts;
