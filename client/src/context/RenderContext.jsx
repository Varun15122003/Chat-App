import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import ChatCard from '../components/Cards/ChatCard';
import StatusCard from '../components/Cards/StatusCard';
import ProfileCard from '../components/Cards/ProfileCard';
import SettingCard from '../components/Cards/SettingCard';
import NewChat from '../components/Cards/NewChat';

const RenderContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useRenderContext = () => useContext(RenderContext);

const RenderProvider = ({ children }) => {
    const [activeTab, setActiveTab] = useState('chat');

    const renderComponent = () => {
        switch (activeTab) {
            case 'chat':
                return <ChatCard />;
            case 'status':
                return <StatusCard />;
            case 'channels':
                return <ChatCard />;
            case 'communitie':
                return <StatusCard />;
            case 'profile':
                return <ProfileCard />;
            case 'setting':
                return <SettingCard />;
            case 'newChat':
                return <NewChat />;
            default:
                return <ChatCard />;
        }
    };

    return (
        <RenderContext.Provider
            value={{
                activeTab,
                setActiveTab,
                renderComponent,
            }}
        >
            {children}
        </RenderContext.Provider>
    );
};

RenderProvider.propTypes = {
    children: PropTypes.node.isRequired,
};



export default RenderProvider;