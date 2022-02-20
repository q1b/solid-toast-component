import { insert } from "solid-js/web";
import { createSignal, onCleanup, JSX, createRoot, sharedConfig } from "solid-js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function createElement(tagName: string, isSVG = false): HTMLElement | SVGElement {
	return isSVG ? document.createElementNS(SVG_NAMESPACE, tagName) : document.createElement(tagName);
}

export function InsertBeforeBody(props: { children: JSX.Element }) {	
	const marker = document.createTextNode("")
	const mount = document.body;
	// don't render when hydrating
	function renderPortal() {
		if (sharedConfig.context) {
			const [s, set] = createSignal(false);
			queueMicrotask(() => set(true));
			return () => s() && props.children;
		} else return () => props.children;
	}
		const container = createElement("div");
		Object.defineProperty(container, "host", {
			get() {
				return marker.parentNode;
			},
		});
		insert(container, renderPortal());
		mount.before(container);
		(props as any).ref && (props as any).ref(container);
		console.log(props);
		onCleanup(() => document.documentElement.removeChild(container));
	return marker;
}
