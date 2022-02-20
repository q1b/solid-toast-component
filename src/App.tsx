import { Component, createSignal } from "solid-js";
import toast,{ Toaster } from "./components/Toaster";
import { Toast } from "./components/Toast";
import {T} from "./testing/T"
import { calT,Toasts } from "./testing/callT"

function Counter() {  
  calT(<T>Nicasde world I love this</T>)
  calT(<T>Nice world I love this</T>)
  return (
    <section >
      <Toasts />
    </section>
  );
}

const App: Component = () => {
	let [count, setCount] = createSignal(0);
	return (
		<section>
			<Counter/>
			<button
				onClick={() => {
					setCount(count()+1);
					toast(() => <Toast class="gui-toast">
						Toast{count()}
					</Toast>);
				}}>
				Click
			</button>
			<Toaster />
		</section>
	);
};

export default App;
