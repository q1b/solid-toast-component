import {
	createSignal,
	createEffect,
	createRenderEffect,
	splitProps,
	createUniqueId,
	on,
	PropsWithChildren,
	JSX,
	createRoot,
	mapArray,
	sharedConfig,
	onCleanup,
} from "solid-js";

import { Toast } from "../components/Toast";
import { insert } from "solid-js/web";

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

function animateTo(element: HTMLElement, keyframes: PropertyIndexedKeyframes, options: KeyframeAnimationOptions, onfinish?: any) {
	const anim = element.animate(keyframes, { ...options, fill: "both" });
	anim.addEventListener("finish", () => {
		if (onfinish) onfinish();
		anim.cancel();
	});
	return anim;
}

type Easing = {
	forEntering: string;
	forLeaving: string;
};

type Duration = {
	forEntering: number;
	forWaiting: number;
	forLeaving: number;
};

type Options = {
	onEnter?: PropertyIndexedKeyframes;
	onLeave?: PropertyIndexedKeyframes;
	duration?: Duration;
	easing?: Easing;
};

function first(options?: Options) {
	const [source, setSource] = createSignal<{ id: string; text: string; el: JSX.Element | HTMLElement; offsetDif: number }[]>([]);
	const [el, setEl] = createSignal<Element | null>();
	let { onEnter, onLeave, duration, easing } = {
		onEnter: options?.onEnter || {
			opacity: ["0", "1"],
			transform: ["scale(2)", "scale(1)"],
		},
		onLeave: options?.onLeave || {
			opacity: ["1", "0"],
			transform: ["scale(1)", "scale(0)"],
		},
		duration: options?.duration || {
			forEntering: 300,
			forWaiting: 900,
			forLeaving: 400,
		},
		easing: options?.easing || {
			forEntering: "cubic-bezier(.5, -.5, .1, 1.5)",
			forLeaving: "cubic-bezier(.5, -.5, .1, 1.5)",
		},
	};

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

	return {
		toast(recevied: string | JSX.Element, options?: Options): string {
			let id = createUniqueId();
			duration = { ...duration, ...options?.duration };
			onEnter = { ...onEnter, ...options?.onEnter };
			onLeave = { ...onLeave, ...options?.onLeave };
			easing = { ...easing, ...options?.easing };
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
			return id;
		},
		// component renderer
		Toaster(
			props: PropsWithChildren<{
				position: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
				children?: JSX.Element;
				ref?: HTMLElement | ((el: HTMLElement) => void) | undefined;
			}>
		) {
			const [local, others] = splitProps(props, ["children", "ref"]);
			const [offsetDiff, setOffsetDiff] = createSignal(0);
			const [vertical, horizontal] =
				(others.position?.split("-") as ["top" | "bottom", "left" | "center" | "right"]) ??
				(["top", "center"] as ["top" | "bottom", "left" | "center" | "right"]);
			let insetPosition: "start" | "end" = "end";
			if (vertical === "top") {
				insetPosition = "start";
			}
			let horizontalPropValue: "start" | "end" | "center" = "center";
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
			const animExit = (last: HTMLElement): undefined | Animation => {
				let animation;
				animateTo(last, onLeave, {
					duration: duration.forLeaving,
					easing: easing.forLeaving,
				});
				if (insetPosition === "start") {
					if (mapped().length !== 1) {
						animation = ToasterRef.animate(
							[
								{
									transform: `translateY(-${offsetDiff()}px)`,
								},
							],
							{
								duration: duration.forLeaving + 1,
								easing: "ease-in",
							}
						);
						animation.startTime = document.timeline.currentTime;
					}
				}
				return animation;
			};
			createEffect(
				on(
					source,
					(v, p) => {
						if (p === undefined || v.length > p.length) {
							const { matches: motionOK } = window.matchMedia("(prefers-reduced-motion: no-preference)");
							if (ToasterRef.children.length && motionOK) {
								const first = ToasterRef.offsetHeight;
								// add new child to change container size
								insert(ToasterRef, v[v.length - 1].el);
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
								insert(ToasterRef, v[v.length - 1].el);
								mapped()[mapped().length - 1].setEl(ToasterRef.lastElementChild);
								setEl(ToasterRef.lastElementChild);
							}
						} else {
							// console.log("REMOVED");
						}
						// console.log("SECOND");
					},
					{ defer: true }
				)
			);
			createRenderEffect(
				on(el, () => {
					// "SOME DOM CHANGED" Means el() is added to DOM
					const last = el();
					let animation: Animation | undefined;
					if (last instanceof HTMLElement) {
						animateTo(last, onEnter, {
							duration: duration.forEntering,
							easing: easing.forEntering,
							endDelay: duration.forWaiting,
						});
						// after duration+enter_duration
						new Promise<void>(async (resolve, reject) => {
							let escapeDuration = duration.forEntering + duration.forWaiting - duration.forLeaving;
							await sleep(escapeDuration + 100);
							resolve();
						}).then(() => {
							animation = animExit(last);
						});
						new Promise<void>(async (resolve, reject) => {
							await Promise.allSettled(last.getAnimations().map((animation) => animation.finished));
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
							// console.log("My self deleted", last, mapped());
						});
					}
				})
			);
			return (
				<PortalSection
					insetPosition={insetPosition}
					horizontalPropValue={horizontalPropValue}
					ref={(el: HTMLElement) => {
						ToasterRef = el;
					}}></PortalSection>
			);
		},
	};
}

export function PortalSection(props: {
	insetPosition: "start" | "end";
	horizontalPropValue: "start" | "end" | "center";
	children?: JSX.Element;
}) {
	const marker = document.createTextNode("");
	const mount = document.body;
	// don't render when hydrating
	function renderPortal() {
		if (sharedConfig.context) {
			const [s, set] = createSignal(false);
			queueMicrotask(() => set(true));
			return () => s() && props.children;
		} else return () => props.children;
	}
	const container = document.createElement("section");
	container.setAttribute("role", "status");
	container.setAttribute("aria-live", "polite");
	container.setAttribute(
		"style",
		`
		position: fixed;
  		z-index: 1;
		inset-inline: 0;
  		padding-block-end: 5vh;
		inset-block-${props.insetPosition}:0px;
		display: grid;
  		justify-items: center;
  		justify-content:${props.horizontalPropValue};
		gap: 1vh;
		/* optimizations */
  		pointer-events: none;`
	);
	Object.defineProperty(container, "host", {
		get() {
			return marker.parentNode;
		},
	});
	insert(container, renderPortal());
	mount.before(container);
	(props as any).ref && (props as any).ref(container);
	onCleanup(() => document.documentElement.removeChild(container));
	return marker;
}

export default createRoot(() => {
	return (
		options?: Options
	) => {
		return first(options);
	};
});
