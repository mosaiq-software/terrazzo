import { TrzModuleType } from '@mosaiq/terrazzo-common';
import { COLORS } from '@trz/util/colors';
import { ModuleIcon } from '@trz/util/moduleUtils';
import { FaChevronDown } from 'react-icons/fa';

interface DirectoryListItemIconProps {
    moduleType: TrzModuleType;
    collapsed?: boolean;
    subItemsCount?: number;
}
export const DirectoryListItemIcon = (props: DirectoryListItemIconProps) => {
    if (props.moduleType === TrzModuleType.Directory) {
        if (!props.subItemsCount) {
            return <></>;
        }
        return (
            <FaChevronDown
                color={COLORS.text.primary}
                style={{
                    transform: props.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms',
                }}
            />
        );
    }
    const Icon = ModuleIcon({ moduleType: props.moduleType });
    if (!Icon) {
        return <></>;
    }
    return <Icon color={COLORS.text.primary} />;
};
