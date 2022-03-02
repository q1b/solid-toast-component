import { createSignal, PropsWithChildren } from "solid-js"

export function T(props:PropsWithChildren){
    return (
        <button class="gui-toast" >
            {props.children}
        </button>
    )
}
