import dispatch from "./dispatch";
import inspectCollapsed from "./collapsed";
import inspectExpanded from "./expanded";
import formatDate from "./formatDate";
import formatError from "./formatError";
import formatRegExp from "./formatRegExp";
import formatString from "./formatString";
import formatSymbol from "./formatSymbol";
import inspectFunction from "./inspectFunction";
import {FORBIDDEN} from "./object";

const {prototype: {toString}} = Object;

export function inspect(value, shallow, expand) {
  let type = typeof value;
  switch (type) {
    case "boolean":
    case "undefined": { value += ""; break; }
    case "number": { value = value === 0 && 1 / value < 0 ? "-0" : value + ""; break; }
    case "string": { value = formatString(value, shallow === false); break; }
    case "symbol": { value = formatSymbol(value); break; }
    case "function": { return inspectFunction(value); }
    default: {
      if (value === null) { type = null, value = "null"; break; }
      if (value instanceof Date) { type = "date", value = formatDate(value); break; }
      if (value === FORBIDDEN) { type = "forbidden", value = "[forbidden]"; break; }
      switch (toString.call(value)) {
        case "[object RegExp]": { type = "regexp", value = formatRegExp(value); break; }
        case "[object Error]": // https://github.com/lodash/lodash/blob/master/isError.js#L26
        case "[object DOMException]": { type = "error", value = formatError(value); break; }
        default: return (expand ? inspectExpanded : inspectCollapsed)(value, shallow);
      }
      break;
    }
  }
  const span = document.createElement("span");
  span.className = `observablehq--${type}`;
  span.textContent = value;
  return span;
}

export function replace(spanOld, spanNew) {
  if (spanOld.classList.contains("observablehq--inspect")) spanNew.classList.add("observablehq--inspect");
  spanOld.parentNode.replaceChild(spanNew, spanOld);
  dispatch(spanNew, "load");
}
