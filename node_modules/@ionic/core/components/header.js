/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { readTask, writeTask, proxyCustomElement, HTMLElement, h, Host } from '@stencil/core/internal/client';
import { g as getScrollElement, f as findIonContent, p as printIonContentErrorMsg } from './index8.js';
import { f as clamp, i as inheritAriaAttributes } from './helpers.js';
import { h as hostContext } from './theme.js';
import { b as getIonMode } from './ionic-global.js';

const TRANSITION = 'all 0.2s ease-in-out';
const ROLE_NONE = 'none';
const ROLE_BANNER = 'banner';
const cloneElement = (tagName) => {
    const getCachedEl = document.querySelector(`${tagName}.ion-cloned-element`);
    if (getCachedEl !== null) {
        return getCachedEl;
    }
    const clonedEl = document.createElement(tagName);
    clonedEl.classList.add('ion-cloned-element');
    clonedEl.style.setProperty('display', 'none');
    document.body.appendChild(clonedEl);
    return clonedEl;
};
const createHeaderIndex = (headerEl) => {
    if (!headerEl) {
        return;
    }
    const toolbars = headerEl.querySelectorAll('ion-toolbar');
    return {
        el: headerEl,
        toolbars: Array.from(toolbars).map((toolbar) => {
            const ionTitleEl = toolbar.querySelector('ion-title');
            return {
                el: toolbar,
                background: toolbar.shadowRoot.querySelector('.toolbar-background'),
                ionTitleEl,
                innerTitleEl: ionTitleEl ? ionTitleEl.shadowRoot.querySelector('.toolbar-title') : null,
                ionButtonsEl: Array.from(toolbar.querySelectorAll('ion-buttons')),
            };
        }),
    };
};
const handleContentScroll = (scrollEl, scrollHeaderIndex, contentEl) => {
    readTask(() => {
        const scrollTop = scrollEl.scrollTop;
        const scale = clamp(1, 1 + -scrollTop / 500, 1.1);
        // Native refresher should not cause titles to scale
        const nativeRefresher = contentEl.querySelector('ion-refresher.refresher-native');
        if (nativeRefresher === null) {
            writeTask(() => {
                scaleLargeTitles(scrollHeaderIndex.toolbars, scale);
            });
        }
    });
};
const setToolbarBackgroundOpacity = (headerEl, opacity) => {
    /**
     * Fading in the backdrop opacity
     * should happen after the large title
     * has collapsed, so it is handled
     * by handleHeaderFade()
     */
    if (headerEl.collapse === 'fade') {
        return;
    }
    if (opacity === undefined) {
        headerEl.style.removeProperty('--opacity-scale');
    }
    else {
        headerEl.style.setProperty('--opacity-scale', opacity.toString());
    }
};
const handleToolbarBorderIntersection = (ev, mainHeaderIndex, scrollTop) => {
    if (!ev[0].isIntersecting) {
        return;
    }
    /**
     * There is a bug in Safari where overflow scrolling on a non-body element
     * does not always reset the scrollTop position to 0 when letting go. It will
     * set to 1 once the rubber band effect has ended. This causes the background to
     * appear slightly on certain app setups.
     *
     * Additionally, we check if user is rubber banding (scrolling is negative)
     * as this can mean they are using pull to refresh. Once the refresher starts,
     * the content is transformed which can cause the intersection observer to erroneously
     * fire here as well.
     */
    const scale = ev[0].intersectionRatio > 0.9 || scrollTop <= 0 ? 0 : ((1 - ev[0].intersectionRatio) * 100) / 75;
    setToolbarBackgroundOpacity(mainHeaderIndex.el, scale === 1 ? undefined : scale);
};
/**
 * If toolbars are intersecting, hide the scrollable toolbar content
 * and show the primary toolbar content. If the toolbars are not intersecting,
 * hide the primary toolbar content and show the scrollable toolbar content
 */
