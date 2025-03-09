import { ButtonProps } from "../interface/buttonInterface";

export default function Button({
    children,
    type = "button",
    bgColor = "bg-purple-500",
    textColor = "text-white",
    className = "",
    ...props
}: ButtonProps) {
    return (
        <button className={`px-1 md:px-4 py-0.5 md:py-2 ${className} ${bgColor} ${textColor} dark:text-white dark:border-white dark:hover:text-gray-400`} {...props}>
            {children}
        </button>
    );
}