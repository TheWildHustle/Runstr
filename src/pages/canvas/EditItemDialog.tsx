import { FormEvent, useEffect, useRef, useState } from 'react';

import { Item } from '@/pages/canvas/types.ts';

export function EditItemDialog({
  name,
  item,
  onClose,
  onSave,
}: {
  name: string;
  item: Item | undefined;
  onClose: () => void;
  onSave: (key: string, item: Item | null) => void;
}) {
  const [newData, setNewData] = useState(item?.data || '');
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // also close when clicking outside the dialog
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timeoutId = setTimeout(() => {
      window.addEventListener('click', handleClick);
    }, 0);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
      clearTimeout(timeoutId);
    };
  }, []);

  if (!item) return null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(name, { ...item, data: newData });
    onClose();
  };

  const onDelete = () => {
    onSave(name, null);
    onClose();
  };

  return (
    <form className="flex flex-row gap-2" onSubmit={onSubmit} ref={ref}>
      <input
        type="text"
        className="input input-primary"
        value={newData}
        onChange={(e) => setNewData(e.target.value)}
      />
      <button className="btn btn-primary bg-primary" type="submit">
        Save
      </button>
      <button className="btn btn-error btn-outline" type="button" onClick={onDelete}>
        Delete
      </button>
      <button className="btn btn-outline" type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
}
