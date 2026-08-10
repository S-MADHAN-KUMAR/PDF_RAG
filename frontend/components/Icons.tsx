export function CatMarkIcon({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path
        d="M12 10 L16 20 Q24 16 32 20 L36 10 Q39 16 37 24 Q40 30 36 36 Q30 41 24 41 Q18 41 12 36 Q8 30 11 24 Q9 16 12 10Z"
        fill="#E58B3A"
      />
      <circle cx="18" cy="26" r="2.4" fill="#2C2620" />
      <circle cx="30" cy="26" r="2.4" fill="#2C2620" />
      <path
        d="M22 31 Q24 33 26 31"
        stroke="#2C2620"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function CatFaceIconWhite({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path
        d="M12 10 L16 20 Q24 16 32 20 L36 10 Q39 16 37 24 Q40 30 36 36 Q30 41 24 41 Q18 41 12 36 Q8 30 11 24 Q9 16 12 10Z"
        fill="white"
      />
      <circle cx="18" cy="26" r="2.2" fill="#C96F26" />
      <circle cx="30" cy="26" r="2.2" fill="#C96F26" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusIconSmall() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12a9 9 0 1 1-2.64-6.36M21 4v6h-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function PdfChipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 11.5V7a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12h16M14 6l6 6-6 6"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PawIcon() {
  return (
    <svg className="paw" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="2.1" fill="currentColor" />
      <circle cx="14" cy="6.5" r="2.1" fill="currentColor" />
      <circle cx="18.5" cy="10" r="2" fill="currentColor" />
      <ellipse cx="12" cy="16" rx="5.2" ry="4.4" fill="currentColor" />
    </svg>
  );
}
