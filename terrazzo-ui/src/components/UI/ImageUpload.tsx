import { Image } from '@mantine/core';
import { useFileDialog, useHover } from '@mantine/hooks';
import { useFileUploader } from '@trz/hooks/useFileUploader';
import { COLORS } from '@trz/util/colors';
import { NoteType, notify } from '@trz/util/notifications';
import { MdUpload } from 'react-icons/md';

interface ImageUploadProps {
    currentImageUrl: string | undefined;
    onUploadComplete: (url: string) => void;
    width?: number | string;
    height?: number | string;
    alt?: string;
    style?: React.CSSProperties;
}
export const ImageUpload = (props: ImageUploadProps) => {
    const { hovered, ref: hoverRef } = useHover();
    const fileUploader = useFileUploader();
    const fileDialog = useFileDialog({
        multiple: false,
        accept: 'image/*',
        onChange: async (files) => {
            if (files?.length) {
                const uploadResultUrl = await fileUploader.uploadFile(files[0]);
                if (uploadResultUrl) {
                    props.onUploadComplete(uploadResultUrl);
                } else {
                    notify(NoteType.GENERIC_ERROR, 'Image upload failed');
                }
            }
        },
    });

    return (
        <div
            ref={hoverRef}
            style={{
                position: 'relative',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: COLORS.overlay.dark,
                    color: COLORS.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.2s',
                    cursor: 'pointer',
                    zIndex: 100,
                }}
                onClick={async () => {
                    fileDialog.open();
                }}
            >
                <MdUpload size={40} />
            </div>
            <Image
                src={props.currentImageUrl}
                width={props.width}
                height={props.height}
                alt={props.alt}
                style={{
                    objectFit: 'cover',
                    position: 'relative',
                    ...props.style,
                }}
            />
        </div>
    );
};
