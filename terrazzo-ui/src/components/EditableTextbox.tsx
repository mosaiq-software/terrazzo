import React, { CSSProperties } from 'react';
import { Text, Title, Input, TitleProps, TextProps, InputProps } from '@mantine/core';
import { captureAllEvents, captureDraggableEvents, captureEvent, forAllClickEvents } from '@trz/util/eventUtils';

interface EditableTextboxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'title';
    titleProps?: TitleProps;
    textProps?: TextProps;
    inputProps?: InputProps;
    style?: CSSProperties;
}
const EditableTextbox = (props: EditableTextboxProps) => {
    const { value, onChange, placeholder, type, titleProps, textProps, inputProps, style } = props;
    const [editingValue, setEditingValue] = React.useState<string | null>(null);

    const onSaveChanges = () => {
        if (editingValue !== null) {
            onChange(editingValue.trim());
            setEditingValue(null);
        }
    };

    const onDiscardChanges = () => {
        setEditingValue(null);
    };

    const onEdit = (e) => {
        // captureEvent(e);
        setEditingValue(value);
    };

    const noBubble = (e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    };

    return (
        <div
            onClick={onEdit}
            style={style}
        >
            {editingValue !== null && (
                <Input
                    value={editingValue}
                    {...captureDraggableEvents(captureEvent, {
                        ...forAllClickEvents(noBubble),
                        onChange: (event) => setEditingValue(event.currentTarget.value),
                        onBlur: onSaveChanges,
                        onKeyDown: (event) => {
                            if (event.key === 'Enter') {
                                onSaveChanges();
                            } else if (event.key === 'Escape') {
                                onDiscardChanges();
                            }
                        },
                    })}
                    autoFocus
                    {...inputProps}
                />
            )}
            <div style={style}>
                {editingValue === null && type === 'title' && <Title {...titleProps}>{value || placeholder}</Title>}
                {editingValue === null && type === 'text' && <Text {...textProps}>{value || placeholder}</Text>}
            </div>
        </div>
    );
};
export default EditableTextbox;
