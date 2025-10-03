import { useEffect, useState } from "react";

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault(); // Prevent Chrome’s default prompt
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Listen for appinstalled event
    const installedHandler = () => setIsInstalled(true);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); // Show the install prompt
    const choice = await deferredPrompt.userChoice;
    console.log("User choice:", choice.outcome); // accepted or dismissed
    setDeferredPrompt(null);
  };

  if (isInstalled) return null; // Hide button if already installed

  return (
    <button
      onClick={handleInstall}
      disabled={!deferredPrompt}
      style={{
        padding: "10px 20px",
        background: "#000",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: deferredPrompt ? "pointer" : "not-allowed",
      }}
    >
      Install App
    </button>
  );
}

export default InstallButton;
