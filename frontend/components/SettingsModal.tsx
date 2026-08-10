"use client";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onClearHistory: () => void;
}

export default function SettingsModal({
  open,
  onClose,
  onClearHistory,
}: SettingsModalProps) {
  const handleClearHistory = () => {
    if (
      !confirm(
        "This will permanently delete all saved chats from this browser. Continue?"
      )
    )
      return;
    onClearHistory();
  };

  return (
    <div className={`modal-overlay ${open ? "open" : ""}`} id="settingsModal">
      <div className="modal">
        <h3>Settings</h3>
        <p className="sub">Manage local chat data.</p>

        <div className="danger-row">
          <div>
            <div style={{ fontWeight: 600, fontSize: "13px" }}>
              Clear chat history
            </div>
            <div className="danger-text">
              Removes all saved chats from this browser.
            </div>
          </div>
          <button className="danger-btn" onClick={handleClearHistory}>
            Clear
          </button>
        </div>

        <div className="modal-actions">
          <button className="modal-btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
