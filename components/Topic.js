import Link from "next/link";
import Rich from "./Rich";
import { FileIcon, NoteBulbIcon } from "./Icons";

function TopicTable({ table }) {
  if (!table || !table.headers) return null;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {table.headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>
                  <Rich text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Topic({ topic, number, showFileLink = false }) {
  const {
    id,
    slug,
    fileName,
    level,
    title,
    summary,
    rules,
    table,
    sections,
    examples,
    note,
  } = topic;

  return (
    <article id={id || slug} className="note-card">
      {/* Note Card Meta Top Row */}
      <div className="note-card-meta">
        <div className="note-card-meta-left">
          {number && <span className="section-num">§ {number}</span>}
          <span className={`badge badge-${level.toLowerCase()}`}>{level}</span>
        </div>

        {fileName && (
          <Link
            href={`/${level}/${slug}`}
            className="file-pill"
            title={`Open ${level}/${fileName}`}
          >
            <FileIcon className="file-pill-icon" />
            <span>{fileName}</span>
          </Link>
        )}
      </div>

      {/* Topic Title */}
      <h3 className="note-card-title">
        {showFileLink ? (
          <Link href={`/${level}/${slug}`} className="topic-title-link">
            {title}
          </Link>
        ) : (
          <span>{title}</span>
        )}
      </h3>

      {/* Summary Lead */}
      {summary && (
        <p className="topic-summary">
          <Rich text={summary} />
        </p>
      )}

      {/* Grammar Table */}
      <TopicTable table={table} />

      {/* Rules List */}
      {rules && rules.length > 0 && (
        <div className="rules-block">
          <div className="block-label">Key Rules & Patterns</div>
          <ul className="rules-list">
            {rules.map((rule, i) => (
              <li key={i}>
                <Rich text={rule} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Optional Extra Subsections */}
      {sections &&
        sections.map((sec, idx) => (
          <div key={idx} className="topic-sub">
            {sec.heading && <h4>{sec.heading}</h4>}
            {sec.text && (
              <p>
                <Rich text={sec.text} />
              </p>
            )}
            <TopicTable table={sec.table} />
            {sec.rules && sec.rules.length > 0 && (
              <ul className="rules-list">
                {sec.rules.map((r, ri) => (
                  <li key={ri}>
                    <Rich text={r} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

      {/* Bilingual Examples */}
      {examples && examples.length > 0 && (
        <div className="examples-block">
          <div className="block-label">Beispiele · Examples</div>
          <ul className="examples">
            {examples.map((ex, i) => (
              <li key={i}>
                <span className="de">
                  <Rich text={ex.de} />
                </span>
                {ex.en && <span className="en">{ex.en}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Memory Callout / Note */}
      {note && (
        <div className="note-callout">
          <div className="note-callout-icon">
            <NoteBulbIcon />
          </div>
          <div className="note-callout-body">
            <span className="note-callout-label">Merke · Note</span>
            <p>
              <Rich text={note} />
            </p>
          </div>
        </div>
      )}
    </article>
  );
}
