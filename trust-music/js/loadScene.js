require([
	'goo/entities/GooRunner',
	'goo/animationpack/systems/AnimationSystem',
	'goo/fsmpack/statemachine/StateMachineSystem',
	'goo/entities/systems/HtmlSystem',
	'goo/timelinepack/TimelineSystem',
	'goo/loaders/DynamicLoader',
	'goo/util/combine/EntityCombiner',
	'goo/renderer/Renderer',
	'goo/util/rsvp',

	'js/CanvasWrapper',
	'js/WebGLSupport',

	'goo/animationpack/handlers/SkeletonHandler',
	'goo/animationpack/handlers/AnimationComponentHandler',
	'goo/animationpack/handlers/AnimationStateHandler',
	'goo/animationpack/handlers/AnimationLayersHandler',
	'goo/animationpack/handlers/AnimationClipHandler',

	'goo/fsmpack/StateMachineComponentHandler',
	'goo/fsmpack/MachineHandler',
	'goo/timelinepack/TimelineComponentHandler',
	'goo/passpack/PosteffectsHandler',
	'goo/quadpack/QuadComponentHandler',
	'goo/scriptpack/ScriptHandler',
	'goo/scriptpack/ScriptComponentHandler',
	'goo/scriptpack/ScriptRegister',
	'goo/scripts/GooClassRegister'
], function (
	GooRunner,
	AnimationSystem,
	StateMachineSystem,
	HtmlSystem,
	TimelineSystem,
	DynamicLoader,
	EntityCombiner,
	Renderer,
	RSVP,

	CanvasWrapper,
	WebGLSupport
	) {
	'use strict';

	function setup(gooRunner, loader) {
		// Application code goes here!

		/*
		 To get a hold of entities, one can use the World's selection functions:
		 var allEntities = gooRunner.world.getEntities();                  // all
		 var entity      = gooRunner.world.by.name('EntityName').first();  // by name
		 */
	}

	/**
	 * Converts camelCase (js) to dash-case (html)
	 */
	function camel2dash(str) {
		return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	}

	/**
	* Shows the fallback help content on index.html
	*/
	function showFallback(errorObject) {
		// Show the fallback
		document.getElementById('fallback').classList.add('show');
		var browsers = WebGLSupport.BROWSERS;


		var id;
		if (errorObject.browser === browsers.IOS) {
				id = 'ios-error';
		} else {

			id = camel2dash(errorObject.error);

			if (errorObject.error == WebGLSupport.ERRORS.WEBGL_DISABLED) {
				if (errorObject.browser == browsers.CHROME) {
					id += '-chrome';
				} else if (errorObject.browser == browsers.SAFARI) {
					id += '-safari';
				}
			}
		}

		var errorElement = document.getElementById(id);
		errorElement.classList.add('show');
	}


	function init() {

		// Check that WebGL is supported.
		var result = WebGLSupport.check();
		if (result.error !== WebGLSupport.ERRORS.NO_ERROR) {
			showFallback(result);
			return;
		}

		document.getElementById('canvas-outer').classList.remove('hidden');

		// Prevent browser peculiarities to mess with our controls.
		document.body.addEventListener('touchstart', function (event) {
			if(event.target.nodeName !== 'A') {
				event.preventDefault();
			}
		}, false);

		// Show the loading overlay
		document.getElementById('goo-loading-overlay').classList.add('loading');

		// Init the GooEngine
		var gooRunner = initGoo();
		var world = gooRunner.world;

		var transformSystem = world.getSystem('TransformSystem');
		var cameraSystem = world.getSystem('CameraSystem');
		var boundingSystem = world.getSystem('BoundingUpdateSystem');
		var animationSystem = world.getSystem('AnimationSystem');
		var renderSystem = world.getSystem('RenderSystem');
		var renderer = gooRunner.renderer;

		// Load the project
		loadProject(gooRunner).then(function (loader) {

			

			world.processEntityChanges();
			transformSystem._process();
			cameraSystem._process();
			boundingSystem._process();
			if (Renderer.mainCamera) { gooRunner.renderer.checkResize(Renderer.mainCamera); }
			return setup(gooRunner, loader);
		}).then(function () {
			new EntityCombiner(world).combine();
			world.processEntityChanges();
			transformSystem._process();
			cameraSystem._process();
			boundingSystem._process();
			animationSystem._process();
			renderSystem._process();

			return renderer.precompileShaders(renderSystem._activeEntities, renderSystem.lights);
		}).then(function () {
			return renderer.preloadMaterials(renderSystem._activeEntities);
		}).then(function () {
			// Hide the loading overlay.
			document.getElementById('goo-loading-overlay').classList.remove('loading');
			CanvasWrapper.show();

			CanvasWrapper.resize();
			// Start the rendering loop!
			gooRunner.startGameLoop();
			gooRunner.renderer.domElement.focus();
		}).then(null, function (e) {
			// If something goes wrong, 'e' is the error message from the engine.
			alert('Failed to load project: ' + e);
		});
	}


	function initGoo() {

		// Create typical Goo application.
		var gooRunner = new GooRunner({
			antialias: true,
			manuallyStartGameLoop: true,
			useDevicePixelRatio: true,
			logo: false

		});

		gooRunner.world.add(new AnimationSystem());
		gooRunner.world.add(new StateMachineSystem(gooRunner));
		gooRunner.world.add(new HtmlSystem(gooRunner.renderer));
		gooRunner.world.add(new TimelineSystem());

		return gooRunner;
	}


	function loadProject(gooRunner) {
		/**
		 * Callback for the loading screen.
		 *
		 * @param  {number} handled
		 * @param  {number} total
		 */
		var progressCallback = function (handled, total) {
			var loadedPercent = (100 * handled / total).toFixed();
			var progress = document.getElementById("progress");

			progress.style.width = loadedPercent + "%";
		};

		// The loader takes care of loading the data.
		var loader = new DynamicLoader({
			world: gooRunner.world,
			rootPath: 'res'
		});

		return loader.load('root.bundle', {
			preloadBinaries: true,
			progressCallback: progressCallback
		}).then(function(result) {
			var project = null;

			// Try to get the first project in the bundle.
			for (var key in result) {
				if (/\.project$/.test(key)) {
					project = result[key];
					break;
				}
			}

			

			if (!project || !project.id) {
				alert('Error: No project in bundle'); // Should never happen.
				return null;
			}

			// Setup the canvas configuration (sizing mode, resolution, aspect
			// ratio, etc).
			var scene = result[project.mainSceneRef];
			var canvasConfig = scene ? scene.canvas : {};
			CanvasWrapper.setup(gooRunner.renderer.domElement, canvasConfig);
			CanvasWrapper.add();
			CanvasWrapper.hide();

			return loader.load(project.id);
		});
	}
	init();
});