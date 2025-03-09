import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/TweetPage/Home"

const TweetRoute = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
               path: "/",
                element: <Home />,
            }
        ]
    }
])

export default TweetRoute;