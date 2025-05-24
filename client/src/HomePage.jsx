import styles from './Homepage.module.css'
import Sidebar from './components/Sidebar'
import PersonChat from './components/PersonChat'
import { useRenderContext } from './context/RenderContext'

const HomePage = () => {
    const { renderComponent } = useRenderContext()

    if(!renderComponent){
        return <div>Loading</div>
    }

    return (
        <>
            <div className={`${styles.container}`}>
                <Sidebar />
                {renderComponent && useRenderContext && renderComponent()}
                <PersonChat />
            </div>
        </>
    )
}

export default HomePage