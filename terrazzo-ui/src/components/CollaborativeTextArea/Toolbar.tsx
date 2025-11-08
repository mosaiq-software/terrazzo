import React from 'react';
import { Divider, Group } from '@mantine/core';
import { BasicFormattingButtonGroup, CalloutTypeButtonGroup, DataTransferButtonGroup, HeadingLevelButtonGroup, HistoryButtonGroup, ListButtonGroup } from './button-groups';
import { CreateTableButton } from './buttons';

export const CollabTextAreaToolbar = () => {
    return (
        <Group gap={6}>
            <HeadingLevelButtonGroup showAll />
            <BasicFormattingButtonGroup />
            <ListButtonGroup>
                <CreateTableButton />
            </ListButtonGroup>
            <CalloutTypeButtonGroup />
        </Group>
    );
};

const VerticalDivider = () => (
    <Divider
        orientation="vertical"
        mx="sm"
    />
);
