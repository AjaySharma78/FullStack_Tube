import React, { useId } from "react";
import { InputProps } from "../interface/inputInterface";

const Input = React.forwardRef(function Input(
  { label, mess, type = "text", className = "", ...props }: InputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const uid = useId();
  return (
    <div className="w-full mt-0">
      <div className="flex items-center">
        {label && (
          <label
            className="inline-block pl-1 dark:text-zinc-300"
            htmlFor={uid}
          >
            {label}
          </label>
        )}
        <p className="text-red-400 ml-1 text-xs">{mess}</p>
      </div>
      <input
        type={type}
        className={`rounded-lg bg-white text-black outline-none focucs:bg-gray-50 duration-200 border border-gray-500 w-full placeholder:text-zinc-500 dark:bg-zinc-800 placeholder:dark:text-zinc-300 dark:text-zinc-300 ${className}`}
        {...props}
        ref={ref}
        id={uid}
      ></input>
    </div>
  );
});

export default Input;