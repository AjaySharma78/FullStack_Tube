import { SignupDataProps } from "../interface/signupInterface.ts";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button, Input } from "../components/Index.ts";
import { resetPassword } from "../app/api/authApis.ts";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { toast } from "sonner";

function ResetPassword() {
  const { register, handleSubmit, formState, watch } =
    useForm<SignupDataProps>();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { errors } = formState;
  const password = useRef({});
  password.current = watch("password", "");

  const create: SubmitHandler<SignupDataProps> = async (data) => {
    setLoading(true);
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const token = urlParams.get("token");
          const userData = await resetPassword(data.password, `${token}`);

          if (!userData.success) reject(userData.message);
          resolve(userData.message);
          navigate("/login");
        } catch (error: any) {
          reject("Failed to reset password");
        } finally {
          setLoading(false);
        }
      }),
      {
        loading: "Resetting password...",
        success: (message: string) => message,
        error: (message: string) => message,
      }
    );
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div
        className={`mx-auto w-11/12 md:w-full max-w-md bg-gray-100 rounded-xl border border-black/10 dark:bg-gray-900 dark:border-white`}
      >
        <div className="mb-2 flex justify-center items-center">
          <span className=" flex justify-center w-full max-w-[200px]">
            {/* <Logo width="70px" /> */}
          </span>
        </div>
        <h2 className="text-center text-lg md:text-2xl font-bold leading-tight dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-xs text-center md:text-base text-black/60 dark:text-white/60">
          Don&apos;t have any account?&nbsp;
          <Link
            to="/login"
            className="font-medium text-primary transition-all duration-200 hover:underline dark:text-white"
          >
            Sign In
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

        <form
          onSubmit={handleSubmit(create)}
          className="mt-5 p-3  md:mt-0 w-full"
        >
          <div className="w-full flex gap-2 justify-between items-start flex-wrap">
            <Input
              className="py-2 px-3 text-sm"
              label="Password: "
              type="password"
              mess={errors.password ? String(errors.password.message) : ""}
              placeholder="Enter your password"
              {...register("password", {
                required: {
                  value: true,
                  message: "Password is required",
                },
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            <Input
              className="py-2 px-3 text-sm"
              label="Confirm Password: "
              type="password"
              mess={
                errors.confirmPassword
                  ? String(errors.confirmPassword.message)
                  : ""
              }
              placeholder="Confirm your password"
              {...register("confirmPassword", {
                validate: (value) =>
                  value === password.current || "The passwords do not match",
              })}
            />
          </div>
          <Button
            type="submit"
            className="w-full mt-2 rounded-md"
            bgColor="hover:bg-purple-500 bg-purple-400"
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
