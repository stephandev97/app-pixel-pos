import { useEffect, useState } from 'react'
import { pb } from '../lib/pb'

export function useTvScreenUrl(deviceId, displayIndex) {
    const [url, setUrl] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let unsub = null

        const load = async () => {
            setLoading(true)
            try {
                const record = await pb
                    .collection('tv_screens')
                    .getFirstListItem(
                        `device_id="${deviceId}" && display_index=${displayIndex}`
                    )

                setUrl(record.url)
            } catch {
                setUrl(null)
            } finally {
                setLoading(false)
            }
        }

        load()

            ; (async () => {
                try {
                    unsub = await pb
                        .collection('tv_screens')
                        .subscribe('*', () => load())
                } catch { }
            })()

        return () => unsub?.()
    }, [deviceId, displayIndex])

    return { url, loading }
}
