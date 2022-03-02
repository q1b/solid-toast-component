import {
	JSX,
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
	sharedConfig
} from "solid-js";

import { InsertBeforeBody } from "./Portal";
import { Toast } from "./Toast";
import { render } from "solid-js/web";

const [source, setSource] = createSignal<{ id: string; text: string; el: JSX.Element | HTMLElement; offsetDif: number }[]>([]);
const [el, setEl] = createSignal<Element | null>();

const mapped = mapArray(source, (model) => {
	const [el, setEl] = createSignal(model.el);
	const [text, setText] = createSignal(model.text);
	const [offsetDif, setOffsetDif] = createSignal(model.offsetDif);
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
		get offsetDif() {
			return offsetDif();
		},
		setEl,
		setText,
		setOffsetDif,
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
				offsetDif: 0,
			},
		]);
	} else {
		setSource((c) => [
			...c,
			{
				id,
				text,
				el: () => <Toast>{text}</Toast>,
				offsetDif: 0,
			},
		]);
	}
};

export default createRoot(() => toast);

function animateTo(element: HTMLElement, keyframes: PropertyIndexedKeyframes, options: KeyframeAnimationOptions, onfinish?: any) {
	const anim = element.animate(keyframes, { ...options, fill: "both" });
	anim.addEventListener("finish", () => {
		if (onfinish) onfinish();
		anim.cancel();
	});
	return anim;
}


export const Toaster = (props: PropsWithChildren<{
	position:"top-left"|"top-center"|"top-right"|"bottom-left"|"bottom-center"|"bottom-right";
	duration:number;
	children?: JSX.Element; 
	ref?:HTMLElement | ((el: HTMLElement) => void) | undefined;
}>) => {
	const [local, others] = splitProps(props, ["children", "ref"]);
	const [offsetDiff, setOffsetDiff] = createSignal(0);
	let duration = 1000;
	let enter_duration = 100;
	let leave_duration = 400;
	const [vertical,horizontal] = others.position?.split('-') as  ["top"|"bottom","left"|"center"|"right"] ?? ["top","center"] as ["top"|"bottom","left"|"center"|"right"]
	let insetPosition: "start" | "end" = "end";
	if(vertical === "top"){
		insetPosition = "start";
	}
	let horizontalPropValue:"start"|"end"|"center" = "center";
	switch (horizontal) {
		case "left":
			horizontalPropValue = "start";
			break;
		case "right":
			horizontalPropValue = "end";
			break;
		default:
			break;
	}
	
	let ToasterRef: HTMLElement;
	createEffect(
		on(
			source,
			(v, p) => {
				if (p === undefined || v.length > p.length) {
					const { matches: motionOK } = window.matchMedia("(prefers-reduced-motion: no-preference)");
					if (ToasterRef.children.length && motionOK) {
						const first = ToasterRef.offsetHeight;
						// add new child to change container size
						render(() => v[v.length - 1].el, ToasterRef);
						mapped()[mapped().length - 1].setEl(ToasterRef.lastElementChild);
						setEl(ToasterRef.lastElementChild);
						// LAST
						const last = ToasterRef.offsetHeight;
						// INVERT
						const invert = last - first;
						setOffsetDiff(invert);
						mapped()[mapped().length - 1].setOffsetDif(invert);
						// PLAY
						if (insetPosition === "end") {
							const animation = ToasterRef.animate(
								[
									{
										transform: `translateY(${invert}px)`,
									},
									{
										transform: "translateY(0)",
									},
								],
								{
									duration: 150,
									easing: "ease-out",
								}
							);
							animation.startTime = document.timeline.currentTime;
						}
					} else {
						render(() => mapped()[mapped().length - 1].el, ToasterRef);
						mapped()[mapped().length - 1].setEl(ToasterRef.lastElementChild);
						setEl(ToasterRef.lastElementChild);
					}
				} else {
					console.log("REMOVED");
				}
				console.log("SECOND");
			},
			{ defer: true }
		)
	);
	createRenderEffect(
		on(el, () => {
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
						duration: enter_duration,
						endDelay: duration,
					}
				);
				// after duration+enter_duration
				setTimeout(() => {
					animateTo(
						last,
						{
							opacity: ["1", "0"],
							transform: ["scale(1)", "scale(0)"],
						},
						{
							duration: leave_duration,
						}
					);
				}, enter_duration + duration - leave_duration + 100);

				new Promise<void>(async (resolve, reject) => {
					await Promise.allSettled(last.getAnimations().map((animation) => animation.finished));
					let animation: Animation | undefined;
					if (insetPosition === "start") {
						if(mapped().length!==1){
						animation = ToasterRef.animate(
							[
								{
									transform: `translateY(0)`,
								},
								{
									transform: `translateY(-${offsetDiff()}px)`,
								},
							],
							{
								duration: 150,
								easing: "ease-in",
							}
						);
						animation.startTime = document.timeline.currentTime;
						}
					}
					if (animation) await animation?.finished;
					ToasterRef.removeChild(last);
					let newArr: { id: string; text: string; el: JSX.Element | HTMLElement; offsetDif: number }[] = [];
					for (let i = 0; i < mapped().length; i++) {
						const element = mapped()[i];
						if (element.el === last) continue;
						newArr = [...newArr, element];
					}
					setSource(newArr);
					resolve();
				}).then(() => {
					console.log("My self deleted", last, mapped());
				});
			}
		})
	);
	return (
		<InsertBeforeBody>
			<section
				role="status"
				aria-live="polite"
				class="gui-toast-group"
				style={`
					inset-block-${insetPosition}:0px;
					display: grid;
  					justify-items: center;
  					justify-content:${horizontalPropValue};
  					gap: 1vh;
				`}
				ref={(el) => {
					ToasterRef = el;
				}}
				{...others}></section>
		</InsertBeforeBody>
	);
};
