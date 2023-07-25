const path = require( 'path' );
const makeIconFont = require( '../../src/index' );

const options = {
	filePath: path.resolve( __dirname, './src/*.svg' ),
	fontFamilyName: 'icon',
	className: 'Icon',
	templatePath: path.resolve( __dirname, './src/_icon-vars.css.njk' ),
	destPath: path.resolve( __dirname, './_generated-vars.css' ),
};

makeIconFont( options ).then( () => console.log( 'iconfont is generated' ) );
