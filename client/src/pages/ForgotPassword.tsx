import { useForm, SubmitHandler } from "react-hook-form";
import { forgotPassword } from "../app/api/authApis.ts";
import { Button, Input } from "../components/Index.ts";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

interface FormValues {
  email: string;
  password: string;
}

const ForgotPassword = () => {
  const { register, handleSubmit, formState } = useForm<FormValues>();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { errors } = formState;

  const login: SubmitHandler<FormValues> = async (data) => {
    setError("");
    setLoading(true);
    toast.promise(
      new Promise<string>(async(resolve, reject) => {
        try {
         const response =  await forgotPassword(data.email);
         if(!response.success){reject(response.message)};
         resolve(response.message);
        } catch (error: any) {
          setError(error.message);
          reject("Request failed");
        } finally {
          setLoading(false);
        }
      }),
      {
        loading: "Sending email...",
        success: (message:string) => message,
        error: (message:string) => message
      }
    )
 
  };

  return (
    <div className="w-full flex items-center justify-center ">
      <div
        className={`w-11/12 md:w-full max-w-md bg-gray-100 rounded-xl p-5 md:p-10 border border-black/10 dark:bg-gray-900 dark:border-white`}
      >
        <div className="mb-2 flex justify-center items-center">
          <span className=" flex justify-center w-full max-w-[200px]">
            {/* <Logo width="70px" /> */}
          </span>
        </div>
        <h2 className="text-center text-lg md:text-2xl font-bold leading-tight dark:text-white">
          Forgot Password
        </h2>
        <p className="mt-2 text-xs text-center md:text-base text-black/60 dark:text-white/60">
          Don&apos;t have any account?&nbsp;
          <Link
            to="/signup"
            className="font-medium text-primary transition-all duration-200 hover:underline dark:text-white"
          >
            Sign Up
          </Link>
        </p>
        {isLoading && (
          <div className="w-full grid place-content-center mt-2">
            <img
              className="w-[30px]"
              src="https://media.tenor.com/wpSo-8CrXqUAAAAi/loading-loading-forever.gif"
              alt="loading"
              style={{ width: "30px" }}
            />{" "}
          </div>
        )}
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
        <form onSubmit={handleSubmit(login)} className="mt-8">
          <div>
            <Input
              label="Useremail: "
              className="py-2 px-3 text-sm"
              placeholder="Enter your email"
              type="email"
              mess={errors.email ? String(errors.email.message) : ""}
              {...register("email", {
                required: {
                  value: true,
                  message: "Email is required",
                },
                validate: {
                  matchPatern: (value) =>
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                    "Oops! Please enter a valid email address.",
                },
              })}
            />
            <Button
              type="submit"
              className="w-full  mt-4 rounded-md"
              bgColor="bg-purple-400 hover:bg-purple-500"
            >
              Send Email
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
