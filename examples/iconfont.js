const path = require( 'path' );
const makeIconFont = require( '../src/index' );

const options = {
	filePath: path.resolve( __dirname, '../examples/src/*.svg' ),
	fontFamilyName: 'icon',
	className: 'Icon',
	templatePath: path.resolve( __dirname, '../examples/src/_icon-vars.scss.njk' ),
	destPath: path.resolve( __dirname, '../examples/_generated-vars.scss' ),
};

makeIconFont( options ).then( () => console.log( 'iconfont is generated' ) );
