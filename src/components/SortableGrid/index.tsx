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
import { Grid } from '@mui/material';
import React from 'react';

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
        <Grid container>
          {items.map((item) => {
            return (
              <SortableItem key={item.id} id={item.id}>
                <Grid item>{item.itemNode}</Grid>
              </SortableItem>
            );
          })}
        </Grid>
      </SortableContext>
    </DndContext>
  );
}
