import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

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
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={{ ...style, position: 'relative' }}>
      {props.children}
      {/* Dedicated drag handle: the old code spread {...listeners} on the
          whole tile, so nothing inside it (remove, select, set-cover) was
          ever clickable — dragging swallowed every click. */}
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          width: 22,
          height: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4,
          background: 'rgba(0, 0, 0, 0.55)',
          color: '#fff',
          fontSize: 14,
          lineHeight: 1,
          cursor: 'grab',
          zIndex: 2,
          userSelect: 'none',
        }}
      >
        ⠿
      </div>
    </div>
  );
}
