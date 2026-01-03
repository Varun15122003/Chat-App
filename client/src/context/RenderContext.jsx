import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const RenderContext = createContext();

export const useRenderContext = () => {
    const context = useContext(RenderContext);
    if (!context) {
        throw new Error("useRenderContext must be used within a RenderProvider");
    }
    return context;
};

const RenderProvider = ({ children }) => {
    // Only manage the STATE here, not the components
    const [activeTab, setActiveTab] = useState('chat');

    return (
        <RenderContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </RenderContext.Provider>
    );
};

RenderProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default RenderProvider;