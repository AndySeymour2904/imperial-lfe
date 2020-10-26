export const fetchUrl = async (url, options) => {
    try {
        /* global fetch */
        const res = await fetch(url, options)
        if (res === undefined) {
            throw new Error(`Cannot fetch url ${url}`)
        }
        if (res.ok) {

            if (res.status === 204) {
                const data = await res.text()
                return data
            } else {
                const data = await res.json()
                return data
            }
        } else {
            const err = await res.text()
            throw new Error(err)
        }
    } catch (err) {
        throw new Error(err.message || err || 'Something went wrong!')
    }
}
