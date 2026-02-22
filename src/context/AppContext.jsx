import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [travelPlan, setTravelPlan] = useState(null);
    const [passportData, setPassportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // ── Theme ──────────────────────────────────────────────────────────────────
    const [theme, setTheme] = useState(() => {
        // Restore from localStorage or default to dark
        return localStorage.getItem('rg-theme') || 'dark';
    });

    // Apply / remove the 'light' class on <html> whenever theme changes
    useEffect(() => {
        const html = document.documentElement;
        if (theme === 'light') {
            html.classList.add('light');
        } else {
            html.classList.remove('light');
        }
        localStorage.setItem('rg-theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(t => (t === 'dark' ? 'light' : 'dark'));
    }, []);

    // ── Notifications ─────────────────────────────────────────────────────────
    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return (
        <AppContext.Provider value={{
            travelPlan, setTravelPlan,
            passportData, setPassportData,
            loading, setLoading,
            error, setError, clearError,
            notification, showNotification,
            theme, toggleTheme,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used inside AppProvider');
    return ctx;
};
