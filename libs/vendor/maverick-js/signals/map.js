import { onDispose, read, isNotEqual, write, createComputation, createScope, scoped, dispose, compute } from './core.js';
import { effect } from './signals.js';
import './symbols.js';

function selector(source) {
  let currentKey, nodes = /* @__PURE__ */ new Map();
  effect(() => {
    const newKey = source(), prev = nodes.get(currentKey), next = nodes.get(newKey);
    prev && write.call(prev, false);
    next && write.call(next, true);
    currentKey = newKey;
  });
  return function observeSelector(key) {
    let node = nodes.get(key);
    if (!node)
      nodes.set(key, node = new Selector(key, key === currentKey, nodes));
    node.$r += 1;
    onDispose(node);
    return read.bind(node);
  };
}
function Selector(key, initialValue, nodes) {
  this.$st = /** CLEAN */
  0;
  this.$k = key;
  this.$v = initialValue;
  this.$r = 0;
  this.$n = nodes;
  this.$o = null;
}
const SelectorProto = Selector.prototype;
SelectorProto.$ch = isNotEqual;
SelectorProto.call = function() {
  this.$r -= 1;
  if (!this.$r) {
    this.$n.delete(this.$k);
    this.$n = null;
  }
};

function computedMap(list, map, options) {
  return read.bind(
    createComputation(
      [],
      updateMap.bind({
        d: createScope(),
        c: 0,
        f: list,
        b: [],
        e: map,
        a: [],
        $n: []
      }),
      options
    )
  );
}
function updateMap() {
  let i = 0, newItems = this.f() || [], mapper = () => this.e(read.bind(this.$n[i]), i);
  scoped(() => {
    if (newItems.length === 0) {
      if (this.c !== 0) {
        dispose.call(this.d, false);
        this.b = [];
        this.a = [];
        this.c = 0;
        this.$n = [];
      }
      return;
    }
    for (i = 0; i < newItems.length; i++) {
      if (i < this.b.length && this.b[i] !== newItems[i]) {
        write.call(this.$n[i], newItems[i]);
      } else if (i >= this.b.length) {
        this.a[i] = compute(
          this.$n[i] = createComputation(newItems[i], null),
          mapper,
          null
        );
      }
    }
    for (; i < this.b.length; i++)
      dispose.call(this.$n[i]);
    this.c = this.$n.length = newItems.length;
    this.b = newItems.slice(0);
    this.a = this.a.slice(0, this.c);
  }, this.d);
  return this.a;
}
function computedKeyedMap(list, map, options) {
  return read.bind(
    createComputation(
      [],
      updateKeyedMap.bind({
        d: createScope(),
        c: 0,
        f: list,
        b: [],
        e: map,
        a: [],
        $n: []
      }),
      options
    )
  );
}
function updateKeyedMap() {
  const newItems = this.f() || [], indexed = this.e.length > 1;
  scoped(() => {
    let newLen = newItems.length, i, j, mapper = indexed ? () => this.e(newItems[j], read.bind(this.$n[j])) : () => this.e(newItems[j]);
    if (newLen === 0) {
      if (this.c !== 0) {
        dispose.call(this.d, false);
        this.$n = [];
        this.b = [];
        this.a = [];
        this.c = 0;
      }
    } else if (this.c === 0) {
      this.a = new Array(newLen);
      for (j = 0; j < newLen; j++) {
        this.b[j] = newItems[j];
        this.a[j] = compute(
          this.$n[j] = createComputation(j, null),
          mapper,
          null
        );
      }
      this.c = newLen;
    } else {
      let start, end, newEnd, item, newIndices, newIndicesNext, temp = new Array(newLen), tempNodes = new Array(newLen);
      for (start = 0, end = Math.min(this.c, newLen); start < end && this.b[start] === newItems[start]; start++)
        ;
      for (end = this.c - 1, newEnd = newLen - 1; end >= start && newEnd >= start && this.b[end] === newItems[newEnd]; end--, newEnd--) {
        temp[newEnd] = this.a[end];
        tempNodes[newEnd] = this.$n[end];
      }
      newIndices = /* @__PURE__ */ new Map();
      newIndicesNext = new Array(newEnd + 1);
      for (j = newEnd; j >= start; j--) {
        item = newItems[j];
        i = newIndices.get(item);
        newIndicesNext[j] = i === void 0 ? -1 : i;
        newIndices.set(item, j);
      }
      for (i = start; i <= end; i++) {
        item = this.b[i];
        j = newIndices.get(item);
        if (j !== void 0 && j !== -1) {
          temp[j] = this.a[i];
          tempNodes[j] = this.$n[i];
          j = newIndicesNext[j];
          newIndices.set(item, j);
        } else
          dispose.call(this.$n[i]);
      }
      for (j = start; j < newLen; j++) {
        if (j in temp) {
          this.a[j] = temp[j];
          this.$n[j] = tempNodes[j];
          write.call(this.$n[j], j);
        } else {
          this.a[j] = compute(
            this.$n[j] = createComputation(j, null),
            mapper,
            null
          );
        }
      }
      this.a = this.a.slice(0, this.c = newLen);
      this.b = newItems.slice(0);
    }
  }, this.d);
  return this.a;
}

export { computedKeyedMap, computedMap, selector };
