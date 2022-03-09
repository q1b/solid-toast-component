import { splitProps,ComponentProps,PropsWithChildren } from "solid-js";

export const Toast = (props:PropsWithChildren<ComponentProps<'output'>>) => {
	const [local, others] = splitProps(props, ["children", "ref"]);
	return (
		<output
			role='status'
			aria-live='polite'
			ref={local.ref}
			{...others}
		>
			{/*@once*/local.children}
		</output>
	)
}
