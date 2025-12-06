import { Avatar, Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { fullName } from '@mosaiq/terrazzo-common';
import { useUser } from '@trz/contexts/user-context';
import { FaBell } from 'react-icons/fa';

const Navbar = () => {
    const usr = useUser();
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'black',
                color: 'white',
                height: '6vh',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1rem',
                    columnGap: '2rem',
                }}
            >
                <p
                    style={{
                        color: 'hsl(0, 2%, 60%',
                    }}
                >
                    Terrazzo
                </p>
                <button
                    className="WorkspaceButton"
                    style={{
                        backgroundColor: ' black',
                        color: ' hsl(0, 2%, 60%)',
                        border: ' none',
                    }}
                >
                    Workspace
                </button>
                <Button
                    style={{
                        backgroundColor: ' rgb(30, 111, 233)',
                        color: ' white',
                        border: ' none',
                        borderRadius: ' .5rem',
                        padding: ' .1rem 1.2rem',
                    }}
                    onClick={() =>
                        modals.openContextModal({
                            modal: 'organization',
                            title: 'Create New Organization',
                            innerProps: {},
                        })
                    }
                >
                    Create Org
                </Button>
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1rem',
                    columnGap: '2rem',
                }}
            >
                <input
                    className="searchbar"
                    type="text"
                    value="Search"
                    onChange={() => {}}
                    style={{
                        backgroundColor: ' hsl(0, 2%, 40%)',
                        border: ' 1px solid hsl(0, 2%, 60%)',
                        borderRadius: ' .5rem',
                        padding: ' .4rem',
                        color: 'hsl(0, 2%, 60%)',
                    }}
                />
                <FaBell />
                <Avatar
                    style={{
                        display: 'flex',
                        justifyContent: ' center',
                        backgroundColor: ' hsl(0, 2%, 40%)',
                        borderRadius: ' 50%',
                        border: ' none',
                        height: ' 35px',
                        width: ' 35px',
                        margin: ' 0',
                        padding: ' 0',
                        fontSize: ' 22px',
                        color: 'white',
                    }}
                    onClick={() => usr.logoutAll()}
                    src={usr.userData?.profilePicture}
                    name={fullName(usr.userData)}
                    color={'initials'}
                />
            </div>
        </div>
    );
};

export default Navbar;
