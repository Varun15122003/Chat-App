
import PropTypes from "prop-types"; // 🟢 1. Import PropTypes

const FullMediaView = ({ mediaUrl, mediaType, onClose }) => {
  if (!mediaUrl) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      {/* Close Button */}
      <button style={styles.closeBtn} onClick={onClose}>
        <i className="fa-solid fa-xmark"></i>
      </button>

      {/* Content Container */}
      <div style={styles.content} onClick={(e) => e.stopPropagation()}>
        {mediaType === "image" ? (
          <img src={mediaUrl} alt="Full View" style={styles.media} />
        ) : (
          <video src={mediaUrl} controls autoPlay style={styles.media} />
        )}
      </div>
    </div>
  );
};

// 🟢 2. Props Validation Add Karein
FullMediaView.propTypes = {
  mediaUrl: PropTypes.string, // URL string hona chahiye
  mediaType: PropTypes.string, // 'image' ya 'video' string hona chahiye
  onClose: PropTypes.func.isRequired, // Function hona zaroori hai
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    cursor: "pointer",
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "30px",
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "30px",
    cursor: "pointer",
    zIndex: 10000,
  },
  content: {
    maxWidth: "90%",
    maxHeight: "90%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    maxWidth: "100%",
    maxHeight: "90vh",
    objectFit: "contain",
    borderRadius: "8px",
    boxShadow: "0 0 20px rgba(255,255,255,0.1)",
  },
};

export default FullMediaView;