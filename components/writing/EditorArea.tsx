'use client';

import { EditorContent, type Editor } from '@tiptap/react';
import styles from './writing.module.css';

interface EditorAreaProps {
  editor: Editor | null;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function EditorArea({ editor, onContextMenu }: EditorAreaProps) {
  return (
    <div className={styles.editorScroll}>
      <div className={styles.editorContainer} onContextMenu={onContextMenu}>
        {editor?.isEmpty && (
          <div className={styles.editorPlaceholder} aria-hidden="true">
            여기서 글을 시작해 보세요…
          </div>
        )}
        <EditorContent editor={editor} className={styles.editorContent} />
      </div>
    </div>
  );
}
