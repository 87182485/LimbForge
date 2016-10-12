(function (window) {
    'use strict';

    window.LimbForge = {
        createRuler: createRuler
    };

    function createRuler(yPosition, isRotate) {
        var material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        var geometry = new THREE.Geometry();

        if (!isRotate) {
            geometry.vertices.push(new THREE.Vector3(-gridSize, yPosition, gridSize));
            geometry.vertices.push(new THREE.Vector3(gridSize, yPosition, gridSize));
        } else {
            geometry.vertices.push(new THREE.Vector3(gridSize, yPosition, gridSize));
            geometry.vertices.push(new THREE.Vector3(gridSize, yPosition, -gridSize));
        }

        var line = new THREE.Line(geometry, material);

        var rulerLength = gridSize * 2;

        for (var i = 0, length = rulerLength; i <= length; i++) {
            var markLength = i % 5 === 0 ? i % 10 ? 4 : 6 : 3;
            line.add(createRulerMark(i, yPosition, markLength, isRotate));
        }

        line.add(loadFont(1, -200, 0, 200, 7.5, 0, 7.5, isRotate));

        return line;
    }

    function createRulerMark(x, y, z, isRotate) {
        var material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        var geometry = new THREE.Geometry();
        var xStart = isRotate ? 200 : -200 + x;
        var zStart = isRotate ? -200 + x : 200;
        var xEnd = isRotate ? 200 + z : -200 + x;
        var zEnd = isRotate ? -200 + x : 200 + z;
        var start = new THREE.Vector3(xStart, 0 + y, zStart)//line start
        var end = new THREE.Vector3(xEnd, 0 + y, zEnd);
        geometry.vertices.push(start);
        geometry.vertices.push(end);

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
                if (xRotation) {
                    mesh.position.x = 400 + x + xOffset;
                    mesh.position.y = 0;
                    mesh.position.z = z + zOffset - unit * (i+0.5);
                    mesh.rotation.x = -Math.PI / 2;
                } else {
                    mesh.position.x = x + xOffset + unit * (i - 1);
                    mesh.position.y = 0;
                    mesh.position.z = z + zOffset;
                    mesh.rotation.x = -Math.PI / 2;
                }

                group.add(mesh);
            }
        });

        return group;
    }
})(window, undefined);