const handleToolbarIntersection = (ev, // TODO(FW-2832): type (IntersectionObserverEntry[] triggers errors which should be sorted)
mainHeaderIndex, scrollHeaderIndex, scrollEl) => {
    writeTask(() => {
        const scrollTop = scrollEl.scrollTop;
        handleToolbarBorderIntersection(ev, mainHeaderIndex, scrollTop);
        const event = ev[0];
        const intersection = event.intersectionRect;
        const intersectionArea = intersection.width * intersection.height;
        const rootArea = event.rootBounds.width * event.rootBounds.height;
        const isPageHidden = intersectionArea === 0 && rootArea === 0;
        const leftDiff = Math.abs(intersection.left - event.boundingClientRect.left);
        const rightDiff = Math.abs(intersection.right - event.boundingClientRect.right);
        const isPageTransitioning = intersectionArea > 0 && (leftDiff >= 5 || rightDiff >= 5);
        if (isPageHidden || isPageTransitioning) {
            return;
        }
        if (event.isIntersecting) {
            setHeaderActive(mainHeaderIndex, false);
            setHeaderActive(scrollHeaderIndex);
        }
        else {
            /**
             * There is a bug with IntersectionObserver on Safari
             * where `event.isIntersecting === false` when cancelling
             * a swipe to go back gesture. Checking the intersection
             * x, y, width, and height provides a workaround. This bug
             * does not happen when using Safari + Web Animations,
             * only Safari + CSS Animations.
             */
            const hasValidIntersection = (intersection.x === 0 && intersection.y === 0) || (intersection.width !== 0 && intersection.height !== 0);
            if (hasValidIntersection && scrollTop > 0) {
                setHeaderActive(mainHeaderIndex);
                setHeaderActive(scrollHeaderIndex, false);
                setToolbarBackgroundOpacity(mainHeaderIndex.el);
            }
        }
    });
};
const setHeaderActive = (headerIndex, active = true) => {
    const headerEl = headerIndex.el;
    const toolbars = headerIndex.toolbars;
    const ionTitles = toolbars.map((toolbar) => toolbar.ionTitleEl);
    if (active) {
        headerEl.setAttribute('role', ROLE_BANNER);
        headerEl.classList.remove('header-collapse-condense-inactive');
        ionTitles.forEach((ionTitle) => {
            if (ionTitle) {
                ionTitle.removeAttribute('aria-hidden');
            }
        });
    }
    else {
        /**
         * There can only be one banner landmark per page.
         * By default, all ion-headers have the banner role.
         * This causes an accessibility issue when using a
         * condensed header since there are two ion-headers
         * on the page at once (active and inactive).
         * To solve this, the role needs to be toggled
         * based on which header is active.
         */
        headerEl.setAttribute('role', ROLE_NONE);
        headerEl.classList.add('header-collapse-condense-inactive');
        /**
         * The small title should only be accessed by screen readers
         * when the large title collapses into the small title due
         * to scrolling.
         *
         * Originally, the header was given `aria-hidden="true"`
         * but this caused issues with screen readers not being
         * able to access any focusable elements within the header.
         */
        ionTitles.forEach((ionTitle) => {
            if (ionTitle) {
                ionTitle.setAttribute('aria-hidden', 'true');
            }
        });
    }
};
const scaleLargeTitles = (toolbars = [], scale = 1, transition = false) => {
    toolbars.forEach((toolbar) => {
        const ionTitle = toolbar.ionTitleEl;
        const titleDiv = toolbar.innerTitleEl;
        if (!ionTitle || ionTitle.size !== 'large') {
            return;
        }
        titleDiv.style.transition = transition ? TRANSITION : '';
        titleDiv.style.transform = `scale3d(${scale}, ${scale}, 1)`;
    });
};
const handleHeaderFade = (scrollEl, baseEl, condenseHeader) => {
    readTask(() => {
        const scrollTop = scrollEl.scrollTop;
        const baseElHeight = baseEl.clientHeight;
        const fadeStart = condenseHeader ? condenseHeader.clientHeight : 0;
        /**
         * If we are using fade header with a condense
         * header, then the toolbar backgrounds should
         * not begin to fade in until the condense
         * header has fully collapsed.
         *
         * Additionally, the main content should not
         * overflow out of the container until the
         * condense header has fully collapsed. When
         * using just the condense header the content
         * should overflow out of the container.
         */
        if (condenseHeader !== null && scrollTop < fadeStart) {
            baseEl.style.setProperty('--opacity-scale', '0');
            scrollEl.style.setProperty('clip-path', `inset(${baseElHeight}px 0px 0px 0px)`);
            return;
        }
        const distanceToStart = scrollTop - fadeStart;
        const fadeDuration = 10;
        const scale = clamp(0, distanceToStart / fadeDuration, 1);
        writeTask(() => {
            scrollEl.style.removeProperty('clip-path');
            baseEl.style.setProperty('--opacity-scale', scale.toString());
        });
    });
};
/**
 * Get the role type for the ion-header.
 *
 * @param isInsideMenu If ion-header is inside ion-menu.
 * @param isCondensed If ion-header has collapse="condense".
 * @param mode The current mode.
 * @returns 'none' if inside ion-menu or if condensed in md
 * mode, otherwise 'banner'.
 */
const getRoleType = (isInsideMenu, isCondensed, mode) => {
    // If the header is inside a menu, it should not have the banner role.
    if (isInsideMenu) {
        return ROLE_NONE;
    }
    /**
     * Only apply role="none" to `md` mode condensed headers
     * since the large header is never shown.
     */
    if (isCondensed && mode === 'md') {
        return ROLE_NONE;
    }
    // Default to banner role.
    return ROLE_BANNER;
};

