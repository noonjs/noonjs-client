import EventEmitter from "./event-emitter"
import MyAxios from "./my-axios"
import Token from "./token"

export default class Auth extends EventEmitter<{ login: (token: Token) => void, register: (token: Token) => void, logout: () => void }> {
    private static instance: Auth
    public static getInstance(axios: MyAxios): Auth {
        if (!Auth.instance)
            Auth.instance = new Auth(axios)
        return Auth.instance
    }
    constructor(private readonly axios: MyAxios) {
        super()
    }

    login(dto: any, signal?: AbortSignal): Promise<Token> {
        return this.axios.create().post("/auth/login", dto, { signal, withCredentials: true, headers: { Authorization: undefined } }).then(({ data }) => {
            this.emit("login", data)
            return data
        })
    }

    register(dto: any, signal?: AbortSignal): Promise<Token> {
        return this.axios.create().post("/auth/register", dto, { signal, withCredentials: true, headers: { Authorization: undefined } }).then(({ data }) => {
            this.emit("register", data)
            return data
        })
    }

    get(signal?: AbortSignal) {
        return this.axios.create().get("/auth", { signal }).then(r => r.data)
    }

    password(dto: any, signal?: AbortSignal): Promise<boolean> {
        return this.axios.create().patch("/auth/password", dto, { signal }).then(r => r.data)
    }

    logout(signal?: AbortSignal) {
        this.axios.create().get("/auth/logout", { signal, withCredentials: true, headers: { Authorization: undefined } }).then(() => {
            this.emit("logout")
        })
    }

    token() {
        return this.axios.token
    }
}