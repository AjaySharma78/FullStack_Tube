const config = {
    cryptoSecrete: String(import.meta.env.VITE_CRYPTOJS_SECRET),
    githubEndpoint: String(import.meta.env.VITE_OAUTH_GITHUB_ENDPOINT),
    googleEndpoint: String(import.meta.env.VITE_OAUTH_GOOGLE_ENDPOINT),
    rteSecret: String(import.meta.env.VITE_RTE_SECRET),
    backendEndpoint: String(import.meta.env.VITE_BACKEND_URL),
    socketEndpoint: String(import.meta.env.VITE_SOCKET_URL),
}
export default config