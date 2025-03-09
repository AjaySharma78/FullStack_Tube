import {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import { selectCurrentStatus} from '../app/api/slice/authSlice'

export default function Protected({children, authentication = true}:{children:React.ReactNode, authentication?:boolean}){

    const navigate = useNavigate()

    const [loader, setLoader] = useState(true)

    const authStatus = useSelector(selectCurrentStatus);
    
    useEffect(() => {
        if(authentication && authStatus  !== authentication){
            navigate("/login")
        } else if(!authentication && authStatus  !== authentication){
            navigate("/")
        }
        setLoader(false)
    }, [authStatus, navigate, authentication])

  return loader ? <h1>Loading...</h1> : <> {children}</>
}