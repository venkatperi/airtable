import fetch, { Request, RequestInit } from "node-fetch"
import { RequestOptions, safeEncodeURIComponent, serialize } from './serialize'

const BASE_ENDPOINT = 'https://api.airtable.com/v0/'

const noop = () => {
}

const fetchJson = async (url: string | Request, init?: RequestInit) => {
    let resp = await fetch(url, init)
    return resp.json()
}

type Logger = (...params: any[]) => void

type AirTableConfig = {
    log?: Logger
    base?: string
    table?: string,
    apiKey?: string,
    view?: string
}


export class AirTable {
    config: AirTableConfig

    log: (params: any) => void

    constructor(config: AirTableConfig) {
        this.log = config.log || noop
        this.config = config
    }

    base(ref: string) {
        this.config.base = ref
        return this
    }

    create(params: string[]) {
        const {base, table, apiKey} = this.config
        if (!apiKey) throw new Error('apiKey is not defined')
        if (!base) throw new Error('base is not defined')
        if (!table) throw new Error('table is not defined')

        const url = `${BASE_ENDPOINT}${base}/${safeEncodeURIComponent(table)}`
        this.log(url)
        return fetchJson(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + apiKey,
            },
            body: JSON.stringify(params),
        })
    }

    delete(...id: string[]) {
        const {base, table, apiKey} = this.config
        if (!apiKey) throw new Error('apiKey is not defined')
        if (!base) throw new Error('base is not defined')
        if (!table) throw new Error('table is not defined')

        const url = `${BASE_ENDPOINT}${base}/${safeEncodeURIComponent(
            table)}/${id}`
        this.log(url)
        return fetchJson(url, {
            method: 'DELETE',
            headers: {
                Authorization: 'Bearer ' + apiKey,
            },
        })
    }

    list(params: RequestOptions = {}) {
        const {apiKey} = this.config

        // @ts-ignore
        const req = async (accumulator: any = null, offset = '') => {
            console.log(offset)
            const url = this.stringify({...params, offset})

            this.log(url)

            let data = await fetchJson(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            })

            this.log(data)

            if (!data || !data.records) {
                return data
            }

            let {records} = data

            if (accumulator) {
                if (records.length) {
                    accumulator.records = accumulator.records.concat(records)
                }
            } else {
                accumulator = data
            }

            if (!data.offset) {
                return accumulator
            }

            offset = data.offset
            delete accumulator.offset
            return req(accumulator, offset)
        }

        // @ts-ignore
        return req(null, params.offset || '')
    }

    retrieve(id: string) {
        const {base, table, apiKey} = this.config
        if (!apiKey) throw new Error('apiKey is not defined')
        if (!base) throw new Error('base is not defined')
        if (!table) throw new Error('table is not defined')

        const url = `${BASE_ENDPOINT}${base}/${safeEncodeURIComponent(
            table)}/${id}`
        this.log(url)
        return fetchJson(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
            },
        })
    }

    stringify(params: RequestOptions = {},) {
        const {base, table, view} = this.config
        if (!base) throw new Error('base is not defined')
        if (!table) throw new Error('table is not defined')
        const merged: RequestOptions = {
            maxRecords: 20,
            ...params,
        }

        if (view) {
            merged.view = view
        }

        let url = `${BASE_ENDPOINT}${base}/${safeEncodeURIComponent(table)}`

        if (Object.keys(merged).length) {
            url += `?${serialize(merged)}`
        }
        return url
    }

    table(ref: string) {
        this.config.table = ref
        return this
    }

    update(id: string, params: RequestOptions = {}) {
        const {base, table, apiKey} = this.config
        if (!apiKey) throw new Error('apiKey is not defined')
        if (!base) throw new Error('base is not defined')
        if (!table) throw new Error('table is not defined')
        const url = `${BASE_ENDPOINT}${base}/${safeEncodeURIComponent(
            table)}/${id}`
        this.log(url)

        return fetchJson(url, {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + apiKey,
            },
            body: JSON.stringify({fields: params.fields || params}),
        })
    }

    view(ref: string) {
        this.config.view = ref
        return this
    }
}

