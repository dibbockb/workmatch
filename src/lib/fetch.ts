import { ofetch } from "ofetch"

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL

const fetch = ofetch.create({
    baseURL: serverUrl
})

export default fetch;