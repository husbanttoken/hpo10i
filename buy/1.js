
import * as THREE from         './three.module.js';
import { EffectComposer } from './EffectComposer.js';
import { RenderPass } from     './RenderPass.js';
import { ShaderPass } from     './ShaderPass.js';
import { BloomPass } from      './BloomPass.js';
import { CopyShader } from     './CopyShader.js';

let container;

let camera, scene, renderer;

let video, texture, material, mesh;

let composer;

let mouseX = 0;
let mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let cube_count;

const meshes = [],
	  materials = [],

	  xgrid = 7,
	  ygrid = 3;

const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', function () {

	init();
	animate();

} );

function init() {

	// const overlay = document.getElementById( 'overlay' );
	// overlay.remove();

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 500;
	// camera.position.x = 100;

	scene = new THREE.Scene();

	const light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( -0.5, 1, 10 ).normalize();
	scene.add( light );
	// const light2 = new THREE.DirectionalLight( 0x666666 );
	// light2.position.set( 0.5, -1, 1 ).normalize();
	// scene.add( light2 );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	video = document.getElementById( 'video' );
	video.play();
	video.addEventListener( 'play', function () {

		this.currentTime = 3;

	} );

	texture = new THREE.VideoTexture( video );

	//

	let i, j, ox, oy, geometry;

	const ux = 1 / xgrid;
	const uy = 1 / ygrid;

	const xsize = 380 / xgrid;
	const ysize = 180 / ygrid;

	const parameters = { color: 0xffffff, map: texture };

	cube_count = 0;

	for ( i = 0; i < xgrid; i ++ ) {

		for ( j = 0; j < ygrid; j ++ ) {

			ox = i;
			oy = j;

			geometry = new THREE.BoxGeometry( xsize, ysize, xsize );

			change_uvs( geometry, ux, uy, ox, oy );

			materials[ cube_count ] = new THREE.MeshLambertMaterial( parameters );

			material = materials[ cube_count ];

			material.hue = i / xgrid;
			material.saturation = 1 - j / ygrid;

			material.color.setHSL( material.hue, material.saturation, 0.5 );

			mesh = new THREE.Mesh( geometry, material );

			mesh.position.x = 40+ ( i - xgrid / 2 ) * xsize;
			mesh.position.y = ( j - ygrid / 2 ) * ysize;
			mesh.position.z = 0;

			mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;

			scene.add( mesh );

			mesh.dx = 0.001 * ( 0.5 - Math.random() );
			mesh.dy = 0.001 * ( 0.5 - Math.random() );

			meshes[ cube_count ] = mesh;

			cube_count += 1;

		}

	}

	renderer.autoClear = false;

	document.addEventListener( 'mousemove', onDocumentMouseMove );

	// postprocessing

	const renderModel = new RenderPass( scene, camera );
	const effectBloom = new BloomPass( 1.3 );
	const effectCopy = new ShaderPass( CopyShader );

	composer = new EffectComposer( renderer );

	composer.addPass( renderModel );
	composer.addPass( effectBloom );
	composer.addPass( effectCopy );

	//

	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2 ;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	composer.setSize( window.innerWidth, window.innerHeight );

}

function change_uvs( geometry, unitx, unity, offsetx, offsety ) {

	const uvs = geometry.attributes.uv.array;

	for ( let i = 0; i < uvs.length; i += 2 ) {

		uvs[ i ] = ( uvs[ i ] + offsetx ) * unitx;
		uvs[ i + 1 ] = ( uvs[ i + 1 ] + offsety ) * unity;

	}

}


function onDocumentMouseMove( event ) {

	mouseX = ( event.clientX - windowHalfX );
	mouseY = ( event.clientY - windowHalfY ) * 0.3;

}

//

function animate() {

	requestAnimationFrame( animate );

	render();

}

let h, counter = 1;

function render() {

	const time = Date.now() * 0.00009;

	camera.position.x += ( mouseX - camera.position.x ) * 0.05;
	camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

	camera.lookAt( scene.position );

	for ( let i = 0; i < cube_count; i ++ ) {

		material = materials[ i ];

		h = ( 360 * ( material.hue + time ) % 360 ) / 360;
		material.color.setHSL( h, material.saturation, 0.6 );

	}
		for ( let i = 0; i < cube_count; i ++ ) {

			mesh = meshes[ i ];

			mesh.rotation.x += 20 * mesh.dx;
			mesh.rotation.y += 20 * mesh.dy;
			mesh.rotation.z += 20 * mesh.dy;

			// mesh.position.x -= 45 * mesh.dx;
			// mesh.position.y += 45 * mesh.dy;
			// mesh.position.z += 30 * mesh.dx;

		}

	// if ( counter % 2000 > 500 && counter % 2000 < 1500 ) {

	// 	for ( let i = 0; i < cube_count; i ++ ) {

	// 		mesh = meshes[ i ];

	// 		mesh.rotation.x += 10 * mesh.dx;
	// 		mesh.rotation.y += 10 * mesh.dy;

	// 		mesh.position.x -=  5 * mesh.dx;
	// 		mesh.position.y +=  5 * mesh.dy;
	// 		mesh.position.z += 30 * mesh.dx;

	// 	}

	// }
	// if ( counter % 2000 < 500 || counter % 2000 > 1500 ) {

	// 	for ( let i = 0; i < cube_count; i ++ ) {

	// 		mesh = meshes[ i ];

	// 		mesh.rotation.x -= 10 * mesh.dx;
	// 		mesh.rotation.y -= 10 * mesh.dy;

	// 		mesh.position.x +=  5 * mesh.dx;
	// 		mesh.position.y -=  5 * mesh.dy;
	// 		mesh.position.z -= 30 * mesh.dx;

	// 	}

	// }

	// if ( counter % 400 === 0 ) {

	// 	for ( let i = 0; i < cube_count; i ++ ) {

	// 		mesh = meshes[ i ];

	// 		mesh.dx *= - 1;
	// 		mesh.dy *= - 1;

	// 	}

	// }

	counter ++;

	renderer.clear();
	composer.render();

}


document.getElementById( 'startButton').click();
