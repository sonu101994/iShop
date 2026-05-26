import { createSlice } from "@reduxjs/toolkit";

const initialState={
    data:null,
    loading:false,
    token:null,
};

const adminSlice=createSlice({
    name:"admin",
    initialState,
    reducers:{
        loginAdmin(currentState,{payload}){
            currentState.data=payload.data;
            currentState.token=payload.token;
             localStorage.setItem("admin",JSON.stringify(payload.data));
             localStorage.setItem("admin_token",payload.token);
        },
        logoutAdmin(currentState){
            currentState.data=null;
            currentState.token=null;
            localStorage.removeItem("admin");
            localStorage.removeItem("admin_token");
        },

        lsToAdmin(currentState){
            const lsAdmin=localStorage.getItem("admin");
            const lsToken=localStorage.getItem("admin_token");

            try {
                if (lsAdmin&&lsAdmin!=="undefined") {
                    currentState.data=JSON.parse(lsAdmin);
                }
                if (lsToken&& lsToken!=="undefined") {
                    currentState.token=lsToken;
                }
            } catch (error) {
                currentState.data=null;
                currentState.token=null;

                localStorage.removeItem("admin");
                localStorage.removeItem("admin_token");
            }
        }
    },
});

export const {loginAdmin,logoutAdmin,lsToAdmin}=adminSlice.actions;
export default adminSlice.reducer;