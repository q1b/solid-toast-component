import { createSignal,For,JSX } from "solid-js"

const [els,setEls] = createSignal<(JSX.Element)[]>([])

export function calT(received:JSX.Element) {
    setEls([...els(),received]);
}

export function Toasts() {
	els().forEach((el)=>{
		console.log(el());
	})
    return (
        <div>
            <For each={els()}>
                {(El) => {
                    return <>
                        <El ref={(r:HTMLElement) => {
							console.log("For loop ref",r)
						}} />
                    </>
                }}
            </For>
        </div>
    )
}
