import { useEffect, useState } from "react"
import { allTweets } from "../../app/api/tweetApis"
import { Tweet } from "../../interface/tweetInterface";
const Home = () => {
  
  const [tweets, setTweets] = useState<Tweet[]>([]);

  useEffect(()=>{
    const fetchTweets = async () => {
      try {
        const response = await allTweets();
        setTweets(response.data);
        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchTweets();
  },[])
  return (
    <div className="w-full h-full flex justify-center items-center flex-col gap-4 p-5">
       {
          tweets.map((tweet) => (
            <div key={tweet._id} className="w-[45%] bg-white shadow-md rounded-md ">
             <div className="w-full flex justify-start gap-2 p-2 border-b border-gray-500">
              <div className="w-14 h-14"><img src={tweet.tweetOwner.avatar} alt="image/jpg" className="w-full h-full rounded-full object-cover" /></div>
              <div>
                <h3 className="text-sm font-semibold">{tweet.tweetOwner.fullName}</h3>
                <h3 className="text-xs text-gray-500">@{tweet.tweetOwner.userName}</h3>
              </div>
             </div>

             <div className="w-full p-2 flex overflow-x-auto">
              {
                tweet.images.length > 0 && tweet.images.map((link,index)=>(
                  <div className="w-full flex" key={index}>
                  <img src={link}  alt="image/jpg" className="w-full h-full object-cover" />
                </div>
                ))
              }
             </div>
             <div></div>
            </div>
          ))
       }
    </div>
  )
}

export default Home
