import { useChatContext } from '../../context/ChatContext';
import styles from './DocumentCard.module.css';
const DocumentCard = () => {
  const { sendMediaMessage, handleMediaChange } = useChatContext();
  console.log("rendering document card");
  console.log("sendMediaMessage function:", sendMediaMessage);

  const handleFileClick = (event) => {
    const fileInput = event.currentTarget.querySelector('input[type="file"]');
    fileInput.click();


  }
 
  return (
    <div className={styles.documentContainer}>
      <div className={styles.documentSection} onClick={handleFileClick}>
        <input
          type="file"
          multiple
          accept=".pdf, .doc, .docx, .txt"
          size="60"
          onChange={handleMediaChange}
          name="Document"
          style={{ display: 'none' }}
        />
        <div className={styles.document}>
          <i className="fa-solid fa-file"></i>
          <p>Document</p>
        </div>
      </div>
      {/* <div onClick={sendMediaMessage}>submit</div> */}
      <div className={styles.imageSection} onClick={handleFileClick}>
        <input
          type="file"
          accept=".jpg, .jpeg, .png, image/*"
          onChange={handleMediaChange}
          name=""
          style={{ display: 'none' }}
        />
        <div className={styles.document}>
          <i className="fa-solid fa-image"></i>
          <p>Image</p>
        </div>

      </div>
      <div className={styles.videoSection} onClick={handleFileClick}>
        <input
          type="file"
          accept=".mp4, .mkv, video/*"
          onChange={handleMediaChange}
          name=""
          style={{ display: 'none' }}
        />
        <div className={styles.document}>
          <i className="fa-solid fa-file-video"></i>
          <p>Video</p>
        </div>

      </div>
      <div className={styles.songSection} onClick={handleFileClick}>
        <input
          type="file"
          accept=".mp3, .wav, audio/*"
          onChange={handleMediaChange}
          name=""
          style={{ display: 'none' }}
        />
        <div className={styles.document}>
          <i className="fa-solid fa-music"></i>
          <p>Music</p>
        </div>
      </div>
    </div>
  )
}

export default DocumentCard;