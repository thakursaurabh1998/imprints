'use client';

import { Collection } from '@/utils/generate-collection-config';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Grid } from '@mui/material';
import Image from 'next/image';
import { SortableItem } from './SortableItem';

type SortableGridProps = {
  collection: Collection;
};

export default function SortableImageGrid({ collection }: SortableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = collection.pictures.indexOf(active.id as string);
      const newIndex = collection.pictures.indexOf(over?.id as string);
      console.log(arrayMove(collection.pictures, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={collection.pictures}>
        <Grid container>
          {collection.pictures.map((picture) => (
            <SortableItem key={picture} id={picture}>
              <Grid item>
                <Image
                  height={200}
                  width={200}
                  key={picture}
                  src={`/original/images/${collection.slug}/${picture}`}
                  alt="display"
                />
              </Grid>
            </SortableItem>
          ))}
        </Grid>
      </SortableContext>
    </DndContext>
  );
}
