import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@finanzas/users';
const USER_ID_KEY = 'userToken';

const DEFAULT_CATEGORIES = [
  { nombre: 'Salario', tipo: 'ingreso' },
  { nombre: 'Freelance', tipo: 'ingreso' },
  { nombre: 'Otros ingresos', tipo: 'ingreso' },
  { nombre: 'Alimentación', tipo: 'gasto' },
  { nombre: 'Transporte', tipo: 'gasto' },
  { nombre: 'Entretenimiento', tipo: 'gasto' },
  { nombre: 'Salud', tipo: 'gasto' },
  { nombre: 'Otros gastos', tipo: 'gasto' },
];

const emptyData = () => ({
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  nextId: 1,
});

const getAlertLevel = (porcentaje) => {
  if (porcentaje >= 100) return 'excedido';
  if (porcentaje >= 80) return 'advertencia';
  return 'ok';
};

const nextId = (data) => {
  const id = data.nextId;
  data.nextId += 1;
  return id;
};

const userDataKey = (userId) => `@finanzas/data:${userId}`;

const getUsers = async () => {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveUsers = async (users) => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getUserData = async (userId) => {
  const raw = await AsyncStorage.getItem(userDataKey(userId));
  if (!raw) {
    const data = emptyData();
    DEFAULT_CATEGORIES.forEach((cat) => {
      data.categories.push({ id: nextId(data), ...cat });
    });
    await AsyncStorage.setItem(userDataKey(userId), JSON.stringify(data));
    return data;
  }
  return JSON.parse(raw);
};

const saveUserData = async (userId, data) => {
  await AsyncStorage.setItem(userDataKey(userId), JSON.stringify(data));
};

export const getCurrentUserId = async () => {
  const id = await AsyncStorage.getItem(USER_ID_KEY);
  return id ? parseInt(id, 10) : null;
};

export const logout = async () => {
  await AsyncStorage.removeItem(USER_ID_KEY);
};

// --- Auth ---

export const register = async ({ email, password }) => {
  const users = await getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('El email ya está registrado');
  }
  const user = { id: Date.now(), email, password };
  users.push(user);
  await saveUsers(users);
  await getUserData(user.id);
  return { message: 'Usuario creado', user: { id: user.id, email: user.email } };
};

export const login = async ({ email, password }) => {
  const users = await getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error('Usuario no encontrado');
  if (user.password !== password) throw new Error('Contraseña incorrecta');
  await AsyncStorage.setItem(USER_ID_KEY, String(user.id));
  return { token: String(user.id), user: { id: user.id, email: user.email } };
};

// --- Cuentas ---

export const getAccounts = async () => {
  const userId = await getCurrentUserId();
  const data = await getUserData(userId);
  return data.accounts;
};

export const createAccount = async ({ nombre, tipo }) => {
  const userId = await getCurrentUserId();
  const data = await getUserData(userId);
  const account = {
    id: nextId(data),
    nombre,
    tipo,
    saldo: 0,
    usuario_id: userId,
  };
  data.accounts.push(account);
  await saveUserData(userId, data);
  return account;
};

// --- Categorías ---

export const getCategories = async (tipo) => {
  const userId = await getCurrentUserId();
  const data = await getUserData(userId);
  if (tipo) return data.categories.filter((c) => c.tipo === tipo);
  return data.categories;
};

// --- Transacciones ---

const findAccount = (data, cuentaId) => data.accounts.find((a) => a.id === cuentaId);

const adjustBalance = (account, tipo, monto, reverse = false) => {
  const sign = tipo === 'ingreso' ? 1 : -1;
  const delta = reverse ? -sign * monto : sign * monto;
  account.saldo = parseFloat((parseFloat(account.saldo) + delta).toFixed(2));
};

const enrichTransaction = (data, tx) => {
  const cuenta = data.accounts.find((a) => a.id === tx.cuenta_id);
  const categoria = data.categories.find((c) => c.id === tx.categoria_id);
  return {
    ...tx,
    cuenta_nombre: cuenta?.nombre,
    categoria_nombre: categoria?.nombre,
  };
};

export const getTransactions = async () => {
  const userId = await getCurrentUserId();
  const data = await getUserData(userId);
  return data.transactions
    .map((t) => enrichTransaction(data, t))
    .sort((a, b) => (b.fecha > a.fecha ? 1 : -1));
};

export const getTransactionById = async (id) => {
  const userId = await getCurrentUserId();
  const data = await getUserData(userId);
  const tx = data.transactions.find((t) => t.id === id);
  if (!tx) throw new Error('Transacción no encontrada');
  return enrichTransaction(data, tx);
};

export const createTransaction = async (payload) => {
  const userId = await getCurrentUserId();
  const data = await getUserData(userId);
  const { monto, tipo, descripcion, fecha, cuenta_id, categoria_id } = payload;

  const account = findAccount(data, cuenta_id);
  const category = data.categories.find((c) => c.id === categoria_id);
  if (!account) throw new Error('Cuenta no encontrada');
  if (!category) throw new Error('Categoría no encontrada');
  if (category.tipo !== tipo) throw new Error('El tipo debe coincidir con la categoría');

  const tx = {
    id: nextId(data),
    monto: parseFloat(monto),
    tipo,
    descripcion: descripcion || null,
    fecha: fecha || new Date().toISOString().slice(0, 10),
    cuenta_id,
    categoria_id,
    usuario_id: userId,
  };
  data.transactions.push(tx);
  adjustBalance(account, tipo, tx.monto);
  await saveUserData(userId, data);
  return enrichTransaction(data, tx);
};

