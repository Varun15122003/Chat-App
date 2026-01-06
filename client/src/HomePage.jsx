import styles from './HomePage.module.css';
import Sidebar from './components/Sidebar';
import PersonChat from './components/PersonChat';
import { useRenderContext } from './context/RenderContext';

// Import your cards here instead
import ChatCard from './components/Cards/ChatCard';
import StatusCard from './components/Cards/StatusCard';
import ProfileCard from './components/Cards/ProfileCard';
import SettingCard from './components/Cards/SettingCard';
import NewChat from './components/Cards/NewChat';

const HomePage = () => {
    const { activeTab } = useRenderContext();

    // Helper function to decide what to render
    const renderContent = () => {
        switch (activeTab) {
            case 'chat': return <ChatCard />;
            case 'status': return <StatusCard />;
            case 'channels': return <ChatCard />;
            case 'communities': return <StatusCard />;
            case 'profile': return <ProfileCard />;
            case 'setting': return <SettingCard />;
            case 'newChat': return <NewChat />;
            default: return <ChatCard />;
        }
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            {renderContent()}
            <PersonChat />
        </div>
    );
};

export default HomePage;