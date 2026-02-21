import React from 'react';

const PageWrapper = ({ children, title = 'RoamGenie', className = '' }) => {
    React.useEffect(() => {
        document.title = `${title} · RoamGenie`;
    }, [title]);

    return (
        <main
            className={`animated-bg ${className}`}
            style={{ minHeight: '100vh', paddingTop: '68px' }}
        >
            {children}
        </main>
    );
};

export default PageWrapper;
