import { takeLatest, put } from "redux-saga/effects";
import { AUTH_STATE, LOGIN_STATE, LOGIN_ACTION } from "../constants/redux";
import { firebaseSDK } from "../libs/firebase";
import { setAuthState } from "../stores/appSlice";
import { setLoginState } from "../stores/loginSlice";
import { saveUserToDatabase, removeUserFromDatabase } from "../libs/database/user";

const login = function* login(action) {
  const { email, password } = action;

  yield put(setLoginState(LOGIN_STATE.REQUEST));

  try {
    const user = yield firebaseSDK.signInEmailPassword(email, password);

    if (user) {
      const userInfo = yield firebaseSDK.getUser(user.user.uid);
  
      yield firebaseSDK.setFcmToken(user.user.uid);
      yield saveUserToDatabase(userInfo);
      yield put(setLoginState(LOGIN_STATE.SUCCESS));
      yield put(setAuthState(AUTH_STATE.AUTHED));
    } else {
      yield put(setLoginState(LOGIN_STATE.FAILED));
    }
  } catch (err) {
    yield put(setLoginState(LOGIN_STATE.FAILED));
    alert('Please input the correct credentials.');
  }
};

const signUp = function* signUp({ user, callback }) {
  if (user) {
    try {
      const userInfo = yield firebaseSDK.createUser(user);
      // yield put(setAuthState(AUTH_STATE.AUTHED));
      yield callback();
    } catch (error) {
      yield firebaseSDK.signOut();
      yield put(setAuthState(AUTH_STATE.NOAUTH));
    }
  } else {
    yield put(setAuthState(AUTH_STATE.NOAUTH));
  }
};

const logout = function* logout() {
  yield firebaseSDK.signOut();
  yield removeUserFromDatabase();
  yield put(setAuthState(AUTH_STATE.NOAUTH));
};

const root = function* root() {
  yield takeLatest(LOGIN_ACTION.LOGIN, login);
  yield takeLatest(LOGIN_ACTION.LOGOUT, logout);
  yield takeLatest(LOGIN_ACTION.SIGNUP, signUp);
};

export default root;
