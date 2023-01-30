const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );
const mkdirp = require( 'mkdirp' );
const nunjucks = require( 'nunjucks' );
const generateFont = require( './generateFont' );

const UNICODE_PRIVATE_USE_AREA_START = 0xE000;

module.exports = async( options ) => {

	let lastCodepoint = UNICODE_PRIVATE_USE_AREA_START;
	const files = glob.sync( options.filePath );
	const reservedCodepoints = files
		.filter( ( filename ) => hasCodePointInFilename( filename ) )
		.map( ( filename ) => getCodePointFromFilename( filename ) );

	const generateFontParams = {
		files,
		names: files.map( ( filename ) => {

			return kebabToCamel( getIconNameFromFilename( filename ) );

		} ),
		codepoints: files.reduce( ( codepoints, filename ) => {

			const name = kebabToCamel( getIconNameFromFilename( filename ) );
			const codepoint = getCodePointFromFilename( filename ) || getNextCodePoint();
			codepoints[ name ] = codepoint;
			return codepoints;

		}, {} ),
	};

	options.names = files.map( ( filename ) => {

		return kebabToCamel( getIconNameFromFilename( filename ) );

	} );

	const woffBuffer = await generateFont( generateFontParams );
	const mime = 'font/woff2';
	const encoding = 'base64';
	const data = woffBuffer.toString( encoding );
	const dataUri = `data:${ mime };${ encoding },${ data }`;

	const {
		fontFamilyName,
		className,
		templatePath,
		destPath
	} = options;

	const codepoints = Object.keys( generateFontParams.codepoints ).map( ( iconName ) => {

		const codepoint = generateFontParams.codepoints[ iconName ];
		return [ iconName, codepoint.toString( 16 ) ];

	} );

	const generatedCss = nunjucks.render( templatePath, {
		fontFamilyName,
		className,
		dataUri,
		codepoints,
	} );
	// console.log( generatedCss );
	writeFile( generatedCss, destPath );

	function getNextCodePoint() {

		if ( reservedCodepoints.includes( lastCodepoint ) ) {

			lastCodepoint ++;
			return getNextCodePoint();

		}

		return lastCodepoint ++;

	}

};

function writeFile( content, dest ) {

	mkdirp.sync( path.dirname( dest ) );
	fs.writeFileSync( dest, content );

}

function getIconNameFromFilename( filename ) {

	return path.basename( filename ).replace( /^(u[0-9A-Fa-f]{4}-)?(.+)\.svg$/i, '$2' );

}

function hasCodePointInFilename( filename ) {

	return /^u([0-9A-Fa-f]{4})-/.test( path.basename( filename ) );

}

function getCodePointFromFilename( filename ) {

	const match = path.basename( filename ).match( /^u([0-9A-Fa-f]{4})-?.+\.svg$/i );
	return match ? parseInt( match[ 1 ], 16 ) : null;

}

function kebabToCamel( string ) {

	return string.replace( /-./g, ( letter ) => letter.charAt( 1 ).toUpperCase() );

}
