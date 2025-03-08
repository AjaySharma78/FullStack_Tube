import { ContainerProps } from "../../interface/containerInterface";

function Container({children, className=' ', width='w-full'}:ContainerProps) {
  return <div className={`${className} ${width} max-w-7xl mx-auto px-2 md:px-4 dark:bg-black dark:text-white`}>{children}</div>;   
}

export default Container