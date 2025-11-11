/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { proxyCustomElement, HTMLElement, createEvent, h, Host } from '@stencil/core/internal/client';
import { c as createKeyboardController } from './keyboard-controller.js';
import { c as createColorClasses } from './theme.js';
import { b as getIonMode } from './ionic-global.js';

const tabBarIosCss = ":host{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:auto;padding-right:var(--ion-safe-area-right);padding-bottom:var(--ion-safe-area-bottom, 0);padding-left:var(--ion-safe-area-left);border-top:var(--border);background:var(--background);color:var(--color);text-align:center;contain:strict;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:10;-webkit-box-sizing:content-box !important;box-sizing:content-box !important}:host(.ion-color) ::slotted(ion-tab-button){--background-focused:var(--ion-color-shade);--color-selected:var(--ion-color-contrast)}:host(.ion-color) ::slotted(.tab-selected){color:var(--ion-color-contrast)}:host(.ion-color),:host(.ion-color) ::slotted(ion-tab-button){color:rgba(var(--ion-color-contrast-rgb), 0.7)}:host(.ion-color),:host(.ion-color) ::slotted(ion-tab-button){background:var(--ion-color-base)}:host(.ion-color) ::slotted(ion-tab-button.ion-focused),:host(.tab-bar-translucent) ::slotted(ion-tab-button.ion-focused){background:var(--background-focused)}:host(.tab-bar-translucent) ::slotted(ion-tab-button){background:transparent}:host([slot=top]){padding-top:var(--ion-safe-area-top, 0);padding-bottom:0;border-top:0;border-bottom:var(--border)}:host(.tab-bar-hidden){display:none !important}:host{--background:var(--ion-tab-bar-background, var(--ion-color-step-50, var(--ion-background-color-step-50, #f7f7f7)));--background-focused:var(--ion-tab-bar-background-focused, #e0e0e0);--border:0.55px solid var(--ion-tab-bar-border-color, var(--ion-border-color, var(--ion-color-step-150, var(--ion-background-color-step-150, rgba(0, 0, 0, 0.2)))));--color:var(--ion-tab-bar-color, var(--ion-color-step-600, var(--ion-text-color-step-400, #666666)));--color-selected:var(--ion-tab-bar-color-selected, var(--ion-color-primary, #0054e9));height:50px}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){:host(.tab-bar-translucent){--background:rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8);-webkit-backdrop-filter:saturate(210%) blur(20px);backdrop-filter:saturate(210%) blur(20px)}:host(.ion-color.tab-bar-translucent){background:rgba(var(--ion-color-base-rgb), 0.8)}:host(.tab-bar-translucent) ::slotted(ion-tab-button.ion-focused){background:rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.6)}}";

const tabBarMdCss = ":host{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:auto;padding-right:var(--ion-safe-area-right);padding-bottom:var(--ion-safe-area-bottom, 0);padding-left:var(--ion-safe-area-left);border-top:var(--border);background:var(--background);color:var(--color);text-align:center;contain:strict;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:10;-webkit-box-sizing:content-box !important;box-sizing:content-box !important}:host(.ion-color) ::slotted(ion-tab-button){--background-focused:var(--ion-color-shade);--color-selected:var(--ion-color-contrast)}:host(.ion-color) ::slotted(.tab-selected){color:var(--ion-color-contrast)}:host(.ion-color),:host(.ion-color) ::slotted(ion-tab-button){color:rgba(var(--ion-color-contrast-rgb), 0.7)}:host(.ion-color),:host(.ion-color) ::slotted(ion-tab-button){background:var(--ion-color-base)}:host(.ion-color) ::slotted(ion-tab-button.ion-focused),:host(.tab-bar-translucent) ::slotted(ion-tab-button.ion-focused){background:var(--background-focused)}:host(.tab-bar-translucent) ::slotted(ion-tab-button){background:transparent}:host([slot=top]){padding-top:var(--ion-safe-area-top, 0);padding-bottom:0;border-top:0;border-bottom:var(--border)}:host(.tab-bar-hidden){display:none !important}:host{--background:var(--ion-tab-bar-background, var(--ion-background-color, #fff));--background-focused:var(--ion-tab-bar-background-focused, #e0e0e0);--border:1px solid var(--ion-tab-bar-border-color, var(--ion-border-color, var(--ion-color-step-150, var(--ion-background-color-step-150, rgba(0, 0, 0, 0.07)))));--color:var(--ion-tab-bar-color, var(--ion-color-step-650, var(--ion-text-color-step-350, #595959)));--color-selected:var(--ion-tab-bar-color-selected, var(--ion-color-primary, #0054e9));height:56px}";

