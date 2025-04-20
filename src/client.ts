import { Socket, io } from "socket.io-client"
import EventEmitter from "./event-emitter"
import Collection from "./collection"
import MyAxios from "./my-axios"
import Auth from "./auth"
import Token from "./token"

export default class Client {
    private event = new EventEmitter<{ token: (token?: Token) => void, error: (error: any) => void }>()
    io?: Socket
    private _collections: { [name: string]: Collection } = {}
    private _auth: Auth
    private axios: MyAxios

    on(event: any, listener: (x: any) => any) {
        this.event.on(event, listener)
    }

    off(event: any, listener: (x: any) => any) {
        this.event.off(event, listener)
    }

    collection<T>(name: string) {

        if (!this._collections[name])
            this._collections[name] = new Collection(name, this.axios)

        return this._collections[name]
    }

    auth() {
        return this._auth
    }

    private setToken(token?: Token) {
        this.axios.token = token
        if (this.io) {
            this.io.disconnect()
            this.io.auth = { token: token?.access }
            this.io.connect()
        }
        this.event.emit("token", token)
    }

    private emitError(err: any) {
        this.event.emit("error", err)
    }

    live() {
        const { server = "http://localhost:4000/" } = this.options
        this.io = io(server, { auth: { token: this.axios.token?.access } })
        this.io.on("collection", (type: any, model: any, data: any, io: any) => this._collections[model]?.emit(type, { data, io }))
    }

    constructor(private readonly options: { server?: string, token?: Token, io?: boolean } = {}) {
        this.options.io ??= true;
        const { server = "http://localhost:4000/" } = options
        this.axios = new MyAxios(`${server}`)
        if (options.token)
            this.axios.token = options.token
        this._auth = Auth.getInstance(this.axios)
        this.init()
    }

    init() {
        if (this.options.io !== false)
            this.live()

        this.auth().on(["login", "register", "logout"], x => this.setToken(x))
        this.axios.on("token", x => this.setToken(x))
        this.axios.on("error", x => this.emitError(x))
    }

    close() {
        try {
            this.io?.disconnect()

            this.auth().removeAllListeners()
            this.axios.removeAllListeners()
            this.io?.removeAllListeners()
        } catch (error) {
            this.emitError(error)
        }
    }
}