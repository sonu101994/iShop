import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./reducers/AdminReducers";
import userReducer from "./reducers/UserReducers";
import cartReducer from "./reducers/CartReducers";

const store = configureStore({
    reducer: {
        admin: adminReducer,
        user: userReducer,
        cart:cartReducer,

    },
});

export default store;