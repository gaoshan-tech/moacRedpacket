/**
 *  节流
 * @param fn 待执行的函数
 * @param interval 一定的时间内
 * @returns {Function}
 */
export function throttle(fn, interval = 300) {
  let canRun = true;
  return function () {
    if (!canRun) return;
    canRun = false;
    setTimeout(() => {
      fn.apply(this, arguments);
      canRun = true;
    }, interval);
  };
}

/**
 * 防抖
 * @param fn 待执行的函数
 * @param interval 一定时间内
 * @returns {Function}
 */
export function debounce(fn, interval = 300) {
  let timeout = null;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, arguments);
    }, interval);
  };
}

export function debounceHign(func, wait, immediate=true) {
  let timeout, context, args;
  // 延迟执行函数
  const later = () => setTimeout(() => {
    // 延迟函数执行完毕，清空定时器
    timeout = null;
    // 延迟执行的情况下，函数会在延迟函数中执行
    // 使用到之前缓存的参数和上下文
    if (!immediate) {
      func.apply(context, args);
      context = args = null;
    }
  }, wait);
  let debounced = function (...params) {
    if (!timeout) {
      timeout = later();
      if (immediate) {
        //立即执行
        func.apply(this, params);
      } else {
        //闭包
        context = this;
        args = params;
      }
    } else {
      clearTimeout(timeout);
      timeout = later();
    }
  };
  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = null;
  };
  return debounced;
}

