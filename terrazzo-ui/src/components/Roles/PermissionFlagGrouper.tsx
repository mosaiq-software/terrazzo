import { Accordion, Stack, Text } from '@mantine/core';
import {
    PermissionFlag,
    PermissionFlagCategory,
    PermissionFlagCategoryData,
    PermissionFlagData,
    recordEntries,
    recordValues,
} from '@mosaiq/terrazzo-common';
import React, { useMemo } from 'react';

const allPermissions = recordValues(PermissionFlag);
const allCategories = recordValues(PermissionFlagCategory);

interface PermissionFlagGrouperProps {
    excludeCategories?: PermissionFlagCategory[];
    excludePermissions?: PermissionFlag[];
    defaultCollapsed?: boolean;
    permissionItem: (flag: PermissionFlag) => React.ReactNode;
}
export const PermissionFlagGrouper = (props: PermissionFlagGrouperProps) => {
    const allPermissionsByCategory = useMemo(
        () =>
            recordEntries(
                allCategories.reduce(
                    (acc, category) => {
                        if (props.excludeCategories?.includes(category)) {
                            return acc;
                        }
                        acc[category] = allPermissions.filter((permission) => {
                            if (props.excludePermissions?.includes(permission)) {
                                return false;
                            }
                            const permCategory =
                                PermissionFlagData[permission].category || PermissionFlagCategory.OTHER;
                            return permCategory === category;
                        });
                        return acc;
                    },
                    {} as Record<PermissionFlagCategory, PermissionFlag[]>
                )
            ).filter(([_, permissions]) => permissions.length > 0),
        [props.excludeCategories, props.excludePermissions]
    );

    const allFilteredCategories = allPermissionsByCategory.map(([category, _]) => category);

    return (
        <Accordion
            multiple={true}
            variant="default"
            defaultValue={props.defaultCollapsed ? [] : allFilteredCategories}
        >
            {allPermissionsByCategory.map((entry) => {
                const [category, permissions] = entry;
                const catData = PermissionFlagCategoryData[category];
                return (
                    <Accordion.Item
                        key={category}
                        value={category}
                    >
                        <Accordion.Control>
                            <Text
                                c="dimmed"
                                fz="sm"
                            >
                                {catData.title}
                            </Text>
                        </Accordion.Control>
                        <Accordion.Panel pl={'md'}>
                            <Stack>
                                {permissions.map((permission) => {
                                    return (
                                        <React.Fragment key={permission}>
                                            {props.permissionItem(permission)}
                                        </React.Fragment>
                                    );
                                })}
                            </Stack>
                        </Accordion.Panel>
                    </Accordion.Item>
                );
            })}
        </Accordion>
    );
};
