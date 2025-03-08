const config = {
    cryptoSecrete: String(import.meta.env.VITE_CRYPTOJS_SECRET),
    githubEndpoint: String(import.meta.env.VITE_OAUTH_GITHUB_ENDPOINT),
    googleEndpoint: String(import.meta.env.VITE_OAUTH_GOOGLE_ENDPOINT),
    rteSecret: String(import.meta.env.VITE_RTE_SECRET),
}
export default config