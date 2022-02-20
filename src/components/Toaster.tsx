import {
	JSX,
	createReaction,
	createRenderEffect,
	on,
	mapArray,
	splitProps,
	ComponentProps,
	PropsWithChildren,
	createEffect,
	createSignal,
	createUniqueId,
	createRoot,
} from "solid-js";

import { InsertBeforeBody } from "./Portal";
import { Toast } from "./Toast";
import { insert } from "solid-js/web";

// const [toastsTextNode, setToastsTextNode] = createSignal<string[]>([]);
// const [toastsRefs, setToastsRefs] = createSignal<{ toast: HTMLElement }[]>([]);

const [source, setSource] = createSignal<{ id: string; text: string; el: JSX.Element | HTMLElement }[]>([]);
const [el, setEl] = createSignal<Element | null>();


/* 
After receiving the el from user we will add it to els, through setEls,
[els,setEls represents JSX.Element send by the user but no reference in DOM yet,]
then, providing the reference of parent element that is already there, we will append that, to that parent element

get the mounted reference of that element set it to el as well add it to mountedEls,
[mountedEls,setMountedEls Now these are mounted on DOM So, we can reference them as well, like animating.]
[el,setEl  represents newly added,]

*/

const mapped = mapArray(source, (model) => {
	const [el, setEl] = createSignal(model.el);
	const [text, setText] = createSignal(model.text);
	return {
		get id() {
			return model.id;
		},
		get el() {
			return el();
		},
		get text() {
			return text();
		},
		setEl,
		setText,
	};
});

export const toast = (recevied: string | JSX.Element) => {
	let id = createUniqueId();
	function extractText() {
		if (typeof recevied === "string") return recevied;
		return "NO_TEXT";
	}
	let text = extractText();
	if (text === "NO_TEXT") {
		setSource((c) => [
			...c,
			{
				id,
				text,
				el: recevied as JSX.Element,
			},
		]);
	} else {
		setSource((c) => [
			...c,
			{
				id,
				text,
				el: () => <Toast>{text}</Toast>,
			},
		]);
	}
	return id;
};

export default createRoot(() => toast);

function animateTo(element: HTMLElement, keyframes: PropertyIndexedKeyframes, options: KeyframeAnimationOptions) {
	const anim = element.animate(keyframes, { ...options, fill: "both" });
	anim.addEventListener("finish", () => {
		anim.commitStyles();
		console.log("ANIMATION FINISHED");
		anim.cancel();
	});
	return anim;
}

function insertToast(parentRef:HTMLElement) {
	const { matches: motionOK } = window.matchMedia("(prefers-reduced-motion: no-preference)");
	if (parentRef.children.length && motionOK) {
		const first = parentRef.offsetHeight;
		// add new child to change container size
		insert(parentRef, mapped()[mapped().length - 1].el);
		mapped()[mapped().length - 1].setEl(parentRef.lastElementChild);
		setEl(parentRef.lastElementChild);
		// LAST
		const last = parentRef.offsetHeight;
		// INVERT
		const invert = last - first;
		// PLAY
		const animation = parentRef.animate([{ transform: `translateY(${invert}px)` }, { transform: "translateY(0)" }], {
			duration: 150,
			easing: "ease-out",
		});
		animation.startTime = document.timeline.currentTime;
	} else {
		insert(parentRef, mapped()[mapped().length - 1].el);
		mapped()[mapped().length - 1].setEl(parentRef.lastElementChild);
		setEl(parentRef.lastElementChild);
	}
	console.log("SECOND");
}

export const Toaster = (props: PropsWithChildren<ComponentProps<"section">>) => {
	const [local, others] = splitProps(props, ["children", "ref"]);
	let ToasterRef: HTMLElement;
	createEffect(on(source, (v) => {}, { defer: true }));
	createRenderEffect(
		on(
			el,
			() => {
				// "SOME DOM CHANGED" Means el() is added to DOM
				const last = el();
				if (last instanceof HTMLElement) {
					animateTo(
						last,
						{
							opacity: ["0", "1"],
							transform: ["scale(2)", "scale(1)"],
						},
						{
							duration: 100,
						}
					);
					new Promise<void>(async (resolve, reject) => {
						await Promise.allSettled(last.getAnimations().map((animation) => animation.finished));
						ToasterRef.removeChild(last);
						console.log("removeChild", last);
						console.log("MAPPED", mapped());
						let arr = [];
						for (let i = 0; i < mapped().length; i++) {
							const element = mapped()[i];
							if (element.el === last) console.log("I am here before");
							else arr.push(element);
						}
						console.log("NEW ARR", arr);
						setSource(arr);
						resolve();
					}).then(() => {
						console.log("My self deleted", last, mapped());
					});
				}
			},
			{ defer: true }
		)
	);
	return (
		<InsertBeforeBody>
			<section role="status" aria-live="polite" class="gui-toast-group" ref={(el) => (ToasterRef = el)} {...others}></section>
		</InsertBeforeBody>
	);
};
