'use strict';

if (!Detector.webgl) Detector.addGetWebGLMessage();

var container, controls;

var camera, cameraTarget, scene, renderer;
var refImage, newImageSize;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var sphereGeometry = new THREE.SphereGeometry(1);
var imageState = {
	state: undefined,
	imageClick: new THREE.Vector2(),
	worldClick: new THREE.Vector2(),
	cylinderSize: new THREE.Vector3(.5, .5, 1),
};
var cylinderGeometry = new THREE.CylinderGeometry(
	imageState.cylinderSize.x,
	imageState.cylinderSize.y,
	imageState.cylinderSize.z,
	32);
var cylinder;

//Grid size and step in mm
var gridSize = 200;
var gridStep = 40; //updated for the newest version

init();
//animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 15000);
    camera.position.set(300, 150, 300);

    cameraTarget = new THREE.Vector3(0, 0, 0);

    scene = new THREE.Scene();
    // Lights

    scene.add(new THREE.HemisphereLight(0x443333, 0x111122));

    addShadowedLight(0.5, 1, -1, 0xffff99, 1);

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;
	//deprecated
    //renderer.shadowMap.cullFace = THREE.CullFaceBack;
	renderer.shadowMap.renderReverseSided = false;

    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enablePan = true;
    controls.target.set(0, 0, 0);
    controls.minDistance = 1;
    controls.enableZoom = true;

    // Axis helper for my own reference
    var axisHelper = new THREE.AxisHelper(30);
    scene.add(axisHelper);

    // Grid for scale reference
    var gridHelper = new THREE.GridHelper(gridSize, gridStep); // THREE.GridHelper(size,step)
    scene.add(gridHelper);

	var ruler = drawRuler(0);

	scene.add(ruler);

    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
	window.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('mousedown', onMouseDown, false);
	document.addEventListener('mouseup', onMouseUp, false);
	document.addEventListener('mousemove', onMouseMove, false);
}

function onMouseDown(event) {
	imageState.state = 'mousedown';
	raycaster.setFromCamera(mouse, camera);

	if (refImage) {
		var intersects = raycaster.intersectObjects([refImage]);

		if (intersects.length > 0) {
			//The point we clicked on is in world coordinates so we need to
			// translate this to image coordinates; also the world coordinates
			// are strangely rotated so we have to swap them around.
			imageState.worldClick.copy(intersects[0].point);
			imageState.imageClick.set(
				newImageSize.x / 2 + intersects[0].point.x,
				newImageSize.y / 2 - intersects[0].point.z);
			console.log("Clicked on the refImage:", intersects[0].point,
				imageState.imageClick);
			var material = new THREE.MeshPhongMaterial({ color: 0xff0000, specular: 0x111111, shininess: 200 });
			var sphere = new THREE.Mesh(sphereGeometry, material);
			cylinder = new THREE.Mesh(cylinderGeometry, material);
			sphere.position.copy(intersects[0].point);
			cylinder.position.copy(intersects[0].point);
			cylinder.rotateZ(Math.PI * .5);
			scene.add(sphere);
			scene.add(cylinder);
			render();
		}
	}
}

function onMouseUp(event) {
	imageState.state = 'mouseup';
}

function onMouseMove(event) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

	if (imageState.state == 'mousedown' && refImage) {
		cylinder.scale.set(1,
			Math.abs(imageState.worldClick.distanceTo(this)), 1);//not sure if this fixes console error. but now error is gone.
	}

}


function onKeyDown(event) {
	switch (event.key) {
		case "x":
			controls.enabled = false;
			break;
		case "y":
			controls.enabled = true;
			break;
		default:
			return;
	}
}

function addShadowedLight(x, y, z, color, intensity) {

    var directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);

    directionalLight.castShadow = true;
    // directionalLight.shadowCameraVisible = true;

    var d = 1;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;

    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    directionalLight.shadow.bias = -0.005;

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function render() {
    renderer.render(scene, camera);
}

function clearScene() {
    // Don't mutate while removing
    _.each(_.clone(scene.children), function (child) {
        if (child.type == "Mesh") {
            scene.remove(child);
        }
    });

    render();
}

function loadImage(imagePath) {
	var loader = new THREE.ImageLoader();
	var texture;
	var image = loader.load(imagePath,
		function (image) {
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
			var aspect = w / h;

			if (w > gridSize) {
				w = gridSize;
				h = gridSize / aspect;
			}
			else if (h > gridSize) {
				h = gridSize;
				w = gridSize / aspect;
			}
			console.log("New size:", w, h);
			newImageSize = new THREE.Vector2(w, h);

			//create the refImage with the image material and place it
			refImage = new THREE.Mesh(new THREE.PlaneGeometry(w, h), img);
			refImage.overdraw = true;
			refImage.rotation.set(-Math.PI * 0.5, 0, 0);
			refImage.position.set(0, .1, 0);

			refImage.originalWidth = texture.image.width;
			refImage.originalHeight = texture.image.height;

			//add the new refImage to the scene
			scene.add(refImage);
			setTimeout("render();", 500);
		}
	);
}

function drawRuler(yPosition) {
	var material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });

	var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-gridSize, yPosition, gridSize));
    geometry.vertices.push(new THREE.Vector3(gridSize, yPosition, gridSize));

	var line = new THREE.Line(geometry, material);

	var rulerLength = gridSize * 2;

	for (var i = 0, length = rulerLength; i <= length; i++) {
		var markLength = i % 5 === 0 ? i % 10 ? 4 : 6 : 3;
		line.add(createRulerMark(i, yPosition, markLength));
	}

	line.add(loadFont(1, -200, 0, 200, 7.5, 0, 7.5));

	return line;
}

function createRulerMark(x, y, z) {
	var material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });

	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(-200 + x, 0 + y, 200));
    geometry.vertices.push(new THREE.Vector3(-200 + x, 0 + y, 200 + z));
	var line = new THREE.Line(geometry, material);

	return line
}

function createMarkerFont(text, font) {
	return new THREE.TextGeometry(text, {
		font: font,
		size: 3,
		height: 1,
		weight: 'normal',
		curverSegments: 2,
	});
}

function loadFont(text, x, y, z, xOffset, yOffset, zOffset, xRotation) {
	var fontLoader = new THREE.FontLoader();
	var group = new THREE.Group();
	fontLoader.load('js/lib/helvetiker_regular.typeface.json', function (font) {
		var unit = 10; //a number per 10mm (1cm)
		var material = new THREE.MeshBasicMaterial({ color: 0x000000, overdraw: 0.5 });

		for (var i = 1, length = gridSize * 2 / 10; i <= length; i++) {
			var textGeometry = createMarkerFont(i, font);
			textGeometry.computeBoundingBox();
			var mesh = new THREE.Mesh(textGeometry, material);
			mesh.position.x = x + xOffset + unit * (i - 1);
			mesh.position.y = 0;
			mesh.position.z = z + zOffset;
			mesh.rotation.x = -Math.PI / 2;
			group.add(mesh);
		}
	});

	return group;
}

//function animate() {
//
//    requestAnimationFrame( animate );
//    controls.update();
//    render();
//
//}
