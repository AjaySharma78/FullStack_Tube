import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials, setUser } from "../app/api/slice/authSlice.ts";
import { useForm, SubmitHandler } from "react-hook-form";
import Button from "./Button.tsx";
import Input from "./Input.tsx";
import { login as loginUser } from "../app/api/authApis.ts";
import github from "../assets/github (1).png";
import google from "../assets/google.png";
import { toast } from "sonner";
import config from "../env/config.ts";
interface FormValues {
  identifier: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, formState } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const { errors } = formState;
  const [error] = useState("");

  const login: SubmitHandler<FormValues> = async (data) => {
    toast.promise<string>(
          new Promise<string>(async (resolve, reject) => {
            setIsLoading(true);
            try {
              const userData = await loginUser(data.identifier, data.password);
              if (userData.success) {
              if (userData.data.twoFactorEnabled) {
                dispatch(setUser(userData.data));
                navigate("/verify-two-factor-auth");
                resolve("2FA required");
              } else if (userData.data.user.isEmailVerified) {
                dispatch(
                  setCredentials({
                    user: userData.data.user,
                    accessToken: userData.data.accessToken,
                    refreshToken: userData.data.refreshToken,
                  })
                );
                navigate("/");
                resolve("Login successful");
              }
              } else {
                reject(userData.message);
              }
            } catch (error: any) {
              console.log(error);
              reject("Login failed");
            } finally {
              setIsLoading(false);
            }
          }),
          {
            loading: "Wait a sec...",
            success: (message: string) => message,
            error: (message) => message,
          }
        );
  };

  // const githublogininfo = async () => {
  //   toast.promise(
  //         new Promise<{ name: string }>((resolve) => {
  //           window.open("http://localhost:8000/api/v1/users/auth/github", "_self");
  //           setTimeout(() => {
  //             resolve({ name: "GitHub" });
  //           }, 2000);
  //         }),
  //         {
  //           loading: "Wait a sec...",
  //           success: (data: { name: string }) => {
  //             return `${data.name} login successful`;
  //           },
  //           error: "Error",
  //         }
  //       );
  // };

  const githublogininfo = async () => {
    toast.promise(
      new Promise<{ name: string }>((resolve) => {
        window.open(config.githubEndpoint, "_self");
        setTimeout(() => {
          resolve({ name: "GitHub" });
        }, 2000);
      }),
      {
        loading: "Loading...",
        success: (data: { name: string }) => {
          return `${data.name} login successful`;
        },
        error: "Error",
      }
    );
  };

  const googlelogininfo = async () => {
    toast.promise(
      new Promise<{ name: string }>((resolve) => {
        window.open(config.googleEndpoint, "_self");
        setTimeout(() => {
          resolve({ name: "Google" });
        }, 2000);
      }),
      {
        loading: "Loading...",
        success: (data: { name: string }) => {
          return `${data.name} login successful`;
        },
        error: "Error",
      }
    );
  };

  return (
    <div className="flex items-center justify-center ">
      <div
        className={`w-11/12 md:w-full max-w-md bg-gray-100 rounded-xl p-5 md:p-10 border border-black/10 dark:bg-zinc-900 dark:border-zinc-500`}
      >
        <div className="mb-2 flex justify-center items-center">
          <span className=" flex justify-center w-full max-w-[200px]">
            {/* <Logo width="70px" /> */}
          </span>
        </div>
        <h2 className="text-center text-lg md:text-2xl font-bold leading-tight dark:text-zinc-300">
          Sign in to your account
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
              label="UserName or Email: "
              className="py-2 px-3 text-sm"
              placeholder="Enter your email or username"
              type="identifier"
              mess={errors.identifier ? String(errors.identifier.message) : ""}
              {...register("identifier", {
                required: {
                  value: true,
                  message: "Email or UserName is required",
                },
              })}
            />
            <Input
              label="Password:"
              className="py-2 px-3 text-sm"
              type="password"
              mess={errors.password ? String(errors.password.message) : ""}
              placeholder="Enter your password"
              {...register("password", {
                required: {
                  value: true,
                  message: "Password is required",
                },
                validate: {
                  hasNumber: (value) =>
                    /\d/.test(value) ||
                    "Password must contain at least one number",
                  hasLetter: (value) =>
                    /[a-zA-Z]/.test(value) ||
                    "Password must contain at least one letter",
                  hasUpperCase: (value) =>
                    /[A-Z]/.test(value) ||
                    "Password must contain at least one uppercase letter",
                  hasLowerCase: (value) =>
                    /[a-z]/.test(value) ||
                    "Password must contain at least one lowercase letter",
                  hasSpecialChar: (value) =>
                    /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
                    "Password must contain at least one special character",
                },
              })}
            />
            <Link 
              to="/forgot-password"
              type="button"
              className="bg-transparent px-0 md:px-0 py-0 md:py-0 mb-0 ml-1 text-sm dark:text-red-300 text-red-300"
            >
              Forgot Password?
            </Link>
            <Button
              type="submit"
              className="w-full  mt-4 rounded-md"
              bgColor="bg-purple-400 hover:bg-purple-500 dark:bg-black dark:hover:bg-zinc-800"
            >
              Sign in
            </Button>
          </div>
        </form>
        <h3 className="text-center m-2 dark:text-white">OR</h3>

        <Button
          className="w-full flex mb-4 justify-center items-center bg-transparent border border-black dark:border-zinc-400 rounded-md "
          textColor="text-black"
          onClick={githublogininfo}
        >
          <img src={github} alt="Google" width="50px" />
          <p className="font-bold text-lg dark:text-zinc-400">Login with Github.</p>
        </Button>

        <Button
          className="w-full flex justify-center items-center bg-transparent border border-black dark:border-zinc-400 rounded-md "
          textColor="text-black"
          onClick={googlelogininfo}
        >
          <img src={google} className="mx-3" alt="Google" width="30px" />
          <p className="font-bold text-lg dark:text-zinc-400">Login with Google.</p>
        </Button>
      </div>
    </div>
  );
}

export default Login;
