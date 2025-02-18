'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Three = require('./Three');

var THREE = _interopRequireWildcard(_Three);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OrbitControls = require('three-orbit-controls')(THREE);

var DIRECTIONAL_LIGHT = 'directionalLight';

var Paint = function () {
  function Paint() {
    _classCallCheck(this, Paint);

    this.loader = new THREE.STLLoader();
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.reqNumber = 0;
  }

  _createClass(Paint, [{
    key: 'init',
    value: function init(context) {
      this.component = context;
      this.width = context.props.width;
      this.height = context.props.height;
      this.modelColor = context.props.modelColor;
      this.backgroundColor = context.props.backgroundColor;
      this.orbitControls = context.props.orbitControls;
      this.rotate = context.props.rotate;
      this.cameraX = context.props.cameraX;
      this.cameraY = context.props.cameraY;
      this.cameraZ = context.props.cameraZ;
      this.rotationSpeeds = context.props.rotationSpeeds;
      this.lights = context.props.lights;
      this.lightColor = context.props.lightColor;
      this.model = context.props.model;

      if (this.mesh !== undefined) {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.scene.remove(this.grid);
      }
      var directionalLightObj = this.scene.getObjectByName(DIRECTIONAL_LIGHT);
      if (directionalLightObj) {
        this.scene.remove(directionalLightObj);
      }

      if (this.animationRequestId) {
        cancelAnimationFrame(this.animationRequestId);
      }

      //Detector.addGetWebGLMessage();
      this.distance = 10000;

      this.reqNumber += 1;
      this.addSTLToScene(this.reqNumber);
    }
  }, {
    key: 'loadSTLFromUrl',
    value: function loadSTLFromUrl(url, reqId) {
      var _this = this;

      return new Promise(function (resolve) {
        _this.loader.crossOrigin = '';
        _this.loader.loadFromUrl(url, function (geometry) {
          if (_this.reqNumber !== reqId) {
            return;
          }
          resolve(geometry);
        });
      });
    }
  }, {
    key: 'loadFromFile',
    value: function loadFromFile(file) {
      var _this2 = this;

      return new Promise(function (resolve) {
        _this2.loader.loadFromFile(file, function (geometry) {
          resolve(geometry);
        });
      });
    }
  }, {
    key: 'addSTLToScene',
    value: function addSTLToScene(reqId) {
      var _this3 = this;

      var loadPromise = void 0;
      if (typeof this.model === 'string') {
        loadPromise = this.loadSTLFromUrl(this.model, reqId);
      } else if (this.model instanceof ArrayBuffer) {
        loadPromise = this.loadFromFile(this.model);
      } else {
        return Promise.resolve(null);
      }
      return loadPromise.then(function (geometry) {
        // Calculate mesh noramls for MeshLambertMaterial.
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        // Center the object
        geometry.center();

        var material = new THREE.MeshLambertMaterial({
          overdraw: true,
          color: _this3.modelColor
        });

        if (geometry.hasColors) {
          material = new THREE.MeshPhongMaterial({
            opacity: geometry.alpha,
            vertexColors: THREE.VertexColors
          });
        }

        _this3.mesh = new THREE.Mesh(geometry, material);
        // Set the object's dimensions
        geometry.computeBoundingBox();
        _this3.xDims = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        _this3.yDims = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
        _this3.zDims = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

        if (_this3.rotate) {
          _this3.mesh.rotation.x = _this3.rotationSpeeds[0];
          _this3.mesh.rotation.y = _this3.rotationSpeeds[1];
          _this3.mesh.rotation.z = _this3.rotationSpeeds[2];
        }

        _this3.scene.add(_this3.mesh);

        _this3.addCamera();
        _this3.addInteractionControls();
        _this3.addToReactComponent();

        // Start the animation
        _this3.animate();
      });
    }
  }, {
    key: 'addCamera',
    value: function addCamera() {
      // Add the camera
      this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 1, this.distance);
      this.camera.add(new THREE.PointLight(0xffffff, 0.8));

      if (this.cameraZ === null) {
        this.cameraZ = Math.max(this.xDims * 3, this.yDims * 3, this.zDims * 3);
      }

      this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);

      this.scene.add(this.camera);

      this.camera.lookAt(this.mesh);

      this.renderer.set;
      this.renderer.setSize(this.width, this.height);
      this.renderer.setClearColor(this.backgroundColor, 1);
    }
  }, {
    key: 'addInteractionControls',
    value: function addInteractionControls() {
      // Add controls for mouse interaction
      if (this.orbitControls) {
        this.controls = new OrbitControls(this.camera, _reactDom2.default.findDOMNode(this.component));
        this.controls.enableDamping = false;
        this.controls.enableRotate;
        this.controls.enableKeys = false;
        this.controls.addEventListener('change', this.orbitRender.bind(this));
      }
    }
  }, {
    key: 'addToReactComponent',
    value: function addToReactComponent() {
      // Add to the React Component
      _reactDom2.default.findDOMNode(this.component).replaceChild(this.renderer.domElement, _reactDom2.default.findDOMNode(this.component).firstChild);
    }

    /**
     * Animate the scene
     * @returns {void}
     */

  }, {
    key: 'animate',
    value: function animate() {
      // note: three.js includes requestAnimationFrame shim
      if (this.rotate) {
        this.animationRequestId = requestAnimationFrame(this.animate.bind(this));
      }

      if (this.orbitControls) {
        this.controls.update();
      }
      this.render();
    }

    /**
     * Render the scene after turning off the rotation
     * @returns {void}
     */

  }, {
    key: 'orbitRender',
    value: function orbitRender() {
      if (this.rotate) {
        this.rotate = false;
      }

      this.render();
    }

    /**
     * Deallocate Mesh, renderer context.
     * @returns {void}
     */

  }, {
    key: 'clean',
    value: function clean() {
      if (this.mesh !== undefined) {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.scene.remove(this.mesh);
        delete this.mesh;
      }
      var directionalLightObj = this.scene.getObjectByName(DIRECTIONAL_LIGHT);
      if (directionalLightObj) {
        this.scene.remove(directionalLightObj);
      }

      if (this.animationRequestId) {
        cancelAnimationFrame(this.animationRequestId);
      }
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }

    /**
     * Render the scene
     * @returns {void}
     */

  }, {
    key: 'render',
    value: function render() {
      if (this.mesh && this.rotate) {
        this.mesh.rotation.x += this.rotationSpeeds[0];
        this.mesh.rotation.y += this.rotationSpeeds[1];
        this.mesh.rotation.z += this.rotationSpeeds[2];
      }

      this.renderer.render(this.scene, this.camera);
    }
  }]);

  return Paint;
}();

exports.default = Paint;
module.exports = exports['default'];