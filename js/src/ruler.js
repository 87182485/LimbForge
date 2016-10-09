(function (window) {
    'use strict';

    window.LimbForge = {
        createRuler: createRuler
    };

    function createRuler(yPosition) {
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
})(window, undefined);

