const cache = new Map();

export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $all(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function byId(id) {
  if (!cache.has(id)) {
    cache.set(id, document.getElementById(id));
  }
  return cache.get(id);
}
