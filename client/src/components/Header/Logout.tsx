import React from 'react'
import {useDispatch} from 'react-redux'
import {logOut} from '../../app/api/slice/authSlice'
import {useNavigate} from 'react-router-dom'
import { logout } from '../../app/api/authApis'
import { toast } from 'sonner'

const LogoutBtn = React.forwardRef(function log({...props},ref:React.ForwardedRef<HTMLButtonElement>){
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const handleLogout = async () => {
      toast.promise(
        new Promise<string>(async (resolve, reject) => {
          try {
            await logout()
            dispatch(logOut())
            navigate('/')
            resolve('Logout successful')
        } catch (error) {
            reject('Logout failed')
        }
        }),
        {
          loading: "Wait a sec logging out...",
          success: (message: string) => message,
          error: (message) => message,
        }
      )
    }
  return (
    <div>  
    <button ref={ref} {...props} className=' rounded-full block w-full text-left px-4 py-2 text-sm  hover:bg-purple-500 hover:text-white hover:dark:bg-purple-800 dark:text-white' onClick={handleLogout} >Logout</button>
    </div>
  )
});

export default LogoutBtn;