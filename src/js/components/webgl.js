import * as THREE from 'three/build/three.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { throttle } from '../utils/throttle';
import { gsap } from 'gsap';
const OrbitControls = require('three-orbitcontrols');

export default class Webgl {
    constructor() {
        this.wd = window.innerWidth;
        this.wh = window.innerHeight;
        this.halfWd = window.innerWidth * 0.5;
        this.halfWh = window.innerHeight * 0.5;
        this.elms = {
            canvas: document.querySelector('[data-canvas]'),
            loadingWrap: document.querySelector('[data-loading="wrap"]'),
            loadingTitle: document.querySelectorAll('[data-loading="title"]'),
            mvLinks: document.querySelectorAll('[data-mv="link"]'),
            mvTitle: document.querySelectorAll('[data-mv="title"]'),
            mvFinger: document.querySelector('[data-mv="finger"]'),
            mvCircle: document.querySelector('[data-mv="circle"]'),
        };
        this.three = {
            scene: null,
            renderer: null,
            camera: null,
            redraw: null,
            mixer: null,
            clock: null,
            controls: null,
            animations: null,
            cameraFov: 50,
            cameraAspect: window.innerWidth / window.innerHeight,
        };
        this.addClass = 'is-active';
        this.srcObj = './obj/pumpkin.gltf';
        this.flg = {
            loaded: false,
        };
        this.mousePos = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            moveX: 0.004,
            moveY: 0.002,
        };
        this.sp = 768;
        this.spSize = 769;
        this.ua = window.navigator.userAgent.toLowerCase();
        this.mq = window.matchMedia('(max-width: 768px)');
        this.init();
    }
    init() {
        this.getLayout();
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.setLoading();
        this.setLight();
        this.handleEvents();
        if (this.ua.indexOf('msie') !== -1 || this.ua.indexOf('trident') !== -1) {
            return;
        } else {
            this.mq.addEventListener('change', this.getLayout.bind(this));
        }
    }
    getLayout() {
        this.sp = this.mq.matches ? true : false;
    }
    initScene() {
        this.three.scene = new THREE.Scene();
    }
    initCamera() {
        this.three.camera = new THREE.PerspectiveCamera(this.three.cameraFov, this.wd / this.wh, this.three.cameraAspect, 1000); //(?????????, ???????????????, near, far)
        this.three.camera.position.set(0, 0, 9);
    }
    initRenderer() {
        // ?????????????????????????????????
        this.three.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true, //????????????????????????????????????????????????????????????
        });
        // this.three.renderer.setClearColor(0xffffff); //?????????
        this.three.renderer.setPixelRatio(window.devicePixelRatio);
        this.three.renderer.setSize(this.wd, this.wh);
        this.three.renderer.physicallyCorrectLights = true;
        this.three.renderer.shadowMap.enabled = true;
        this.three.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.elms.canvas.appendChild(this.three.renderer.domElement);
        this.three.renderer.outputEncoding = THREE.GammaEncoding;

        if (this.wd <= this.spSize) {
            // OrbitControls?????????
            this.three.controls = new OrbitControls(this.three.camera, this.three.renderer.domElement);
            this.three.controls.enableDamping = true;
            this.three.controls.dampingFactor = 0.25;
            this.three.controls.enableZoom = false;
        }
    }
    setLight() {
        const ambientLight = new THREE.AmbientLight(0x666666);
        this.three.scene.add(ambientLight);
    }
    setLoading() {
        const loader = new GLTFLoader();
        this.three.clock = new THREE.Clock();
        loader.load(this.srcObj, (obj) => {
            const gltf = obj;
            const data = gltf.scene;
            data.scale.set(this.sp ? 0.5 : 0.8, this.sp ? 0.5 : 0.8, this.sp ? 0.5 : 0.8);
            data.position.set(this.sp ? 0 : -3.1, 0, 0);
            this.three.animations = gltf.animations;

            if (this.three.animations && this.three.animations.length) {
                //Animation Mixer???????????????????????????
                this.three.mixer = new THREE.AnimationMixer(data);

                //?????????Animation Clip????????????
                for (let i = 0; i < this.three.animations.length; i++) {
                    const animation = this.three.animations[i];
                    //Animation Action?????????
                    const action = this.three.mixer.clipAction(animation);

                    // //??????????????????1????????????
                    // action.setLoop(THREE.LoopOnce);

                    //???????????????????????????
                    action.setLoop(THREE.Loop);
                    //??????????????????????????????????????????????????????????????????????????????
                    action.clampWhenFinished = true;
                    //??????????????????????????????
                    action.play();
                }
            }
            this.three.redraw = data;
            this.three.scene.add(data);
            this.flg.loaded = true;
            this.rendering();
        });
    }
    rendering() {
        if (this.three.mixer) {
            this.three.mixer.update(this.three.clock.getDelta());
        }
        // ???????????????????????????
        this.mousePos.x += (this.mousePos.targetX - this.mousePos.x) * this.mousePos.moveX;
        this.mousePos.y += (this.mousePos.targetY - this.mousePos.y) * this.mousePos.moveY;

        this.three.redraw.rotation.y = 0 - this.mousePos.x * 0.2; //??????????????????????????????3d?????????????????????
        this.three.camera.position.y = this.mousePos.y * 0.8; //??????????????????????????????3d?????????????????????
        requestAnimationFrame(this.rendering.bind(this));
        this.three.renderer.render(this.three.scene, this.three.camera);
        this.animate(); // ???????????????????????????
    }
    animate() {
        gsap.config({
            force3D: true,
        });
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                duration: 0.6,
                ease: 'power2.easeOut',
            },
        });
        tl.to(this.elms.loadingTitle, {
            className: '+=loading__text is-active',
        });
        tl.to(
            this.elms.loadingWrap,
            {
                duration: 0.8,
                opacity: 0,
            },
            3.3
        );
        tl.to(
            this.elms.mvTitle,
            {
                opacity: 1,
            },
            4
        );
        tl.to(
            this.elms.mvLinks,
            {
                opacity: 1,
            },
            4
        );
        tl.to(
            this.elms.mvFinger,
            {
                opacity: 1,
            },
            4
        ).to(
            this.elms.mvCircle,
            {
                opacity: 1,
            },
            '<'
        );
        tl.to(
            this.elms.loadingWrap,
            {
                visibility: 'hidden',
            },
            4.3
        );
        tl.play();
    }
    handleEvents() {
        window.addEventListener('pointermove', this.handleMouse.bind(this), false);
        window.addEventListener('resize', throttle(this.handleResize.bind(this)), false);
    }
    handleResize() {
        // ??????????????????
        if (this.wd !== window.innerWidth) {
            this.wd = window.innerWidth;
            this.wh = window.innerHeight;
            this.halfWd = window.innerWidth * 0.5;
            this.halfWh = window.innerHeight * 0.5;
            this.three.cameraAspect = this.wd / this.wh;
            this.three.camera.aspect = this.wd / this.wh;
            this.three.camera.updateProjectionMatrix();
            this.three.renderer.setSize(this.wd, this.wh);
            this.three.renderer.setPixelRatio(window.devicePixelRatio);
        }
    }
    handleMouse(event) {
        this.mousePos.targetX = (this.halfWd - event.clientX) / this.halfWd;
        this.mousePos.targetY = (this.halfWh - event.clientY) / this.halfWh;
    }
}
