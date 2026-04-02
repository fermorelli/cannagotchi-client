import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsFillPencilFill } from 'react-icons/bs';
import { FiPlus } from 'react-icons/fi';
import { GoTrashcan } from 'react-icons/go';
import './userlist.css';
import '../workspace.css';
import Modal from '../modal/modal';
import { useAuth } from '../../context/authContext.jsx';
import { Footer } from '../footer/Footer';

export const UserList = () => {
    const [users, setUsers] = useState([]);
    const [showEdit, setShowEdit] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { user } = useAuth();
    const back = '/api/';

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${back}users`, {
                    headers: {
                        'Access-Control-Allow-Origin': 'https://localhost:3000',
                    },
                });
                const data = await response.json();
                setUsers(data.data || []);
            } catch (error) {
                console.log(error.message);
            }
        };

        const persistedEditMode = localStorage.getItem('users-edit-mode') === 'true';
        setShowEdit(persistedEditMode);
        localStorage.removeItem('users-edit-mode');
        fetchUsers();
    }, [user]);

    const handleChange = (userItem) => {
        setSelectedUser(userItem);
        setConfirm(false);
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setConfirm(false);
        setSelectedUser(null);
    };

    const deleteUser = async () => {
        if (!selectedUser?._id) {
            return;
        }

        try {
            const response = await fetch(`${back}users/${selectedUser._id}`, { method: 'DELETE' });

            if (!response.ok) {
                throw new Error('Something went wrong');
            }

            setUsers((currentUsers) => currentUsers.filter((userItem) => userItem._id !== selectedUser._id));
            setConfirm(true);
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <>
            {isOpen && (
                <Modal
                    setIsOpen={setIsOpen}
                    handleClose={handleClose}
                    modalTitle={!confirm ? 'Delete this user?' : 'User deleted'}
                >
                    <p>
                        {!confirm
                            ? `This will remove ${selectedUser?.firstName} ${selectedUser?.lastName} from the user list.`
                            : `${selectedUser?.firstName} ${selectedUser?.lastName} was removed successfully.`}
                    </p>
                    <div className="workspace-inlineActions userlist-modalActions">
                        {!confirm ? (
                            <>
                                <button type="button" className="workspace-button workspace-button--danger" onClick={deleteUser}>
                                    Delete user
                                </button>
                                <button type="button" className="workspace-button workspace-button--secondary" onClick={handleClose}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button type="button" className="workspace-button workspace-button--primary" onClick={handleClose}>
                                Close
                            </button>
                        )}
                    </div>
                </Modal>
            )}

            <div className="workspace-page">
                <div className="container workspace-stack">
                    <section className="workspace-hero">
                        <div className="workspace-hero__copy">
                            <span className="section-label workspace-kicker">User management</span>
                            <h1 className="workspace-title">Keep the user list as polished as the rest of the app.</h1>
                            <p className="workspace-subtitle">
                                Review profiles, jump into edits, and make admin changes without dropping into a rough utility screen.
                            </p>

                            <div className="workspace-actions">
                                <Link className="workspace-button workspace-button--primary" to="/add-user">
                                    <FiPlus />
                                    Add user
                                </Link>
                                <Link className="workspace-button workspace-button--secondary" to="/home">
                                    Back to dashboard
                                </Link>
                            </div>
                        </div>

                        <div className="workspace-panel userlist-toolbar">
                            <div className="workspace-panel__header">
                                <div>
                                    <span className="workspace-card__eyebrow">List controls</span>
                                    <h2 className="workspace-panel__title">Edit mode</h2>
                                </div>
                            </div>

                            <div className="workspace-segmented">
                                <button type="button" className={!showEdit ? 'is-active' : ''} onClick={() => setShowEdit(false)}>
                                    View only
                                </button>
                                <button type="button" className={showEdit ? 'is-active' : ''} onClick={() => setShowEdit(true)}>
                                    Edit users
                                </button>
                            </div>

                            <p className="workspace-note">
                                Turn edit mode on only when you want the action buttons visible on each user card.
                            </p>
                        </div>
                    </section>

                    {users.length === 0 ? (
                        <section className="workspace-empty">
                            <span className="section-label">No users yet</span>
                            <h2 className="workspace-empty__title">The list is ready for the first profile.</h2>
                            <p>Create a user entry and it will appear here with the new card layout.</p>
                            <div className="workspace-empty__actions">
                                <Link className="workspace-button workspace-button--primary" to="/add-user">
                                    Add first user
                                </Link>
                            </div>
                        </section>
                    ) : (
                        <section className="workspace-grid userlist-grid">
                            {users.map((userItem) => {
                                const initials = `${userItem.firstName?.[0] || ''}${userItem.lastName?.[0] || ''}`;
                                const isCurrentUser = userItem.email === user?.email;

                                return (
                                    <article key={userItem._id} className="workspace-card userlist-card">
                                        <div className="userlist-card__header">
                                            <div className="userlist-card__identity">
                                                <div className="workspace-avatar">{initials}</div>
                                                <div>
                                                    <strong>
                                                        {userItem.firstName} {userItem.lastName}
                                                    </strong>
                                                    <span>{userItem.email}</span>
                                                </div>
                                            </div>

                                            {isCurrentUser && <span className="workspace-pill">You</span>}
                                        </div>

                                        <div className="workspace-keyValueList">
                                            <div className="workspace-keyValue">
                                                <span>First name</span>
                                                <strong>{userItem.firstName}</strong>
                                            </div>
                                            <div className="workspace-keyValue">
                                                <span>Last name</span>
                                                <strong>{userItem.lastName}</strong>
                                            </div>
                                        </div>

                                        {showEdit && (
                                            <div className="workspace-inlineActions userlist-card__actions">
                                                <Link className="workspace-button workspace-button--secondary" to={`/edit-user/${userItem._id}`}>
                                                    <BsFillPencilFill />
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="workspace-button workspace-button--danger"
                                                    onClick={() => handleChange(userItem)}
                                                >
                                                    <GoTrashcan />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </section>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};
