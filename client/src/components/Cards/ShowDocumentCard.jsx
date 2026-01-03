/* eslint-disable */
import { useState } from "react";
import styles from "./ShowDocumentCard.module.css"; // 🟢 Import CSS Module
import { useChatContext } from "../../context/ChatContext";

const ShowDocumentCard = ({ onUploadSuccess }) => {
  const {
    fileUrl,
    selectedFile,
    setIsDocumentPreviewActive,
    handleFileUpload,
    setFileUrl,
    setSelectedFile,
  } = useChatContext();

  const [loading, setLoading] = useState(false);

  // 🔹 Handle Send Action
  const handleSend = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Call upload function from Context (waits for API response)
      const newMessage = await handleFileUpload();

      // 2. If upload failed (returned null), throw error to stop execution
      if (!newMessage) {
        throw new Error("Upload failed or returned no data.");
      }

      // 3. Notify Parent (PersonChat) to update UI immediately
      if (onUploadSuccess) {
        onUploadSuccess(newMessage);
      }

      // 4. Reset & Close Modal
      setIsDocumentPreviewActive(false);
      setFileUrl(null);
      setSelectedFile(null);
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to send file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Cancel Action
  const handleCancel = () => {
    setIsDocumentPreviewActive(false);
    setFileUrl(null);
    setSelectedFile(null);
  };

  // Helper variables (Safe Access)
  const isImage = selectedFile?.type?.startsWith("image/");
  const isVideo = selectedFile?.type?.startsWith("video/");
  const isPdf = selectedFile?.type === "application/pdf";

  // 🟢 FIX: Safe Size Calculation to prevent "NaN MB"
  const fileSize = selectedFile?.size 
    ? (selectedFile.size / 1024 / 1024).toFixed(2) 
    : "0.00";

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>Preview Selection</h3>
        <button onClick={handleCancel} className={styles.closeBtn}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* PREVIEW AREA */}
      <div className={styles.previewArea}>
        {isImage && (
          <img src={fileUrl} alt="Preview" className={styles.imagePreview} />
        )}

        {isVideo && (
          <video controls className={styles.videoPreview}>
            <source src={fileUrl} type={selectedFile?.type} />
            Your browser does not support the video tag.
          </video>
        )}

        {/* Generic Doc / PDF Preview */}
        {!isImage && !isVideo && (
          <div className={styles.docPreview}>
            <i
              className={
                isPdf ? "fa-solid fa-file-pdf" : "fa-solid fa-file-lines"
              }
              style={{
                fontSize: "60px",
                color: isPdf ? "#dc3545" : "#0d6efd",
                marginBottom: "15px",
              }}
            ></i>
            <p style={{ margin: 0, wordBreak: "break-all", fontSize: "14px" }}>
              {selectedFile?.name || "Unknown File"}
            </p>
            <span style={{ fontSize: "12px", color: "#666" }}>
              {fileSize} MB
            </span>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className={styles.actionArea}>
        <button
          onClick={handleCancel}
          className={`${styles.btn} ${styles.btnCancel}`}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          onClick={handleSend}
          className={`${styles.btn} ${styles.btnSend}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i> Sending...
            </>
          ) : (
            <>
              Send <i className="fa-solid fa-paper-plane" style={{ marginLeft: "5px" }}></i>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShowDocumentCard;