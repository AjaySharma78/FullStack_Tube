export interface UserProps {
    _id: string;
    userName: string;
    email: string;
    fullName: string;
    avatar: string;
    coverImage: string;
    isEmailVerified: boolean;
    verifyToken: string;
    verifyTokenExpires: string;
    forgotPasswordToken: string;
    forgotPasswordTokenExpires: string;
    lastUsernameChange: string;
    twoFactorSecret: string;
    isTwoFactorEnabled: boolean;
    googleId: string | null;
    githubId: string | null;
    watchHistory: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}


export interface AuthStateProps {
    user: UserProps | null;
    accessToken: string | null;
    refreshToken: string | null;
    status: boolean | null;
    theme: string;
    // tweetEnabled: boolean | null;
}

