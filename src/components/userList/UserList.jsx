import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsFillPencilFill } from 'react-icons/bs';
import { FiPlus } from 'react-icons/fi';
import { GoTrashcan } from 'react-icons/go';
import './userlist.css';
import '../workspace.css';
import '../garden/dataStatus.css';
import Modal from '../modal/modal';
import { useAuth } from '../../context/authContext.jsx';
import { Footer } from '../footer/Footer';

export const UserList = () => {
    const [users, setUsers] = useState([]);
    const [showEdit, setShowEdit] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [refreshVersion, setRefreshVersion] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const deletingRef = useRef(false);
    const loadRequestRef = useRef(0);

    const { user } = useAuth();
    const back = '/api/';

    useEffect(() => {
        try {
            const persistedEditMode = localStorage.getItem('users-edit-mode') === 'true';
            setShowEdit(persistedEditMode);
            localStorage.removeItem('users-edit-mode');
        } catch {
            // The list can still be used when browser preferences cannot be read.
        }
    }, [user]);

    useEffect(() => {
        const controller = new AbortController();
        const request = ++loadRequestRef.current;
        let active = true;
        const isCurrent = () => active && request === loadRequestRef.current;
        const timeout = setTimeout(() => controller.abort(), 15000);
        setLoadingUsers(true);
        setLoadError('');
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${back}users`, {
                    headers: {
                        'Access-Control-Allow-Origin': 'https://localhost:3000',
                    },
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error(`Could not load user profiles (${response.status}). Please try again.`);
                const data = await response.json();
                if (data?.error === true || !Array.isArray(data?.data)) throw new Error('The user service returned incomplete profile data. Please try again.');
                if (isCurrent()) setUsers(data.data);
            } catch (error) {
                if (isCurrent()) setLoadError(error.name === 'AbortError' ? 'The user service took too long to respond. Please try again.' : error instanceof TypeError ? 'Could not reach the user service. Check your connection and try again.' : error instanceof SyntaxError ? 'The user service returned an unexpected response. Please try again.' : error.message);
            } finally {
                clearTimeout(timeout);
                if (isCurrent()) setLoadingUsers(false);
            }
        };
        fetchUsers();
        return () => { active = false; clearTimeout(timeout); controller.abort(); };
    }, [user, refreshVersion]);

    const handleChange = (userItem) => {
        if (deletingRef.current) return;
        setSelectedUser(userItem);
        setConfirm(false);
        setDeleteError('');
        setIsOpen(true);
    };

    const handleClose = () => {
        if (deletingRef.current) return;
        setIsOpen(false);
        setConfirm(false);
        setSelectedUser(null);
        setDeleteError('');
    };

    const deleteUser = async () => {
        if (deletingRef.current || !selectedUser?._id) return;
        deletingRef.current = true;
        setDeleting(true);
        setDeleteError('');
        const id = selectedUser._id;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(`${back}users/${encodeURIComponent(id)}`, { method: 'DELETE', signal: controller.signal });

            if (!response.ok) {
                throw new Error(`Could not delete this user (${response.status}). Please try again.`);
            }
            const result = await response.json().catch(() => null);
            if (result?.error === true) throw new Error(typeof result.message === 'string' ? result.message : 'The user service could not delete this user. Please try again.');
            // A GET started before this successful deletion must not restore the removed profile.
            loadRequestRef.current += 1;
            setLoadingUsers(false);
            setLoadError('');
            setUsers((currentUsers) => currentUsers.filter((userItem) => userItem._id !== id));
            setConfirm(true);
        } catch (error) {
            setDeleteError(error.name === 'AbortError' ? 'Could not confirm deletion because the user service took too long. Reload the list before trying again.' : error instanceof TypeError ? 'Could not reach the user service. The deletion was not confirmed. Please try again.' : error.message);
        } finally {
            clearTimeout(timeout);
            deletingRef.current = false;
            setDeleting(false);
        }
    };

    return (
        <>
            {isOpen && (
                <Modal
                    setIsOpen={setIsOpen}
                    handleClose={handleClose}
                    modalTitle={!confirm ? 'Delete this user?' : 'User deleted'}
                    busy={deleting}
                >
                    <p>
                        {!confirm
                            ? `This will remove ${selectedUser?.firstName} ${selectedUser?.lastName} from the user list.`
                            : `${selectedUser?.firstName} ${selectedUser?.lastName} was removed successfully.`}
                    </p>
                    {deleteError && <div className="data-status data-status--error" role="alert"><span className="data-status__message">{deleteError}</span></div>}
                    {deleting && <p role="status">Deleting user… Waiting for the service to confirm.</p>}
                    <div className="workspace-inlineActions userlist-modalActions">
                        {!confirm ? (
                            <>
                                <button type="button" className="workspace-button workspace-button--danger" onClick={deleteUser} disabled={deleting}>
                                    {deleting ? 'Deleting…' : 'Delete user'}
                                </button>
                                <button type="button" className="workspace-button workspace-button--secondary" onClick={handleClose} disabled={deleting}>
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
                            <h1 className="workspace-title">User profiles.</h1>
                            <p className="workspace-subtitle">
                                Review profile details and manage user records.
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

                        <div className="userlist-toolbar">
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

                    {loadingUsers && <section className="workspace-panel" role="status"><h2 className="workspace-panel__title">Loading user profiles</h2><p className="workspace-note">Waiting for the user service to return the list.</p></section>}
                    {loadError && <div className="data-status data-status--error" role="alert"><span className="data-status__message">{loadError}</span><button type="button" onClick={() => setRefreshVersion((version) => version + 1)} disabled={loadingUsers}>{loadingUsers ? 'Retrying…' : 'Try again'}</button></div>}
                    {!loadingUsers && !loadError && users.length === 0 ? (
                        <section className="workspace-empty">
                            <span className="section-label">No users yet</span>
                            <h2 className="workspace-empty__title">The list is ready for the first profile.</h2>
                            <p>Create a user entry to add a profile to this list.</p>
                            <div className="workspace-empty__actions">
                                <Link className="workspace-button workspace-button--primary" to="/add-user">
                                    Add first user
                                </Link>
                            </div>
                        </section>
                    ) : users.length > 0 ? (
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
                    ) : null}
                </div>
            </div>
            <Footer />
        </>
    );
};
