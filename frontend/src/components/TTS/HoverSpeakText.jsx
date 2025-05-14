import React from "react";
import { useTTS } from "../TTS/TTSContext"; // Adjust path as needed

const HoverSpeakText = ({ children, textToSpeak }) => {
  const { isTTSEnabled, speak, stop, isSpeaking } = useTTS();

  const getTextFromChildren = (node) => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(getTextFromChildren).join(" ");
    if (typeof node === "object" && node?.props?.children) {
      return getTextFromChildren(node.props.children);
    }
    return "";
  };

  const handleMouseEnter = () => {
    if (!isTTSEnabled) return;
    const text = textToSpeak || getTextFromChildren(children);
    if (isSpeaking) stop();
    speak(text);
  };

  const handleMouseLeave = () => {
    if (isSpeaking) stop();
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      style={{ cursor: "help" }}
      tabIndex={0} // Allows keyboard focus for accessibility
    >
      {children}
    </span>
  );
};

export default HoverSpeakText;
