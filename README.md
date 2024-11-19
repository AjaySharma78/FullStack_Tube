# **Backend-Youtube-Tweet**

## **User Routes**

| Method  | Endpoint                                  | Description                                  |
| ------- | ----------------------------------------- | -------------------------------------------- |
| `PATCH` | `/users/update/u/email-username-fullname` | Update user's email, username, and full name |
| `PATCH` | `/users/update-avatar`                    | Update user's avatar image                   |
| `PATCH` | `/users/update-cover-image`               | Update user's cover image                    |
| `PATCH` | `/users/reset-password`                   | Reset user password                          |
| `POST`  | `/users/register`                         | Register a new user                          |
| `POST`  | `/users/verify-email?token=`              | Verify user email                            |
| `POST`  | `/users/login`                            | Login user                                   |
| `POST`  | `/users/logout`                           | Logout user                                  |
| `POST`  | `/users/refresh-token`                    | Refresh authentication token                 |
| `POST`  | `/users/resend-verification-email`        | Resend email verification                    |
| `POST`  | `/users/forgot-password`                  | Send forgot password email                   |
| `POST`  | `/users/change-password`                  | Change user password                         |
| `GET`   | `/users/get-current-user`                 | Get current logged-in user's details         |
| `GET`   | `/users/user-channel-profile`             | Get current user's channel profile           |
| `GET`   | `/users/watch-history`                    | Get current user's watch history             |
| `GET`   | `/users/channel/:userName`                | Get another user's channel profile           |
| `GET`   | `/users/auth/google`                      | Login via Google OAuth                       |
| `GET`   | `/users/auth/github`                      | Login via GitHub OAuth                       |

---

## **Video Routes**

| Method   | Endpoint                                    | Description                                  |
| -------- | ------------------------------------------- | -------------------------------------------- |
| `PATCH`  | `/videos/update-title-description/:videoId` | Update video title and description           |
| `PATCH`  | `/videos/:videoId`                          | Update video thumbnail                       |
| `PATCH`  | `/videos/:videoId/toggle-status`            | Publish or unpublish a video                 |
| `PATCH`  | `/videos/:videoId/increment-views`          | Increment video views                        |
| `POST`   | `/videos`                                   | Upload a new video                           |
| `GET`    | `/videos/user-all-video`                    | Get all videos uploaded by the current user  |
| `GET`    | `/videos`                                   | Fetch all videos with sorting and pagination |
| `GET`    | `/videos/:videoId/:userId`                  | Get video by ID                              |
| `DELETE` | `/videos/:videoId`                          | Delete a video by ID                         |

---

## **Tweet Routes**

| Method   | Endpoint             | Description            |
| -------- | -------------------- | ---------------------- |
| `PATCH`  | `/tweets/t/:tweetId` | Update a tweet         |
| `POST`   | `/tweets`            | Add a new tweet        |
| `GET`    | `/tweets/t/:tweetId` | Get tweet by id        |
| `GET`    | `/tweets`            | Get all tweets of user |
| `DELETE` | `/tweets/t/:tweetId` | Delete tweet           |

---

## **Interaction Routes**

### **Likes**

| Method  | Endpoint                       | Description                     |
| ------- | ------------------------------ | ------------------------------- |
| `PATCH` | `/likes/toggle/v/:videoId`     | Like or unlike a video          |
| `PATCH` | `/likes/toggle/c/:commentId`   | Like or unlike a video comment  |
| `PATCH` | `/likes/toggle/t/:tweetId`     | Like or unlike a tweet          |
| `PATCH` | `/likes/toggle/t/c/:commentId` | Like or unlike a tweet comment  |
| `GET`   | `/likes/videos`                | Get all liked videos for a user |

### **Dislikes**

| Method  | Endpoint                          | Description                                    |
| ------- | --------------------------------- | ---------------------------------------------- |
| `PATCH` | `/dislikes/toggle/v/:videoId`     | Dislike or remove dislike from a video         |
| `PATCH` | `/dislikes/toggle/c/:commentId`   | Dislike or remove dislike from a video comment |
| `PATCH` | `/dislikes/toggle/t/:tweetId`     | Dislike or remove dislike from a tweet         |
| `PATCH` | `/dislikes/toggle/t/c/:commentId` | Dislike or remove dislike from a tweet comment |

---

## **Comment Routes**

| Method   | Endpoint                 | Description                    |
| -------- | ------------------------ | ------------------------------ |
| `PATCH`  | `/comments/:commentId`   | Update a comment on a video    |
| `PATCH`  | `/comments/t/:commentId` | Update a comment on a tweet    |
| `POST`   | `/comments/v/:videoId`   | Add a new comment to a video   |
| `POST`   | `/comments/t/:tweetId`   | Add a new comment to a tweet   |
| `GET`    | `/comments/t/:videoId`   | Fetch all comments for a video |
| `GET`    | `/comments/t/:tweetId`   | Fetch all comments for a tweet |
| `DELETE` | `/comments/v/:commentId` | Delete a comment from a video  |
| `DELETE` | `/comments/t/:commentId` | Delete a comment from a tweet  |

---

## **Subscription Routes**

| Method | Endpoint                                       | Description                             |
| ------ | ---------------------------------------------- | --------------------------------------- |
| `POST` | `/subscriptions/togglesubscription/:channelId` | Subscribe or unsubscribe from a channel |
| `GET`  | `/subscriptions/channel`                       | Get all subscribed channels             |
| `GET`  | `/subscriptions/subscribers`                   | Get all subscribers                     |
| `GET`  | `/`                                            | Get all subscription                    |

---

## **Playlist Routes**

| Method   | Endpoint                                           | Description                   |
| -------- | -------------------------------------------------- | ----------------------------- |
| `PATCH`  | `/playlists/add-remove/video/playlist`             | Add video to playlist         |
| `POST`   | `/playlists`                                       | Create a new playlist         |
| `GET`    | `/playlists/get-user-playlist/:userId`             | Get all playlist for user     |
| `DELETE` | `/playlists/add-remove/video/playlist`             | Remove video from playlist    |
| `DELETE` | `/playlists/remove-all-video/playlist/:playlistId` | Remove allvideo from playlist |

---

### 🛠 **Tech Stack**

- **Node.js** with **Express.js** for the server.
- **MongoDB** for the database, including the use of aggregation pipelines for complex queries.
- Authentication: **JWT** and OAuth.
- **Version Control**: Git.
- **API Testing**: Postman.

---
