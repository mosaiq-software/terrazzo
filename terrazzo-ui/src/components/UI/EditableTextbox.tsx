import { Group, Input, InputProps, Text, TextProps, Title, TitleProps } from '@mantine/core';
import { captureDraggableEvents, captureEvent, forAllClickEvents, noEventBubble } from '@trz/util/eventUtils';
import React, { CSSProperties } from 'react';
import { MdEdit } from 'react-icons/md';

interface EditableTextboxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'title';
    titleProps?: TitleProps;
    textProps?: TextProps;
    inputProps?: InputProps;
    style?: CSSProperties;
    showEditIcon?: boolean;
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

    let TextElement: React.ReactElement;
    if (type === 'title') {
        TextElement = <Title {...titleProps}>{value || placeholder}</Title>;
    } else {
        TextElement = <Text {...textProps}>{value || placeholder}</Text>;
    }

    return (
        <div
            onClick={onEdit}
            style={style}
        >
            {editingValue !== null && (
                <Input
                    value={editingValue}
                    {...captureDraggableEvents(captureEvent, {
                        ...forAllClickEvents(noEventBubble),
                        onChange: (event: React.ChangeEvent<HTMLInputElement>) => setEditingValue(event.currentTarget.value),
                        onBlur: onSaveChanges,
                        onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
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
                {editingValue === null && type === 'title' && (
                    <Group
                        gap={4}
                        align="center"
                        style={{
                            cursor: 'pointer',
                        }}
                    >
                        {props.showEditIcon && (
                            <MdEdit
                                color="subtle"
                                style={{ marginTop: '2px' }}
                            />
                        )}
                        {TextElement}
                    </Group>
                )}
            </div>
        </div>
    );
};
export default EditableTextbox;
