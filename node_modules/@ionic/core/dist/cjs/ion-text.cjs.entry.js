/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
'use strict';

var index = require('./index-D6Wc6v08.js');
var theme = require('./theme-CeDs6Hcv.js');
var ionicGlobal = require('./ionic-global-HMVqOFGO.js');

const textCss = ":host(.ion-color){color:var(--ion-color-base)}";

const Text = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    render() {
        const mode = ionicGlobal.getIonMode(this);
        return (index.h(index.Host, { key: '361035eae7b92dc109794348d39bad2f596eb6be', class: theme.createColorClasses(this.color, {
                [mode]: true,
            }) }, index.h("slot", { key: 'c7b8835cf485ba9ecd73298f0529276ce1ea0852' })));
    }
};
Text.style = textCss;

exports.ion_text = Text;
