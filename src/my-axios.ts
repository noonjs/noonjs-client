import axios, { AxiosInstance } from "axios"
import Token from "./token"
import EventEmitter from "./event-emitter"

export default class MyAxios extends EventEmitter<{ token: (token: Token | undefined) => void, error: (error: any) => void }> {
    private static instance: MyAxios
    token?: Token
    public static getInstance(baseURL?: string): MyAxios {
        if (!MyAxios.instance)
            MyAxios.instance = new MyAxios(baseURL)
        return MyAxios.instance
    }

    constructor(private readonly baseURL?: string) {
        super()
    }

    async refresh() {
        try {
            const { refresh } = this.token ?? {}
            const { data: { access } } = await axios.post("/auth/refresh", { refresh }, { baseURL: this.baseURL, withCredentials: true })
            this.emit("token", { access, refresh })
            return access
        } catch (error: any) {
            this.emit("token", undefined)
        }
    }

    create(config?: any): AxiosInstance {
        const { access } = this.token ?? {}
        const baseURL = this.baseURL
        const a = axios.create({ baseURL, headers: { Authorization: access }, params: config?.params, withCredentials: false })

        a.interceptors.response.use(resp => resp, async err => {

            if (err.response.status === 401) {
                const access = await this.refresh()
                if (access)
                    return axios({ ...err.config, data: err.config.data && JSON.parse(err.config.data), headers: { Authorization: access } })
            }

            if (err.response.status === 429)
                await new Promise(resolve => setTimeout(resolve, 2 * 1000)) // too-many-request-error

            this.emit("error", err.response.data)
            throw err.response.data
        })

        return a
    }
}