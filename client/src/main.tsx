import './index.css'
import { Toaster } from 'sonner'
import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import router from './routes/Route.tsx'
import store from './app/store/store.ts'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

// import TweetRoute from './routes/TweetRoute.tsx'
// import { selectTweetEnabled } from './app/api/slice/authSlice.ts'

// const AppRouter = () => {
  // const tweet = useSelector(selectTweetEnabled);
//   return <RouterProvider router={router} />;
// };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
    <RouterProvider router={router} />
    <Toaster
    position="bottom-left"
    richColors  
    />
    </Provider>
  </StrictMode>,
)
