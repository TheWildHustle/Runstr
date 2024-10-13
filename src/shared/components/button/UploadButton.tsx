import React, { useRef, useState } from 'react';

import { uploadFile } from '@/shared/upload';

type Props = {
  onUpload: (url: string) => void;
  onError?: (error: Error) => void;
  text?: string;
  className?: string;
  disabled?: boolean;
  accept?: string;
};

const UploadButton = ({ onUpload, onError, text, className, disabled = false, accept }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    try {
      setUploading(true);
      const file = e.target.files[0];
      const url = await uploadFile(file);
      onUpload(url);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <button className={className || 'btn'} onClick={handleClick} disabled={disabled || uploading}>
        {text || 'Upload'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default UploadButton;
