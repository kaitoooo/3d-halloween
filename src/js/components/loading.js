import { gsap } from 'gsap';

export default class Loading {
    constructor() {
        this.elms = {
            loadingWrap: document.querySelector('[data-loading="wrap"]'),
            loadingTitle: document.querySelectorAll('[data-loading="title"]'),
        };
        this.addClass = 'is-active';
        this.init();
    }
    init() {
        this.start();
    }
    start() {
        // this.elms.loadingTitle.forEach((target) => {
        //     target.classList.add(this.addClass);
        // });

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
                opacity: 0,
            },
            2.3
        );
        tl.play();
    }
}
