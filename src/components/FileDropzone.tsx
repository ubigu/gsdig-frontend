import { Typography } from '@material-ui/core';
import { CloudUpload } from '@material-ui/icons';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const style = {
  padding: '2rem',
  margin: '0 auto',
  userSelect: 'none',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#696969',
  cursor: 'pointer',
  textAlign: 'center',
  outline: 'none',
} as const;

interface Props {
  /**
   * Label of the dropzone
   */
  label: string;
  /**
   * Accepted file extensions with a leading dot
   * E.g. ['.csv', '.xlsx']
   */
  fileExtensions?: string[];
  /**
   * Callback for handling file imports.
   */
  handleImport: (file: File) => void;
  /**
   * Is the dropzone disabled?
   */
  disabled?: boolean;
}

/**
 * Dropzone for uploading/importing files.
 */
export default function FileDropzone({
  label,
  fileExtensions,
  handleImport,
  disabled,
}: Props) {
  const onDrop = useCallback(([file]) => {
    if (file) {
      handleImport(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: fileExtensions,
    multiple: false,
    disabled,
  });
  return (
    <section>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <CloudUpload />
        <Typography variant="body2">{label}</Typography>
      </div>
    </section>
  );
}
