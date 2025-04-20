import { Socket } from "socket.io-client";
import EventEmitter from "./event-emitter";
import MyAxios from "./my-axios";

export type PatchOperators<T> = { $inc?: T, $set?: any, $unset?: T, $currentDate?: any, $mul?: T, $push?: any, $pull?: any, $pop?: -1 | 1, $pullAll?: any[], $addToSet?: any, [name: string]: any }

export default class Collection extends EventEmitter<{ created: (data: any, io?: string) => void, patched: (data: any, io?: string) => void, deleted: (data: any, io?: string) => void }> {

    constructor(private readonly name: string, private readonly axios: MyAxios) {
        super()
    }

    count(q?: { [key: string]: any }, signal?: AbortSignal): Promise<{ total: number }> {
        return this.axios.create({ params: { q } }).get(`${this.name}/count`, { signal }).then(x => x.data)
    }

    get(options?: { q?: { [key: string]: any }, signal?: AbortSignal, sort?: { [key: string]: any }, limit?: number, skip?: number, project?: string | string[] }): Promise<any[]>
    get({ signal, ...params }: any = {}) {
        return this.axios.create({ params }).get(this.name, { signal }).then(r => r.data)
    }

    post(dto: any, signal?: AbortSignal): Promise<any> {
        return this.axios.create().post(this.name, dto, { signal }).then(({ data }) => {
            this.emit("created", { data })
            return data
        })
    }

    patch(dto: any | PatchOperators<any>, q?: { [key: string]: any }, signal?: AbortSignal): Promise<any> {
        return this.axios.create({ params: { q } }).patch(this.name, dto, { signal }).then(({ data }) => {
            this.emit("patched", data)
            return data
        })
    }

    delete(q?: { [key: string]: any }, signal?: AbortSignal): Promise<any> {
        return this.axios.create({ params: { q } }).delete(`${this.name}`, { signal }).then(({ data }) => {
            this.emit("deleted", data)
            return data
        })
    }
}