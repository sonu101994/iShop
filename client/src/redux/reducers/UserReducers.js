import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    data: null,
    loading: false,
    token: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,

    reducers: {
        loginUser(currentState, { payload }) {
            currentState.data = payload.data;
            currentState.token = payload.token;
            localStorage.setItem("user", JSON.stringify(payload.data));
            localStorage.setItem("user_token", payload.token);
        },

        logoutUser(currentState) {
            currentState.data = null;
            currentState.token = null;

            localStorage.removeItem("user");
            localStorage.removeItem("user_token");
        },

        lsToUser(currentState) {
            const lsUser = localStorage.getItem("user");
            const lsToken = localStorage.getItem("user_token");

            try {
                if (lsUser && lsUser !== "undefined") {
                    currentState.data = JSON.parse(lsUser);
                }
                if (
                    lsToken &&
                    lsToken !== "undefined"
                ) {
                    currentState.token = lsToken;
                }
            } catch (error) {
                currentState.data = null;
                currentState.token = null;

                localStorage.removeItem("user");
                localStorage.removeItem("user_token");
            }
        }
    }
});

export const {loginUser,logoutUser,lsToUser}=userSlice.actions;
export default userSlice.reducer;
