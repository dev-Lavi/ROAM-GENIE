import { useState, useCallback } from 'react';

/**
 * Generic API hook.
 * @param {Function} apiFn  – the async function to call
 * @returns {{ data, loading, error, execute }}
 */
const useApi = (apiFn) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFn(...args);
            setData(result);
            return result;
        } catch (err) {
            setError(err.message || 'Something went wrong');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFn]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, loading, error, execute, reset };
};

export default useApi;
