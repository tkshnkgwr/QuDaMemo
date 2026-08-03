import React from 'react';

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, highlight, className = '' }) => {
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const query = highlight.trim().toLowerCase();
  const parts: { text: string; isMatch: boolean }[] = [];

  let currentIndex = 0;
  const lowerText = text.toLowerCase();

  while (currentIndex < text.length) {
    const matchIndex = lowerText.indexOf(query, currentIndex);
    if (matchIndex === -1) {
      parts.push({ text: text.slice(currentIndex), isMatch: false });
      break;
    }

    if (matchIndex > currentIndex) {
      parts.push({ text: text.slice(currentIndex, matchIndex), isMatch: false });
    }

    parts.push({
      text: text.slice(matchIndex, matchIndex + query.length),
      isMatch: true,
    });

    currentIndex = matchIndex + query.length;
  }

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.isMatch ? (
          <mark
            key={index}
            className="bg-amber-300 dark:bg-amber-500/40 text-amber-950 dark:text-amber-200 font-semibold px-0.5 rounded"
          >
            {part.text}
          </mark>
        ) : (
          <React.Fragment key={index}>{part.text}</React.Fragment>
        )
      )}
    </span>
  );
};
