const signupError = (code, message, accountCreated = false) => Object.assign(new Error(message), { code, accountCreated });

// Only profile fields go to the app API. Passwords belong to Firebase Authentication.
async function createProfile(values, fetchProfile, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchProfile('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({ firstName: values.firstName, lastName: values.lastName, email: values.email }),
        });
        let data;
        try { data = await response.json(); }
        catch { /* An unreadable response cannot confirm whether the profile was saved. */ }
        if (response.ok && data?.error === false) return;
        if (data?.error === true || (response.status >= 400 && response.status < 500 && response.status !== 408)) {
            throw signupError('signup/profile-rejected', 'Your profile could not be created. Please try again.');
        }
        throw signupError('signup/profile-unconfirmed', 'Your sign-in account was created, but profile setup could not be confirmed. Log in to check before registering again.', true);
    } catch (error) {
        if (error.code?.startsWith('signup/')) throw error;
        throw signupError('signup/profile-unconfirmed', 'Your sign-in account was created, but profile setup could not be confirmed. Log in to check before registering again.', true);
    } finally {
        clearTimeout(timeout);
    }
}

export async function createAccount(values, { registerAccount, removeAccount, currentUser, fetchProfile = fetch, timeoutMs = 15000 }) {
    const credential = await registerAccount(values.email, values.password);
    const createdUser = credential?.user;
    const ownsSession = () => Boolean(createdUser?.uid) && currentUser()?.uid === createdUser.uid;
    if (!ownsSession()) {
        throw signupError('signup/session-changed', 'Your sign-in session changed. Check the current account before continuing.', true);
    }
    try {
        await createProfile(values, fetchProfile, timeoutMs);
    } catch (error) {
        // A timeout or lost response may follow a successful server write: keep the
        // sign-in account rather than stranding an existing profile by deleting it.
        if (error.code !== 'signup/profile-rejected') throw error;
        if (!ownsSession()) {
            throw signupError('signup/session-changed', 'Your sign-in session changed. Check the current account before continuing.', true);
        }
        try {
            await removeAccount(createdUser);
        } catch {
            throw signupError('signup/rollback-failed', 'Your sign-in account was created, but profile setup failed. Log in to check the account before registering again.', true);
        }
        throw error;
    }
    if (!ownsSession()) {
        throw signupError('signup/session-changed', 'Your sign-in session changed. Check the current account before continuing.', true);
    }
    return createdUser;
}
