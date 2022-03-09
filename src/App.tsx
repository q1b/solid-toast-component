import { Component, createSignal } from "solid-js";
import { Toast } from "./components/Toast";
import TOASTER from "./components/createSpeToaster";

const App: Component = () => {
	let { toast, Toaster,} = TOASTER({
		duration:{
			forEntering:600,
			forWaiting:2000,
			forLeaving:600,
		},
	});
	let A = TOASTER({
		duration:{
			forEntering:600,
			forWaiting:2000,
			forLeaving:600,
		},
	});
	return (
		<section class="min-h-screen w-full flex items-center justify-center bg-slate-900">
			<article class="grid grid-cols-1 gap-10">
				<button
					class="bg-white px-2 py-1 rounded-md"
					onClick={() => {
						toast(
							<Toast class="bg-white shadow-xl shadow-white text-cyan-400 font-semibold italic px-3 py-0.5 rounded-lg">
								<h1 class="max-w-md">
									Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolorem, quo.
								</h1>
							</Toast>
							,{
								onEnter:{
									transform:['scaleX(0)','scaleX(1)'],
									opacity:[0,1]
								}
							}
						);
					}}>
					center Top
				</button>
				<button
					class="bg-white px-2 py-1 rounded-md"
					onClick={() => {
						A.toast(
							<Toast class="bg-white shadow-xl shadow-white text-cyan-400 font-semibold italic px-3 py-0.5 rounded-lg">
								<h1 class="max-w-md">
									Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolorem, quo.
								</h1>
							</Toast>
							,{
								onEnter:{
									transform:['scaleX(0)','scaleX(1)'],
									opacity:[0,1]
								}
							}
						);
					}}>
					center Bottom
				</button>
			</article>
			<Toaster position="top-center" />
			<A.Toaster position="bottom-center" />
		</section>
	);
};

export default App;
// component
// <button
// 	onClick={() => {
// 		// calT(parent,<Toast>Nice {count()} world I love this</Toast>)
// 		toast(<Toast class="gui-toast" >Nice {count()+1} world I love this</Toast>)
// 		setCount(count()+1);
// 	}}>
// 	Click
// </button>
// {/* <Toasts ref={(e:HTMLElement) =>  parent = e} ></Toasts> */}
// <Toaster />
// Component design 2nd
// <button
// onClick={() => {
// calT(parent,<T>Nicasde {++count} world I love this</T>)
// }}>
{
	/* Click */
}
{
	/* </button> */
}
// <Toasts ref={(e:HTMLElement) =>  parent = e} ></Toasts>
// {/* <Toaster /> */}
