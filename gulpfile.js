const { src, dest } = require('gulp');

function buildIcons() {
	// Copy node icons
	const nodeIcons = src('nodes/**/*.{png,svg}')
		.pipe(dest('dist/nodes'));
	
	// Copy credential icons
	const credentialIcons = src('credentials/**/*.{png,svg}')
		.pipe(dest('dist/credentials'));
	
	return Promise.all([nodeIcons, credentialIcons]);
}

exports.build = buildIcons;
exports['build:icons'] = buildIcons;