const headerIosCss = "ion-header{display:block;position:relative;-ms-flex-order:-1;order:-1;width:100%;z-index:10}ion-header ion-toolbar:first-of-type{padding-top:var(--ion-safe-area-top, 0)}.header-ios ion-toolbar:last-of-type{--border-width:0 0 0.55px}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){.header-background{left:0;right:0;top:0;bottom:0;position:absolute;-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}.header-translucent-ios ion-toolbar{--opacity:.8}.header-collapse-condense-inactive .header-background{-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px)}}.header-ios.ion-no-border ion-toolbar:last-of-type{--border-width:0}.header-collapse-fade ion-toolbar{--opacity-scale:inherit}.header-collapse-fade.header-transitioning ion-toolbar{--background:transparent;--border-style:none}.header-collapse-condense{z-index:9}.header-collapse-condense ion-toolbar{position:-webkit-sticky;position:sticky;top:0}.header-collapse-condense ion-toolbar:first-of-type{padding-top:0px;z-index:1}.header-collapse-condense ion-toolbar{z-index:0}.header-collapse-condense ion-toolbar:last-of-type{--border-width:0px}.header-collapse-condense ion-toolbar ion-searchbar{padding-top:0px;padding-bottom:13px}.header-collapse-main{--opacity-scale:1}.header-collapse-main ion-toolbar{--opacity-scale:inherit}.header-collapse-main ion-toolbar.in-toolbar ion-title,.header-collapse-main ion-toolbar.in-toolbar ion-buttons{-webkit-transition:all 0.2s ease-in-out;transition:all 0.2s ease-in-out}.header-collapse-condense ion-toolbar,.header-collapse-condense-inactive.header-transitioning:not(.header-collapse-condense) ion-toolbar{--background:var(--ion-background-color, #fff)}.header-collapse-condense-inactive.header-transitioning:not(.header-collapse-condense) ion-toolbar{--border-style:none;--opacity-scale:1}.header-collapse-condense-inactive:not(.header-collapse-condense) ion-toolbar.in-toolbar ion-title,.header-collapse-condense-inactive:not(.header-collapse-condense) ion-toolbar.in-toolbar ion-buttons.buttons-collapse{opacity:0;pointer-events:none}.header-collapse-condense-inactive.header-collapse-condense ion-toolbar.in-toolbar ion-title,.header-collapse-condense-inactive.header-collapse-condense ion-toolbar.in-toolbar ion-buttons.buttons-collapse{visibility:hidden}ion-header.header-ios:not(.header-collapse-main):has(~ion-content ion-header.header-ios[collapse=condense],~ion-content ion-header.header-ios.header-collapse-condense){opacity:0}";

const headerMdCss = "ion-header{display:block;position:relative;-ms-flex-order:-1;order:-1;width:100%;z-index:10}ion-header ion-toolbar:first-of-type{padding-top:var(--ion-safe-area-top, 0)}.header-md{-webkit-box-shadow:0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);box-shadow:0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12)}.header-collapse-condense{display:none}.header-md.ion-no-border{-webkit-box-shadow:none;box-shadow:none}";

