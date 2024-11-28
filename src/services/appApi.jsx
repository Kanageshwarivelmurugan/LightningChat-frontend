import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


const appApi = createApi({
    reducerPath: "appApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://lightningchat-backend.onrender.com",
    }),

    endpoints: (builder) => ({
        signupUser: builder.mutation({
            query: (user) => ({
                url: "api/users",
                method: "POST",
                body: user,
            }),
        }),

        loginUser: builder.mutation({
            query: (user) => ({
                url: "api/users/login",
                method: "POST",
                body: user,
            }),
        }),


        logoutUser: builder.mutation({
            query: (payload) => ({
                url: "/logout",
                method: "DELETE",
                body: payload,
            }),
        }),
    }),
});

export const { useSignupUserMutation, useLoginUserMutation, useLogoutUserMutation } = appApi;

export default appApi;
