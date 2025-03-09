import { signup as signupUser, validateUserNames } from "../app/api/authApis.ts";
import { SignupDataProps } from "../interface/signupInterface.ts";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDebounceCallback } from "usehooks-ts";
import github from "../assets/github (1).png";
import { useEffect, useState } from "react";
import google from "../assets/google.png";
import Button from "./Button.tsx";
import Input from "./Input.tsx";
import { toast } from "sonner";
import config from "../env/config.ts";

function Signup() {
  const { register, handleSubmit, formState, watch } = useForm<SignupDataProps>();
  const [usernameSuccess, setUsernameSuccess] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const username = watch("userName");
  const navigate = useNavigate();
  const { errors } = formState;

  const validateUsername = async (username: string) => {
    if (username) {
      const response = await validateUserNames(username);
      if (response.success) {
        setUsernameSuccess("✅");
      } else {
        setUsernameSuccess(response.message || "Username is already taken");
      }
    }
  };

  const debounced = useDebounceCallback((value: string) => {
    validateUsername(value);
  }, 1000);

  useEffect(() => {
    debounced(username);
  }, [username]);

  const create: SubmitHandler<SignupDataProps> = async (data) => {
    setError("");
    setLoading(true);
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          const userData = await signupUser(data);
          if (!userData.success) {
            reject(userData.message);
            return;
          }
          navigate("/login");
          resolve("Signup successful");
          setTimeout(() => {
            toast.success(`Check ${userData.data.email} for verification link`);
          }, 1000);
        } catch (error: any) {
          reject("Signup failed");
          setError(error.message);
        } finally {
          setLoading(false);
          reject("Signup failed");
        }
      }),
      {
        loading: "Wait a sec...",
        success: (message: string) => message,
        error: (message) => message,
      }
    );
  };

  const githublogininfo = async () => {
    toast.promise(
      new Promise<{ name: string }>((resolve) => {
        window.open(config.githubEndpoint, "_self");
        setTimeout(() => {
          resolve({ name: "Github" });
        }, 2000);
      }),
      {
        loading: "Wait a sec...",
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
        loading: "Wait a sec...",
        success: (data: { name: string }) => {
          return `${data.name} login successful`;
        },
        error: "Error",
      }
    );
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div
        className={`w-4/6 bg-gray-100 rounded-xl border border-black/10 dark:bg-zinc-900 dark:border-zinc-400`}
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
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
        <form
          onSubmit={handleSubmit(create)}
          className="mt-5 p-3  md:mt-0 w-full"
        >
          <div className="w-full flex gap-2 justify-between items-start flex-wrap">
            <div className=" w-full md:w-1/2">
              <Input
                className="py-2 px-3 text-sm"
                label="User Name: "
                mess={
                  errors.userName
                    ? String(errors.userName.message)
                    : usernameSuccess
                }
                placeholder="Enter your name"
                {...register("userName", {
                  required: {
                    value: true,
                    message: "Username is required",
                  },
                })}
              />
              <Input
                className="py-2 px-3 text-sm"
                label="Full Name: "
                mess={errors.fullname ? String(errors.fullname.message) : ""}
                placeholder="Enter your fullname"
                {...register("fullname", {
                  required: {
                    value: true,
                    message: "Fullname is required",
                  },
                })}
              />
              <Input
                className="py-2 px-3 text-sm"
                label="User Email: "
                placeholder="Enter your email"
                mess={errors.email ? String(errors.email.message) : ""}
                type="email"
                {...register("email", {
                  required: {
                    value: true,
                    message: "Email is required",
                  },
                  validate: {
                    matchPatern: (value) =>
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
                        value
                      ) || "Oops! Please enter a valid email address.",
                  },
                })}
              />
              <Input
                className="py-2 px-3 text-sm w-full"
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
            </div>
            <div className="w-full md:w-[48%]">
              <Input
                className="boreder-none block w-full text-sm text-slate-500
        file:mr-4 file:py-2 file:px-4 file:rounded-md
        file:border-0 file:text-sm file:font-semibold
        file:bg-purple-50 file:text-purple-500
        hover:file:bg-purple-100"
                label="Profile Pic: "
                mess={errors.avatar ? String(errors.avatar.message) : ""}
                placeholder="Choose your profile pic"
                type="file"
                {...register("avatar", {
                  required: {
                    value: true,
                    message: "Profile pic is required",
                  },
                  validate: async (fileList) => {
                    if (!fileList.length) return "Cover image is required.";
                    const file = fileList[0] as unknown as File;

                    if (file.size > 5 * 1024 * 1024) {
                      return "File size must be less than 3MB.";
                    }
                  },
                })}
              />
              <Input
                className="boreder-none block w-full text-sm text-slate-500
    file:mr-4 file:py-2 file:px-4 file:rounded-md
    file:border-0 file:text-sm file:font-semibold
    file:bg-purple-50 file:text-purple-500
    hover:file:bg-purple-100"
                label="CoverImage: "
                mess={
                  errors.coverImage ? String(errors.coverImage.message) : ""
                }
                type="file"
                accept="image/*"
                {...register("coverImage", {
                  validate: async (fileList) => {
                    if (!fileList.length) return "Cover image is required.";
                    const file = fileList[0] as unknown as File;

                    if (file.size > 3 * 1024 * 1024) {
                      return "File size must be less than 3MB.";
                    }

                    const image = await new Promise<HTMLImageElement>(
                      (resolve) => {
                        const img = new Image();
                        img.onload = () => resolve(img as HTMLImageElement);
                        img.src = URL.createObjectURL(file);
                      }
                    );

                    if (
                      image.width < 900 ||
                      image.width > 1500 ||
                      image.height < 200 ||
                      image.height > 400
                    ) {
                      return "CoverImage must be 900-1500px wide and 200-400px high.";
                    }

                    return true;
                  },
                })}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full mt-2 rounded-md"
            bgColor="hover:bg-purple-500 bg-purple-400 dark:bg-black dark:hover:bg-zinc-800"
          >
            Create Account
          </Button>
        </form>
        <h3 className="text-center m-2 dark:text-white">OR</h3>
        <div className=" p-3 w-full ">
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
    </div>
  );
}

export default Signup;
