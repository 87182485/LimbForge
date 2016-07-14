
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, controls;

var camera, cameraTarget, scene, renderer;
var refImage;

//Grid size and step in mm
var gridSize = 200;
var gridStep = 10;

init();
//animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15000 );
    camera.position.set( 300, 150, 300 );

    cameraTarget = new THREE.Vector3( 0, 0, 0 );

    scene = new THREE.Scene();

    // Lights

    scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );

    addShadowedLight( 0.5, 1, -1, 0xffff99, 1 );

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xffffff );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.cullFace = THREE.CullFaceBack;

    // Orbit Controls
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enablePan = true;
    controls.target.set(0,0,0);
    controls.minDistance = 1;
    controls.enableZoom = true;

    // Axis helper for my own reference
    var axisHelper = new THREE.AxisHelper( 30 );
    scene.add( axisHelper );

    // Grid for scale reference
    var gridHelper = new THREE.GridHelper( gridSize, gridStep ); // THREE.GridHelper(size,step)
    scene.add( gridHelper );

    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
		window.addEventListener('keydown', onKeyDown, false);
}

function onKeyDown(event)
{
	console.log(event);
	switch(event.keyCode)
	{
		case "x":
			console.log("got x");
			break;
		default:
			return;
	}
}

function addShadowedLight( x, y, z, color, intensity ) {

    var directionalLight = new THREE.DirectionalLight( color, intensity );
    directionalLight.position.set( x, y, z );
    scene.add( directionalLight );

    directionalLight.castShadow = true;
    // directionalLight.shadowCameraVisible = true;

    var d = 1;
    directionalLight.shadowCameraLeft = -d;
    directionalLight.shadowCameraRight = d;
    directionalLight.shadowCameraTop = d;
    directionalLight.shadowCameraBottom = -d;

    directionalLight.shadowCameraNear = 1;
    directionalLight.shadowCameraFar = 4;

    directionalLight.shadowMapWidth = 1024;
    directionalLight.shadowMapHeight = 1024;

    directionalLight.shadowBias = -0.005;

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function render() {
    renderer.render( scene, camera );
}

function clearScene(){
    // Don't mutate while removing
    _.each(_.clone(scene.children),function(child){
        if (child.type == "Mesh") {
            scene.remove(child);
        }
    });

    render();
}

function loadImage(imagePath){
	var loader = new THREE.ImageLoader();
	var texture;
	var image = loader.load(imagePath,
		function(image)
		{
			texture = new THREE.Texture();
			texture.minFilter = THREE.LinearFilter
			texture.image = image;
			texture.needsUpdate = true;
			var img = new THREE.MeshBasicMaterial({ map: texture });
			img.map.needsUpdate = true;
			img.transparent = false;
			img.opacity = 0.8;
			img.side = THREE.DoubleSide;

			var w = texture.image.width;
			var h = texture.image.height;
			var aspect = w/h;

			if(w > gridSize)
			{
				w = gridSize;
				h = gridSize/aspect;
			}
			if(h > gridSize)
			{
				h = gridSize;
				w = gridSize/aspect;
			}
			console.log("New size:", w, h);

			//create the refImage with the image material and place it
			var refImage = new THREE.Mesh(new THREE.PlaneGeometry(w, h), img);
			refImage.overdraw = true;
			refImage.rotation.set(-Math.PI*0.5,0,0 );
			refImage.position.set(0,1,0);

			//add the new refImage to the scene
			scene.add(refImage);
			setTimeout("render();",500);
		}
	);
}

//function animate() {
//
//    requestAnimationFrame( animate );
//    controls.update();
//    render();
//
//}