const TabBar = /*@__PURE__*/ proxyCustomElement(class TabBar extends HTMLElement {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.ionTabBarChanged = createEvent(this, "ionTabBarChanged", 7);
        this.ionTabBarLoaded = createEvent(this, "ionTabBarLoaded", 7);
        this.keyboardCtrl = null;
        this.didLoad = false;
        this.keyboardVisible = false;
        /**
         * If `true`, the tab bar will be translucent.
         * Only applies when the mode is `"ios"` and the device supports
         * [`backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter#Browser_compatibility).
         */
        this.translucent = false;
    }
    selectedTabChanged() {
        // Skip the initial watcher call that happens during component load
        // We handle that in componentDidLoad to ensure children are ready
        if (!this.didLoad) {
            return;
        }
        if (this.selectedTab !== undefined) {
            this.ionTabBarChanged.emit({
                tab: this.selectedTab,
            });
        }
    }
    componentDidLoad() {
        this.ionTabBarLoaded.emit();
        // Set the flag to indicate the component has loaded
        // This allows the watcher to emit changes from this point forward
        this.didLoad = true;
        // Emit the initial selected tab after the component is fully loaded
        // This ensures all child components (ion-tab-button) are ready
        if (this.selectedTab !== undefined) {
            this.ionTabBarChanged.emit({
                tab: this.selectedTab,
            });
        }
    }
    async connectedCallback() {
        this.keyboardCtrl = await createKeyboardController(async (keyboardOpen, waitForResize) => {
            /**
             * If the keyboard is hiding, then we need to wait
             * for the webview to resize. Otherwise, the tab bar
             * will flicker before the webview resizes.
             */
            if (keyboardOpen === false && waitForResize !== undefined) {
                await waitForResize;
            }
            this.keyboardVisible = keyboardOpen; // trigger re-render by updating state
        });
    }
    disconnectedCallback() {
        if (this.keyboardCtrl) {
            this.keyboardCtrl.destroy();
        }
    }
    render() {
        const { color, translucent, keyboardVisible } = this;
        const mode = getIonMode(this);
        const shouldHide = keyboardVisible && this.el.getAttribute('slot') !== 'top';
        return (h(Host, { key: '388ec37ce308035bab78d6c9a016bb616e9517a9', role: "tablist", "aria-hidden": shouldHide ? 'true' : null, class: createColorClasses(color, {
                [mode]: true,
                'tab-bar-translucent': translucent,
                'tab-bar-hidden': shouldHide,
            }) }, h("slot", { key: 'ce10ade2b86725e24f3254516483eeedd8ecb16a' })));
    }
    get el() { return this; }
    static get watchers() { return {
        "selectedTab": ["selectedTabChanged"]
    }; }
    static get style() { return {
        ios: tabBarIosCss,
        md: tabBarMdCss
    }; }
}, [289, "ion-tab-bar", {
        "color": [513],
        "selectedTab": [1, "selected-tab"],
        "translucent": [4],
        "keyboardVisible": [32]
    }, undefined, {
        "selectedTab": ["selectedTabChanged"]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["ion-tab-bar"];
    components.forEach(tagName => { switch (tagName) {
        case "ion-tab-bar":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, TabBar);
            }
            break;
    } });
}

const IonTabBar = TabBar;
const defineCustomElement = defineCustomElement$1;

export { IonTabBar, defineCustomElement };
