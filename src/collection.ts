import { Socket } from "socket.io-client";
import EventEmitter from "./event-emitter";
import MyAxios from "./my-axios";

export type PatchOperators<T> = { $inc?: T, $set?: any, $unset?: T, $currentDate?: any, $mul?: T, $push?: any, $pull?: any, $pop?: -1 | 1, $pullAll?: any[], $addToSet?: any, [name: string]: any }

export default class Collection extends EventEmitter<{ created: any, patched: any, deleted: any }> {

    constructor(private readonly name: string, private readonly axios: MyAxios) {
        super()
    }

    count(options?: { query?: { [K: string]: any } | { [key: string]: any }, signal?: AbortSignal }): Promise<{ total: number }>
    count({ signal, ...params }: any = {}) {
        return this.axios.create({ params }).get(`${this.name}/count`, { signal }).then(x => x.data)
    }

    get(options?: { q?: { [K: string]: any } | { [key: string]: any }, signal?: AbortSignal, sort?: { [K: string]: any }, limit?: number, skip?: number, proj?: string | string[] }): Promise<any[]>
    get({ signal, ...params }: any = {}) {

        return this.axios.create({ params }).get(this.name, { signal }).then(r => r.data)
    }

    post(dto: any, signal?: AbortSignal): Promise<any>
    post(dto: any[], signal?: AbortSignal): Promise<any[]>
    post(dto: any | any[], signal?: AbortSignal) {
        return this.axios.create().post(this.name, dto, { signal }).then(({ data }) => {
            this.emit("created", data)
            return data
        })
    }

    patch(dto: any | PatchOperators<any>, options?: { query?: { [K: string]: any } | { [key: string]: any }, many?: false, signal?: AbortSignal }): Promise<any>;
    patch(dto: any | PatchOperators<any>, options?: { query?: { [K: string]: any } | { [key: string]: any }, many?: true, signal?: AbortSignal }): Promise<{
        acknowledged: boolean,
        modifiedCount: number,
        upsertedId: string,
        upsertedCount: number,
        matchedCount: number
    }>;
    patch(dto: any, { signal, ...params }: any = {}) {
        return this.axios.create({ params }).patch(this.name, dto, { signal }).then(({ data }) => {
            this.emit("patched", data)
            return data
        })
    }

    delete(_id?: string, signal?: AbortSignal): Promise<any>;
    delete(query?: { [K: string]: any }, signal?: AbortSignal): Promise<{ acknowledged: boolean, deletedCount: number }>;
    delete(query?: string | { [key: string]: any }, signal?: AbortSignal) {
        if (typeof query === 'string' || query instanceof String)
            return this.axios.create().delete(`${this.name}/${query}`, { signal }).then(({ data }) => {
                this.emit("deleted", data)
                return data
            })
        else
            return this.axios.create({ params: { query } }).delete(`${this.name}`, { signal }).then(({ data }) => {
                this.emit("deleted", data)
                return data
            })
    }
}