const Header = /*@__PURE__*/ proxyCustomElement(class Header extends HTMLElement {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.inheritedAttributes = {};
        /**
         * If `true`, the header will be translucent.
         * Only applies when the mode is `"ios"` and the device supports
         * [`backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter#Browser_compatibility).
         *
         * Note: In order to scroll content behind the header, the `fullscreen`
         * attribute needs to be set on the content.
         */
        this.translucent = false;
        this.setupFadeHeader = async (contentEl, condenseHeader) => {
            const scrollEl = (this.scrollEl = await getScrollElement(contentEl));
            /**
             * Handle fading of toolbars on scroll
             */
            this.contentScrollCallback = () => {
                handleHeaderFade(this.scrollEl, this.el, condenseHeader);
            };
            scrollEl.addEventListener('scroll', this.contentScrollCallback);
            handleHeaderFade(this.scrollEl, this.el, condenseHeader);
        };
    }
    componentWillLoad() {
        this.inheritedAttributes = inheritAriaAttributes(this.el);
    }
    componentDidLoad() {
        this.checkCollapsibleHeader();
    }
    componentDidUpdate() {
        this.checkCollapsibleHeader();
    }
    disconnectedCallback() {
        this.destroyCollapsibleHeader();
    }
    async checkCollapsibleHeader() {
        const mode = getIonMode(this);
        if (mode !== 'ios') {
            return;
        }
        const { collapse } = this;
        const hasCondense = collapse === 'condense';
        const hasFade = collapse === 'fade';
        this.destroyCollapsibleHeader();
        if (hasCondense) {
            const pageEl = this.el.closest('ion-app,ion-page,.ion-page,page-inner');
            const contentEl = pageEl ? findIonContent(pageEl) : null;
            // Cloned elements are always needed in iOS transition
            writeTask(() => {
                const title = cloneElement('ion-title');
                title.size = 'large';
                cloneElement('ion-back-button');
            });
            await this.setupCondenseHeader(contentEl, pageEl);
        }
        else if (hasFade) {
            const pageEl = this.el.closest('ion-app,ion-page,.ion-page,page-inner');
            const contentEl = pageEl ? findIonContent(pageEl) : null;
            if (!contentEl) {
                printIonContentErrorMsg(this.el);
                return;
            }
            const condenseHeader = contentEl.querySelector('ion-header[collapse="condense"]');
            await this.setupFadeHeader(contentEl, condenseHeader);
        }
    }
    destroyCollapsibleHeader() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = undefined;
        }
        if (this.scrollEl && this.contentScrollCallback) {
            this.scrollEl.removeEventListener('scroll', this.contentScrollCallback);
            this.contentScrollCallback = undefined;
        }
        if (this.collapsibleMainHeader) {
            this.collapsibleMainHeader.classList.remove('header-collapse-main');
            this.collapsibleMainHeader = undefined;
        }
    }
    async setupCondenseHeader(contentEl, pageEl) {
        if (!contentEl || !pageEl) {
            printIonContentErrorMsg(this.el);
            return;
        }
        if (typeof IntersectionObserver === 'undefined') {
            return;
        }
        this.scrollEl = await getScrollElement(contentEl);
        const headers = pageEl.querySelectorAll('ion-header');
        this.collapsibleMainHeader = Array.from(headers).find((header) => header.collapse !== 'condense');
        if (!this.collapsibleMainHeader) {
            return;
        }
        const mainHeaderIndex = createHeaderIndex(this.collapsibleMainHeader);
        const scrollHeaderIndex = createHeaderIndex(this.el);
        if (!mainHeaderIndex || !scrollHeaderIndex) {
            return;
        }
        setHeaderActive(mainHeaderIndex, false);
        setToolbarBackgroundOpacity(mainHeaderIndex.el, 0);
        /**
         * Handle interaction between toolbar collapse and
         * showing/hiding content in the primary ion-header
         * as well as progressively showing/hiding the main header
         * border as the top-most toolbar collapses or expands.
         */
        const toolbarIntersection = (ev) => {
            handleToolbarIntersection(ev, mainHeaderIndex, scrollHeaderIndex, this.scrollEl);
        };
        this.intersectionObserver = new IntersectionObserver(toolbarIntersection, {
            root: contentEl,
            threshold: [0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        });
        this.intersectionObserver.observe(scrollHeaderIndex.toolbars[scrollHeaderIndex.toolbars.length - 1].el);
        /**
         * Handle scaling of large iOS titles and
         * showing/hiding border on last toolbar
         * in primary header
         */
        this.contentScrollCallback = () => {
            handleContentScroll(this.scrollEl, scrollHeaderIndex, contentEl);
        };
        this.scrollEl.addEventListener('scroll', this.contentScrollCallback);
        writeTask(() => {
            if (this.collapsibleMainHeader !== undefined) {
                this.collapsibleMainHeader.classList.add('header-collapse-main');
            }
        });
    }
    render() {
        const { translucent, inheritedAttributes } = this;
        const mode = getIonMode(this);
        const collapse = this.collapse || 'none';
        const isCondensed = collapse === 'condense';
        // banner role must be at top level, so remove role if inside a menu
        const roleType = getRoleType(hostContext('ion-menu', this.el), isCondensed, mode);
        return (h(Host, Object.assign({ key: '863c4568cd7b8c0ec55109f193bbbaed68a1346e', role: roleType, class: {
                [mode]: true,
                // Used internally for styling
                [`header-${mode}`]: true,
                [`header-translucent`]: this.translucent,
                [`header-collapse-${collapse}`]: true,
                [`header-translucent-${mode}`]: this.translucent,
            } }, inheritedAttributes), mode === 'ios' && translucent && h("div", { key: '25c3bdce328b0b35607d154c8b8374679313d881', class: "header-background" }), h("slot", { key: 'b44fab0a9be7920b9650da26117c783e751e1702' })));
    }
    get el() { return this; }
    static get style() { return {
        ios: headerIosCss,
        md: headerMdCss
    }; }
}, [292, "ion-header", {
        "collapse": [1],
        "translucent": [4]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["ion-header"];
    components.forEach(tagName => { switch (tagName) {
        case "ion-header":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, Header);
            }
            break;
    } });
}

export { Header as H, defineCustomElement as d };