export const updateTransaction = async (id, payload) => {
  const userId = await getCurrentUserId();
  const data = await getUserData(userId);
  const index = data.transactions.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Transacción no encontrada');

  const oldTx = data.transactions[index];
  const oldAccount = findAccount(data, oldTx.cuenta_id);
  adjustBalance(oldAccount, oldTx.tipo, oldTx.monto, true);

  const newTx = {
    ...oldTx,
    monto: payload.monto ?? oldTx.monto,
    tipo: payload.tipo ?? oldTx.tipo,
    descripcion: payload.descripcion !== undefined ? payload.descripcion : oldTx.descripcion,
    fecha: payload.fecha ?? oldTx.fecha,
    cuenta_id: payload.cuenta_id ?? oldTx.cuenta_id,
    categoria_id: payload.categoria_id ?? oldTx.categoria_id,
  };

  const account = findAccount(data, newTx.cuenta_id);
  const category = data.categories.find((c) => c.id === newTx.categoria_id);
  if (!account) throw new Error('Cuenta no encontrada');
  if (!category) throw new Error('Categoría no encontrada');
  if (category.tipo !== newTx.tipo) throw new Error('El tipo debe coincidir con la categoría');

  data.transactions[index] = newTx;
  adjustBalance(account, newTx.tipo, newTx.monto);
  await saveUserData(userId, data);
  return enrichTransaction(data, newTx);
};

export const deleteTransaction = async (id) => {
  const userId = await getCurrentUserId();
  const data = await getUserData(userId);
  const index = data.transactions.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Transacción no encontrada');

  const tx = data.transactions[index];
  const account = findAccount(data, tx.cuenta_id);
  adjustBalance(account, tx.tipo, tx.monto, true);
  data.transactions.splice(index, 1);
  await saveUserData(userId, data);
  return { message: 'Transacción eliminada' };
};

// --- Presupuestos ---

const getSpent = (data, categoriaId, mes, anio) => {
  return data.transactions
    .filter(
      (t) =>
        t.categoria_id === categoriaId &&
        t.tipo === 'gasto' &&
        new Date(t.fecha).getMonth() + 1 === mes &&
        new Date(t.fecha).getFullYear() === anio
    )
    .reduce((sum, t) => sum + parseFloat(t.monto), 0);
};

const enrichBudget = (data, budget, mes, anio) => {
  const categoria = data.categories.find((c) => c.id === budget.categoria_id);
  const gastado = getSpent(data, budget.categoria_id, mes, anio);
  const limite = parseFloat(budget.limite);
  const porcentaje = limite > 0 ? Math.round((gastado / limite) * 100) : 0;
  return {
    ...budget,
    categoria_nombre: categoria?.nombre,
    limite,
    gastado,
    porcentaje,
    nivel_alerta: getAlertLevel(porcentaje),
  };
};

export const getBudgets = async (mes, anio) => {
  const userId = await getCurrentUserId();
  const data = await getUserData(userId);
  return data.budgets
    .filter((b) => b.mes === mes && b.anio === anio)
    .map((b) => enrichBudget(data, b, mes, anio))
    .sort((a, b) => a.categoria_nombre.localeCompare(b.categoria_nombre));
};

export const createBudget = async ({ categoria_id, mes, anio, limite }) => {
  const userId = await getCurrentUserId();
  const data = await getUserData(userId);
  const category = data.categories.find((c) => c.id === categoria_id);
  if (!category) throw new Error('Categoría no encontrada');
  if (category.tipo !== 'gasto') throw new Error('Solo categorías de gasto');

  const exists = data.budgets.some(
    (b) => b.categoria_id === categoria_id && b.mes === mes && b.anio === anio
  );
  if (exists) throw new Error('Ya existe un presupuesto para esta categoría en el periodo');

  const budget = {
    id: nextId(data),
    categoria_id,
    mes,
    anio,
    limite: parseFloat(limite),
    usuario_id: userId,
  };
  data.budgets.push(budget);
  await saveUserData(userId, data);
  return enrichBudget(data, budget, mes, anio);
};

export const updateBudget = async (id, { limite }) => {
  const userId = await getCurrentUserId();
  const data = await getUserData(userId);
  const budget = data.budgets.find((b) => b.id === id);
  if (!budget) throw new Error('Presupuesto no encontrado');
  budget.limite = parseFloat(limite);
  await saveUserData(userId, data);
  return enrichBudget(data, budget, budget.mes, budget.anio);
};

export const deleteBudget = async (id) => {
  const userId = await getCurrentUserId();
  const data = await getUserData(userId);
  const index = data.budgets.findIndex((b) => b.id === id);
  if (index === -1) throw new Error('Presupuesto no encontrado');
  data.budgets.splice(index, 1);
  await saveUserData(userId, data);
  return { message: 'Presupuesto eliminado' };
};
