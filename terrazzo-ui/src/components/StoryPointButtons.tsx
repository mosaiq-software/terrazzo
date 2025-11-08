import React from 'react';
import { Menu } from '@mantine/core';
import { StoryPoints } from '@mosaiq/terrazzo-common/constants';

interface StoryPointProps {
    buttonText: string;
    onClick: (sp: StoryPoints | null) => void;
}

const StoryPointButton = (props: StoryPointProps): React.JSX.Element => {
    async function onClick() {
        let storyPoint: StoryPoints | null = null;
        switch (props.buttonText) {
            case '0':
                storyPoint = StoryPoints.ZERO;
                break;
            case '1':
                storyPoint = StoryPoints.XXS;
                break;
            case '2':
                storyPoint = StoryPoints.XS;
                break;
            case '3':
                storyPoint = StoryPoints.S;
                break;
            case '5':
                storyPoint = StoryPoints.M;
                break;
            case '8':
                storyPoint = StoryPoints.L;
                break;
            case '13':
                storyPoint = StoryPoints.XL;
                break;
            case '21':
                storyPoint = StoryPoints.XXL;
                break;
            case 'Remove Story Point':
                storyPoint = null;
                break;
        }
        props.onClick(storyPoint);
    }

    return (
        <Menu.Item
            bg="gray"
            ta="center"
            c="white"
            onClick={onClick}
        >
            {props.buttonText}
        </Menu.Item>
    );
};

interface StoryPointButtonsProps {
    onChange: (sp: StoryPoints | null) => void;
}
export const StoryPointButtons = (props: StoryPointButtonsProps): React.JSX.Element => {
    const storyPointsArray = Object.values(StoryPoints).filter((value) => typeof value === 'number');

    return (
        <>
            {storyPointsArray.map((point, index) => (
                <StoryPointButton
                    buttonText={`${point}`}
                    key={index}
                    onClick={props.onChange}
                />
            ))}
            <StoryPointButton
                buttonText={'Remove Story Point'}
                onClick={props.onChange}
            />
        </>
    );
};
