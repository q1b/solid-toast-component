import { Component, createSignal } from "solid-js";
import { Toast } from "./components/Toast";
import TOASTER from "./components/createToaster";
import SpeToaster from "./testing/callS";

const App: Component = () => {
	let [count, setCount] = createSignal(0);
	let { toast, Toaster } = TOASTER();
	let { ...A } = TOASTER();
	let { ...B } = SpeToaster();
	let { ...C } = SpeToaster();
	let { ...D } = TOASTER();
	let { ...E } = TOASTER();
	return (
		<section class="min-h-screen w-full flex items-center justify-center bg-slate-900">
			<article class="grid grid-cols-3 gap-10">
				<button
					class="bg-white px-2 py-1 rounded-md"
					onClick={() =>
						toast(<Toast class="bg-white shadow-xl shadow-white text-cyan-400 font-semibold italic px-3 py-0.5 rounded-lg">LEFT-TOP</Toast>)
					}>
					LEFT-TOP
				</button>
				<button
					class="bg-white px-2 py-1 rounded-md"
					onClick={() =>
						A.toast(
							<Toast class="bg-white shadow-xl shadow-white text-cyan-400 font-semibold italic px-3 py-0.5 rounded-lg">
								CENTER-TOP
							</Toast>
						)
					}>
					CENTER-TOP
				</button>
				<button
					class="bg-white px-2 py-1 rounded-md"
					onClick={() =>
						B.toast(
							<Toast class="bg-white shadow-xl shadow-white text-cyan-400 font-semibold italic px-3 py-0.5 rounded-lg">
								RIGHT-TOP
							</Toast>
						)
					}>
					RIGHT-TOP
				</button>
				<button
					class="bg-white px-2 py-1 rounded-md"
					onClick={() => {
						toast(
							<Toast class="bg-white shadow-xl shadow-white text-cyan-400 font-semibold italic px-3 py-0.5 rounded-lg">
								LEFT
							</Toast>
						);
						E.toast(
							<Toast class="bg-white shadow-xl shadow-white text-cyan-400 font-semibold italic px-3 py-0.5 rounded-lg">
								LEFT
							</Toast>
						);
					}}>
					LEFT
				</button>
				<button
					class="bg-white px-2 py-1 rounded-md"
					onClick={() => {
						setCount(count() + 1);
						toast(<Toast class="gui-toast">Nice {/*@once*/ count()} world I love this</Toast>);
						A.toast(<Toast class="gui-toast"> Nice {/*@once*/ count()} </Toast>);
						B.toast(<Toast class="gui-toast"> Nice {/*@once*/ count()} </Toast>);
						C.toast(<Toast class="gui-toast"> Nice {/*@once*/ count()} </Toast>);
						D.toast(<Toast class="gui-toast"> Nice {/*@once*/ count()} </Toast>);
						E.toast(<Toast class="gui-toast"> Nice {/*@once*/ count()} </Toast>);
					}}>
					ALL AT ONCE
				</button>
				<button
					class="bg-white px-2 py-1 rounded-md"
					onClick={() => {
						B.toast(
							<Toast class="bg-white shadow-xl shadow-white text-cyan-400 font-semibold italic px-3 py-0.5 rounded-lg">
								RIGHT
							</Toast>
						);
						C.toast(
							<Toast class="bg-white shadow-xl shadow-white text-cyan-400 font-semibold italic px-3 py-0.5 rounded-lg">
								RIGHT
							</Toast>
						);
					}}>
					RIGHT
				</button>
				<button
					class="bg-white px-2 py-1 rounded-md"
					onClick={() => {
						E.toast(
							<Toast class="bg-white shadow-xl shadow-white text-cyan-400 font-semibold italic px-3 py-0.5 rounded-lg">
								LEFT-BOTTOM
							</Toast>
						);
					}}>
					LEFT-BOTTOM
				</button>
				<button
					class="bg-white px-2 py-1 rounded-md"
					onClick={() => {
						D.toast(
							<Toast class="bg-white shadow-xl shadow-white text-cyan-400 font-semibold italic px-3 py-0.5 rounded-lg">
								CENTER-BOTTOM
							</Toast>
						);
					}}>
					CENTER-Bottom
				</button>
				<button
					class="bg-white px-2 py-1 rounded-md"
					onClick={() => {
						C.toast(
							<Toast class="bg-white shadow-xl shadow-white text-cyan-400 font-semibold italic px-3 py-0.5 rounded-lg">
								RIGHT-BOTTOM
							</Toast>
						);
					}}>
					RIGHT-BOTTOM
				</button>
			</article>
			<Toaster duration={1000} position="top-left" />
			<A.Toaster duration={1000} position="top-center" />
			<B.Toaster duration={1000} position="top-right" />
			<C.Toaster duration={1000} position="bottom-right" />
			<D.Toaster duration={1000} position="bottom-center" />
			<E.Toaster duration={1000} position="bottom-left" />
		</section>
	);
};
