import { createComputation, read, write, isFunction, update, dispose, onDispose } from './core.js';
import { SCOPE } from './symbols.js';

function signal(initialValue, options) {
  const node = createComputation(initialValue, null, options), signal2 = read.bind(node);
  signal2[SCOPE] = true;
  signal2.set = write.bind(node);
  return signal2;
}
function isReadSignal(fn) {
  return isFunction(fn) && SCOPE in fn;
}
function computed(compute, options) {
  const node = createComputation(
    options?.initial,
    compute,
    options
  ), signal2 = read.bind(node);
  signal2[SCOPE] = true;
  return signal2;
}
function effect(effect2, options) {
  const signal2 = createComputation(
    null,
    function runEffect() {
      let effectResult = effect2();
      isFunction(effectResult) && onDispose(effectResult);
      return null;
    },
    void 0
  );
  signal2.$e = true;
  update(signal2);
  return dispose.bind(signal2, true);
}
function readonly(signal2) {
  const readonly2 = () => signal2();
  readonly2[SCOPE] = true;
  return readonly2;
}
function isWriteSignal(fn) {
  return isReadSignal(fn) && "set" in fn;
}

export { computed, effect, isReadSignal, isWriteSignal, readonly, signal };
