import { ImageIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '~/lib/utils';

export type DragAndDropProps = ComponentProps<'input'> & {
  dragAndDropLabel?: string;
  fileTypesLabel?: string;
  /** Fires with the chosen file as soon as the user choses a file. */
  onFileChosen?: (file: File) => void;
  /** Fires with the files cleaned name as soon as a user choses a file. */
  onFilenameChosen?: (filename: string) => void;
  uploadLabel?: string;
};

export const DragAndDrop = forwardRef<HTMLInputElement, DragAndDropProps>(
  function DragAndDrop(
    {
      className,
      dragAndDropLabel,
      fileTypesLabel,
      id,
      name,
      onFileChosen,
      onFilenameChosen,
      uploadLabel,
      ...props
    },
    forwardedReference,
  ) {
    const { t } = useTranslation('drag-and-drop');

    // Show the file name in the user interface.
    const [filename, setFilename] = useState<string | undefined>();
    const fileInputReference = useRef<HTMLInputElement>(null);

    // Update the forwarded ref when the new ref changes.
    useEffect(() => {
      if (forwardedReference) {
        if (typeof forwardedReference === 'function') {
          forwardedReference(fileInputReference.current);
        } else {
          forwardedReference.current = fileInputReference.current;
        }
      }
    }, [forwardedReference]);

    // Drag and drop handling.
    const [dragIsActive, setDragIsActive] = useState(false);

    return (
      <div
        className={cn(
          'border-input dark:bg-input/30 flex justify-center rounded-md border px-3 py-4',
          className,
          dragIsActive && 'relative',
        )}
        onDragEnter={event => {
          // 1. Show the overlay.
          event.preventDefault();
          event.stopPropagation();
          setDragIsActive(true);
        }}
        onDrop={event => {
          // 4. Prevent file from opening in the browser when dropped and
          // close the overlay.
          event.preventDefault();
          event.stopPropagation();
          setDragIsActive(false);

          // 5. Set the file as the input value and show its name in the
          // user interface.
          if (fileInputReference.current) {
            fileInputReference.current.files = event.dataTransfer.files;
            onFileChosen?.(event.dataTransfer.files[0]);
            const newFilename = event.dataTransfer.files[0].name;
            setFilename(newFilename);
            onFilenameChosen?.(newFilename);
          }
        }}
      >
        <div className="flex flex-col items-center text-center">
          <ImageIcon
            aria-hidden="true"
            className={cn(
              'mx-auto size-10',
              filename ? 'text-primary' : 'text-muted-foreground',
            )}
          />

          {filename && (
            <div className="text-foreground text-sm">{filename}</div>
          )}

          <div className="text-muted-foreground mt-3 flex text-sm leading-6">
            <label
              className="text-primary hover:text-primary/90 focus-visible:ring-ring dark:text-foreground dark:hover:text-primary relative cursor-pointer rounded-md bg-transparent font-semibold focus-visible:ring-1 focus-visible:outline-none"
              htmlFor={id ?? 'fileUpload'}
            >
              <span>{uploadLabel ?? t('upload-label')}</span>

              <input
                className="sr-only"
                id={id ?? 'fileUpload'}
                name={name ?? 'fileUpload'}
                onChange={event => {
                  const file = event.target.files?.[0];

                  if (file) {
                    onFileChosen?.(file);
                    const fileName = file.name;
                    const cleanedFileName = fileName.replace(
                      'C:\\fakepath\\',
                      '',
                    );
                    setFilename(cleanedFileName);
                    onFilenameChosen?.(cleanedFileName);
                  }
                }}
                ref={fileInputReference}
                {...props}
                type="file"
              />
            </label>

            <p className="pl-1">
              {dragAndDropLabel ?? t('drag-and-drop-label')}
            </p>
          </div>

          <p className="text-muted-foreground text-xs leading-5">
            {fileTypesLabel ?? t('file-types-label')}
          </p>
        </div>

        {dragIsActive && (
          <div
            className="bg-primary absolute top-0 h-full w-full rounded-md opacity-30"
            onDragOver={event => {
              // 2. Prevent file from opening in the browser when dropped.
              event.preventDefault();
              event.stopPropagation();
            }}
            onDragLeave={event => {
              // 3. Remove overlay when dragging outside the border.
              event.preventDefault();
              event.stopPropagation();
              setDragIsActive(false);
            }}
          />
        )}
      </div>
    );
  },
);
