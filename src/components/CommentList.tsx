import { useState } from "react";
import { commentFromText } from "../data/repository";
import type { Comment } from "../types";

export function CommentList({ comments, onChange }: { comments: Comment[]; onChange: (comments: Comment[]) => void }) {
  const [draft, setDraft] = useState("");

  return (
    <div className="comments">
      {comments.map((comment) => (
        <div className="comment-row" key={comment.id}>
          <input
            value={comment.text}
            onChange={(event) => onChange(comments.map((item) => item.id === comment.id ? { ...item, text: event.target.value } : item))}
            aria-label="Comment"
          />
          <button className="small danger" onClick={() => onChange(comments.filter((item) => item.id !== comment.id))} type="button">Delete</button>
        </div>
      ))}
      <div className="comment-row">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add comment" aria-label="New comment" />
        <button className="small" type="button" onClick={() => {
          if (!draft.trim()) return;
          onChange([...comments, commentFromText(draft.trim())]);
          setDraft("");
        }}>Add</button>
      </div>
    </div>
  );
}
