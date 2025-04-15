import { Socket, io } from "socket.io-client"
import EventEmitter from "./event-emitter"
import Collection from "./collection"
import MyAxios from "./my-axios"
import Auth from "./auth"
import Token from "./token"

type E = { connected: false | string, welcome: string[], error: string, token?: Token }

export default class Client {
    private event: EventEmitter<E> = new EventEmitter()
    io?: Socket
    private _collections: { [name: string]: Collection } = {}
    private _auth: Auth
    private axios: MyAxios

    on<K extends keyof E>(event: K, handler: (value: E[K], io: string | false) => void): void {
        this.event.on(event, handler)
    }

    off<K extends keyof E>(event: K, handler: any) {
        this.event.off(event, handler)
    }

    collection<T>(name: string) {

        if (!this._collections[name])
            this._collections[name] = new Collection(name, this.axios)

        return this._collections[name]
    }

    auth() {
        return this._auth
    }

    live() {
        const { server = "http://localhost:4000/" } = this.options
        
        this.io = io(server, { auth: { token: this.axios.token?.access } })

        this.io.on("collection", (type, model, data, io) => {
            this._collections[model]?.emit(type, data, io)
        })
    }



    constructor(private readonly options: { server?: string, token?: Token, io?: boolean } = {}) {

        this.options.io ??= true;

        const { server = "http://localhost:3000/" } = options

        // console.log(`connecting... ${server}`)

        this.axios = new MyAxios(`${server}`)

        if (options.token)
            this.axios.token = options.token

        this._auth = Auth.getInstance(this.axios)

        if (options.io !== false)
            this.live()

        const setToken = (token?: Token) => {
            this.axios.token = token
            if (this.io) {
                this.io.disconnect()
                this.io.auth = { token: token?.access }
                this.io.connect()
            }
            this.event.emit("token", token)
        }

        this.auth().on(["login", "register", "logout"], setToken)

        this.axios.on("token", setToken)
    }
}