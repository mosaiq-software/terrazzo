import { exhaustiveCheck, LinkedAccount, LinkedAccountProvider } from '@mosaiq/terrazzo-common';
import { BsGithub } from 'react-icons/bs';
import { FaCode } from 'react-icons/fa';
import { ActionRow } from './ActionRow';
import { RectHoldingButton } from './RectHoldingButton';

interface LinkedAccountProps {
    account: LinkedAccount;
    onUnlink?: (account: LinkedAccount) => void;
    isOnlyAccount?: boolean;
}
export const LinkedAccountRenderer = (props: LinkedAccountProps) => {
    const UnlinkButton = (
        <RectHoldingButton
            key={`unlink-${props.account.provider.toLowerCase()}`}
            durationMs={2000}
            borderColor="red"
            variant="outline"
            onClick={() => props.onUnlink && props.onUnlink(props.account)}
            tooltip={props.isOnlyAccount ? 'You must have at least 1 account linked' : `You will no longer be able to sign in using this ${props.account.provider} account`}
            disabled={props.isOnlyAccount}
        >
            Unlink
        </RectHoldingButton>
    );

    switch (props.account.provider) {
        case LinkedAccountProvider.Github:
            return (
                <ActionRow
                    title="GitHub Account"
                    icon={BsGithub}
                    iconColor=""
                    subtitle={props.account.accountData.login}
                    items={[UnlinkButton]}
                />
            );
        case LinkedAccountProvider.DEV:
            return (
                <ActionRow
                    title="Terrazzo Developer Account"
                    icon={FaCode}
                    subtitle="Only used for Terrazzo development purposes"
                    items={[UnlinkButton]}
                />
            );
        default:
            return exhaustiveCheck(props.account, 'Unhandled linked account provider');
    }
};
