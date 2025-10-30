import {
  __async
} from "./chunk-MHH6U7NA.js";

// node_modules/@ionic/core/dist/esm/lock-controller-B-hirT0v.js
var createLockController = () => {
  let waitPromise;
  const lock = () => __async(null, null, function* () {
    const p = waitPromise;
    let resolve;
    waitPromise = new Promise((r) => resolve = r);
    if (p !== void 0) {
      yield p;
    }
    return resolve;
  });
  return {
    lock
  };
};

export {
  createLockController
};
/*! Bundled license information:

@ionic/core/dist/esm/lock-controller-B-hirT0v.js:
  (*!
   * (C) Ionic http://ionicframework.com - MIT License
   *)
*/
//# sourceMappingURL=chunk-O7IEAD6V.js.map
