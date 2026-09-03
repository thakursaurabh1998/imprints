import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

import styles from './SortableGrid.module.css';

export function SortableItem(props: {
  id: UniqueIdentifier;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  return (
    <div
      ref={setNodeRef}
      className={[styles.item, isDragging && styles.dragging]
        .filter(Boolean)
        .join(' ')}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {props.children}
      {/* Dedicated drag handle. Spreading {...listeners} on the whole tile
          made dragging swallow every click, so selection, remove and
          set-cover were all unreachable. */}
      <div
        ref={setActivatorNodeRef}
        className={styles.handle}
        title="Drag to reorder"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⠿
      </div>
    </div>
  );
}
