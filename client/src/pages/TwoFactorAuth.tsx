import { disable2FA, verify2FA, verify2FAToken } from '../app/api/authApis';
import { setCredentials, setUser } from '../app/api/slice/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Input, Button} from '../components/Index';
import { useState } from 'react';
import { toast } from 'sonner';
import { decryptData } from '../utils/format';

interface FormValues {
  token: string;
  backupCode: string;
}

function TwoFactorAuth() {
  const encryptedUserId = new URLSearchParams(window.location.search).get('userId');
  const { register, handleSubmit, formState } = useForm<FormValues>();
  const userStatus = useSelector((state: any) => state.auth.status);
  const user = useSelector((state: any) => state.auth.user);
  const [isBackupCode, setIsBackupCode] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { errors } = formState;
  const disabled2FA = location.state?.disable2FA;
  const userId = decryptData(encryptedUserId);
 
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
        if(disabled2FA){
          toast.promise<string>(
            new Promise<string>(async (resolve, reject) => {
              try {
                const response = await disable2FA(data.token);
                if (response.success) {
                  dispatch(setUser({ ...user, isTwoFactorEnabled: false }));
                  navigate("/security");
                  resolve("2FA disabled successfully");
                } else {
                  reject(response.message);
                }
              } catch (error: any) {
                console.log(error);
                reject("Failed to disable 2FA");
              }
            }),
            {
              loading: "Disabling 2FA...",
              success: (message: string) => message,
              error: (message) => message,
            }
          );
        }else{
        toast.promise<string>(
          new Promise<string>(async (resolve, reject) => {
        try {
          const response = isBackupCode
          ? await verify2FA(userId ? userId : user._id, data.token)
          : await verify2FAToken(userId ? userId : user._id, data.token);
          if (response.success) {
            dispatch(
              setCredentials({
                user: response.data.user,
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
              })
            );
            navigate("/");
            resolve(response.message);
          } else {
            console.log(response);
            reject(response.message);
          }
        } catch (error: any) {
          console.log(error);
          reject("2FA verification failed");
        }
      }),
      {
        loading: "Verifying token...",
        success: (message: string) => message,
        error: (message) => message,
      }
    );
  }
  };

  return (
    <div className="flex items-center justify-center ">
      <div className={`w-11/12 md:w-full max-w-md bg-gray-100 rounded-xl p-5 md:p-10 border border-black/10 dark:bg-zinc-900 dark:border-white`}>
        <h2 className="text-center text-lg md:text-2xl font-bold leading-tight dark:text-white">
          Two-Factor Authentication
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div>
            <Input
              label="2FA Token:"
              className="py-2 px-3 text-sm"
              type="text"
              mess={errors.token ? String(errors.token.message) : ""}
              placeholder="Enter your 2FA token"
              {...register("token", {
                required: {
                  value: true,
                  message: "2FA token is required",
                },
              })}
            />
          {!userStatus &&  <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="backupCode"
                {...register("backupCode")}
                onChange={(e) => setIsBackupCode(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="backupCode" className="text-sm dark:text-white">
                Use Backup Code
              </label>
            </div>}
            <Button
              type="submit"
              className="w-full mt-4 rounded-md"
              bgColor="bg-purple-400 hover:bg-purple-500"
            >
              Verify
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TwoFactorAuth;