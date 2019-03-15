// lifted from https://github.com/jquery/jquery/blob/2.2-stable/src/serialize.js

export type RequestOptions = {
    [k in string]: string | string[] | number | undefined
}

type InsertFn = (key: string, value: string | number  | undefined) => void

export const safeEncodeURIComponent = (str: string) => {
    let decoded = decodeURIComponent(str)
    while (str !== decoded) {
        str = decoded
        decoded = decodeURIComponent(str)
    }
    return encodeURIComponent(decoded)
}

function buildParams(prefix: string,
    maybeArray: string | Array<string> | number | undefined,
    insert: InsertFn) {
    if (Array.isArray(maybeArray)) {
        maybeArray.forEach((value, index) => {
            if (/\[\]$/.test(prefix)) {
                insert(prefix, value)
            } else {
                let val = value && typeof value === 'object' ? index : ''
                buildParams(`${prefix}[${val}]`, value, insert)
            }
        })
    } else if (typeof maybeArray === 'object') {
        Object.keys(maybeArray).forEach(name => {
            buildParams(prefix + '[' + name + ']', maybeArray[name], insert)
        })
    } else {
        insert(prefix, maybeArray)
    }
}


export const serialize = (obj: RequestOptions) => {
    const parts: string[] = []

    const insert: InsertFn = (key: string,
        value: string | number | undefined) => {
        value = (value === null || value === undefined) ? '' : value
        parts.push(
            safeEncodeURIComponent(key) + '=' + safeEncodeURIComponent(String(value)))
    }

    Object.keys(obj).forEach(key => {
        buildParams(key, obj[key], insert)
    })

    return parts.join('&').replace(/%20/g, '+')
}

