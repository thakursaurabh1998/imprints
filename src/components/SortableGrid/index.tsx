/* eslint-disable no-unused-vars */

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import React from 'react';

import styles from './SortableGrid.module.css';
import { SortableItem } from './SortableItem';

type SortableItemType = { id: UniqueIdentifier; itemNode: React.ReactNode };

type SortableGridProps = {
  items: SortableItemType[];
  onChange: (updatedPictures: SortableItemType[]) => void;
};

export default function SortableGrid({ items, onChange }: SortableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((x) => x.id === active.id);
      const newIndex = items.findIndex((x) => x.id === over?.id);

      onChange?.(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items}>
        <div className={styles.grid}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {item.itemNode}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
