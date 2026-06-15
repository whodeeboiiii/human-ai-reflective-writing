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
        <EditorContent editor={editor} className={styles.editorContent} />
      </div>
    </div>
  );
}
