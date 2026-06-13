import { Fragment } from 'react';
import { parseRichText } from '../../utils/utils';

// Renders quiz text (question/option/explanation) with the app's lightweight
// markup: a newline starts a new line, **text** is emphasized in purple, and
// __text__ becomes underlined. Parsing happens in parseRichText (pure +
// unit-tested); this only maps the resulting segments to nodes, so quiz
// content can't inject HTML.
//
// **text** uses purple (text-purple-800 / dark:text-purple-400) rather than a
// heavier weight: the question heading is already bold, so extra weight didn't
// read as different — a distinct color stands out in both light and dark mode.
//
// A \n line break gets a little extra top margin (mt-2) so it reads as a
// deliberate break, distinct from a row that merely wrapped. The first line
// stays inline (a Fragment, not a block) so any inline prefix before it — the
// "A." option label, the "1." review number — keeps sitting on the same row;
// only subsequent lines are block-level with the gap.
const RichText = ({ children, className }) => {
  const lines = parseRichText(children);
  const renderSegments = (segments) =>
    segments.map((seg, j) => {
      if (seg.bold) return <strong key={j} className="text-purple-800 dark:text-purple-400">{seg.text}</strong>;
      if (seg.underline) return <u key={j}>{seg.text}</u>;
      return <Fragment key={j}>{seg.text}</Fragment>;
    });

  return (
    <span className={className}>
      {lines.map((segments, i) =>
        i === 0 ? (
          <Fragment key={i}>{renderSegments(segments)}</Fragment>
        ) : (
          <span key={i} className="block mt-2">
            {renderSegments(segments)}
          </span>
        ),
      )}
    </span>
  );
};

export default RichText;
