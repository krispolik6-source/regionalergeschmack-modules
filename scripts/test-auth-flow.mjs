/**
 * Wirtualny test auth – rejestracja, logowanie, wylogowanie.
 * Run: node scripts/test-auth-flow.mjs
 */

const storage = new Map();
globalThis.localStorage = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear()
};

const { register, login, logout, getCurrentUser, changePassword, ACCOUNT_TYPES, ensureAdminSeed } = await import('../js/auth/auth.js');
const { getProducerAccount } = await import('../js/data/userProducerStore.js');
const { addReview, getReviewsForUser } = await import('../js/data/reviews.js');

const passes = [];
const failures = [];

function ok(msg) { passes.push(msg); console.log(`✅ ${msg}`); }
function fail(msg) { failures.push(msg); console.error(`❌ ${msg}`); }

storage.clear();

const seededOffHost = await ensureAdminSeed();
if (!seededOffHost && !storage.has('rg_auth_users')) ok('Admin seed wyłączony poza localhost');
else fail('Admin seed nie powinien działać poza localhost');

const clientReg = await register({
    email: 'klient@test.pl',
    password: 'haslo123',
    passwordConfirm: 'haslo123',
    accountType: ACCOUNT_TYPES.client,
    displayName: 'Jan Klient'
});
if (clientReg.ok && getCurrentUser()?.accountType === 'client' && getCurrentUser()?.displayName === 'Jan Klient') {
    ok('Rejestracja klienta z displayName');
} else fail('Rejestracja klienta');

logout();
if (!getCurrentUser()) ok('Wylogowanie klienta');
else fail('Wylogowanie klienta');

const clientLogin = await login({
    email: 'klient@test.pl',
    password: 'haslo123',
    expectedAccountType: ACCOUNT_TYPES.client
});
if (clientLogin.ok) ok('Logowanie klienta (właściwa ścieżka)');
else fail('Logowanie klienta');

logout();

const wrongType = await login({
    email: 'klient@test.pl',
    password: 'haslo123',
    expectedAccountType: ACCOUNT_TYPES.producer
});
if (!wrongType.ok && wrongType.error === 'wrongAccountType') ok('Odrzucenie logowania – zły typ konta');
else fail(`Odrzucenie złego typu: ${wrongType.error}`);

const noCategories = await register({
    email: 'prod@test.pl',
    password: 'haslo123',
    passwordConfirm: 'haslo123',
    accountType: ACCOUNT_TYPES.producer,
    producerCategories: []
});
if (!noCategories.ok && noCategories.error === 'categoriesRequired') ok('Rejestracja producenta bez kategorii – odrzucona');
else fail('Rejestracja producenta bez kategorii');

const usersAfterFail = JSON.parse(localStorage.getItem('rg_auth_users') || '[]');
if (!usersAfterFail.some((u) => u.email === 'prod@test.pl')) ok('Brak częściowego konta po błędzie kategorii');
else fail('Częściowe konto producenta po błędzie kategorii');

const producerReg = await register({
    email: 'prod@test.pl',
    password: 'haslo123',
    passwordConfirm: 'haslo123',
    accountType: ACCOUNT_TYPES.producer,
    producerCategories: ['farmer', 'bakery']
});
if (producerReg.ok && getCurrentUser()?.accountType === 'producer') ok('Rejestracja producenta z kategoriami');
else fail('Rejestracja producenta');

const account = getProducerAccount(producerReg.user.id);
if (account?.profile?.categories?.length === 2) ok('Kategorie producenta zapisane');
else fail('Kategorie producenta');

const shortPw = await register({
    email: 'short@test.pl',
    password: '12345',
    passwordConfirm: '12345',
    accountType: ACCOUNT_TYPES.client
});
if (!shortPw.ok && shortPw.error === 'passwordShort') ok('Walidacja hasła (min. 6)');
else fail('Walidacja hasła');

const badEmail = await register({
    email: 'niepoprawny',
    password: 'haslo123',
    passwordConfirm: 'haslo123',
    accountType: ACCOUNT_TYPES.client
});
if (!badEmail.ok && badEmail.error === 'invalidEmail') ok('Walidacja e-mail');
else fail('Walidacja e-mail');

logout();
await login({ email: 'klient@test.pl', password: 'haslo123' });
const pwChange = await changePassword({
    currentPassword: 'haslo123',
    newPassword: 'noweHaslo1',
    newPasswordConfirm: 'noweHaslo1'
});
if (pwChange.ok) ok('Zmiana hasła');
else fail(`Zmiana hasła: ${pwChange.error}`);

logout();
const oldPwLogin = await login({ email: 'klient@test.pl', password: 'haslo123' });
if (!oldPwLogin.ok) ok('Stare hasło odrzucone po zmianie');
else fail('Stare hasło nadal działa');

const newPwLogin = await login({ email: 'klient@test.pl', password: 'noweHaslo1' });
if (newPwLogin.ok) ok('Logowanie nowym hasłem');
else fail('Logowanie nowym hasłem');

const review = addReview('p1', {
    user: 'Jan Klient',
    rating: 5,
    comment: 'Super lokal!',
    userId: getCurrentUser().id
});
const myReviews = getReviewsForUser(getCurrentUser());
if (review && myReviews.length === 1) ok('Opinie powiązane z userId');
else fail('Opinie powiązane z userId');

console.log(`\n--- Auth test ---\nOK: ${passes.length} | Błędy: ${failures.length}`);
if (failures.length) process.exit(1);
