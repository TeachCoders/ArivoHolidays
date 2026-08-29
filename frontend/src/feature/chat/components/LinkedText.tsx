"use client";

import React from "react";

export const URL_RE = /(https?:\/\/[^\s]+|\/(?:[a-zA-Z0-9][a-zA-Z0-9\-_]*\/?)+)/g;
export const URL_ONLY_RE = /^(https?:\/\/[^\s]+|\/(?:[a-zA-Z0-9][a-zA-Z0-9\-_]*\/?)+)$/;

/** Renders message text with clickable links (used for bot-shared page URLs). */
export const LinkedText: React.FC<{ text: string; dark?: boolean }> = ({ text, dark }) => {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((part, i) =>
        URL_ONLY_RE.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline decoration-dotted ${dark ? "text-sky-200" : "text-sky-600"} break-all`}
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default LinkedText;
