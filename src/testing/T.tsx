import { createSignal, PropsWithChildren } from "solid-js"

export function T(props:PropsWithChildren){
    const [count, setCount] = createSignal(0);
    const increment = () => setCount(count() + 1);
    return (
        <>
        <button onClick={increment} >
            {count()}{props.children}
        </button>
        
        </>
    )
}
