import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { BASE_URL } from "@/appConstants/baseURL";
import { stat } from "fs";

// Types
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  phoneNumber: string;
  login: boolean;
  isInstaAuthenticated: boolean;
  isInstagramFollowersSatisfied: boolean;
  isInstagramPermissionsSatisfied: boolean;
  isInstagramReverificationRequired: boolean;
  isModalOpen: boolean;
  username?: string;
}

interface User {
  // id: string;
  active?: number;
  balance?: number;
  birthday?: string;
  mobile: string;
  name: string;
  email?: string;
  password?: string;
  gender?: string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  isnew?: boolean;
  marital_status?: string;
  pending?: boolean;
  profile?: string;
  redeem?: number;
  ref_code?: string;
  referredBy?: null;
  state?: string;
  uid?: string;
}

interface LoginCredentials {
  email?: string;
  mobile?: string;
  password: string;
}

interface OtpRequest {
  phoneNumber: string;
  isLogin?: boolean; // true for login, false for signup
}

interface VerifyOtpPayload {
  phoneNumber: string;
  otp: string;
  isLogin?: boolean;
  new_password?: string;
  // mobile?: string;
  // For signup, you might need additional user data
  // userData?: {
  //   name?: string;
  //   email?: string;
  // };
}

const API_BASE_URL = BASE_URL;

// Async thunks for API calls
export const login = createAsyncThunk(
  "/user/auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/auth/login`,
        credentials,
        {
          withCredentials: true,
        }
      );

      // Store token in localStorage for persistence
      // localStorage.setItem('token', response.data.token);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || "Login failed");
      }
      return rejectWithValue("Network error occurred");
    }
  }
);

export const requestOtp = createAsyncThunk(
  "/user/auth/requestOtp",
  async (data: OtpRequest, { rejectWithValue }) => {
    try {
      // Use different endpoints based on whether it's login or signup
      const endpoint = data.isLogin
        ? "user/auth/sendmobotp"
        : "user/auth/sendloginotp";
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, {
        mobile: data.phoneNumber,
      });

      return { ...response.data, phoneNumber: data.phoneNumber };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "OTP request failed"
        );
      }
      return rejectWithValue("Network error occurred");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "/user/auth/verifyOtp",
  async (data: VerifyOtpPayload, { rejectWithValue }) => {
    try {
      // Use different endpoints based on whether it's login or signup
      const endpoint = data.isLogin
        ? "user/auth/verifymobile"
        : "user/auth/otplogin";

      const payload = {
        mobile: data.phoneNumber,
        otp: data.otp,
        // ...(data.isLogin ? {} : { userData: data.userData }),
      };

      const response = await axios.post(
        `${API_BASE_URL}/${endpoint}`,
        payload,
        {
          withCredentials: true,
        }
      );

      // Store token in localStorage for persistence
      // localStorage.setItem('token', response.data.token);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "OTP verification failed"
        );
      }
      return rejectWithValue("Network error occurred");
    }
  }
);

export const signUpUser = createAsyncThunk(
  "/user/auth/signup",
  async (credentials: User, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/auth/signup`,
        credentials,
        {
          withCredentials: true,
        }
      );

      // Store token in localStorage for persistence
      // localStorage.setItem('token', response.data.token);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || "Singup failed");
      }
      return rejectWithValue("Network error occurred");
    }
  }
);

export const setOtpForPassword = createAsyncThunk(
  "/user/auth/sendotpforgetpassword",
  async (data: OtpRequest, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/auth/sendotpforgetpassword`,
        {
        mobile: data.phoneNumber,
      }
      );

      return { ...response.data, phoneNumber: data.phoneNumber };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || "Singup failed");
      }
      return rejectWithValue("Network error occurred");
    }
  }
);

export const forgotpassword = createAsyncThunk(
  "/user/auth/forgotpassword",
  async (data: VerifyOtpPayload, { rejectWithValue }) => {
    try {

            const payload = {
        mobile: data.phoneNumber,
        otp: data.otp,
        new_password: data.new_password,
      };

      const response = await axios.post(
        `${API_BASE_URL}/user/auth/forgotpassword`,
        payload,
        {
        withCredentials: true,
      }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || "Settings new password failed");
      }
      return rejectWithValue("Network error occurred");
    }
  }
);

// Corrected logout thunk
export const logout = createAsyncThunk(
  "/user/auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/auth/logout`,
        {}, // Empty object for request body
        {
          withCredentials: true, // This should be in the config object (third parameter)
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  }
);

export const checkAuth = createAsyncThunk(
  "/user/auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      // Make a request to an endpoint that validates the cookie and returns user data
      const response = await axios.get(`${API_BASE_URL}/user/auth/profile`, {
        withCredentials: true,
      });
      if (response.data.code == 200) {
        return response.data;
      } else {
        return rejectWithValue(response.data);
      }
    } catch (error) {
      return rejectWithValue("Not authenticated");
    }
  }
);

export const checkInstaAuth = createAsyncThunk(
  "/instagram/checkInstaAuth",
  async (_, { rejectWithValue }) => {
    try {
      // Make a request to an endpoint that validates the cookie and returns user data
      const response = await axios.get(
        `${API_BASE_URL}/instagram/checkInstaAuth`,
        { withCredentials: true }
      );
      if (response.status == 200) {
        return response.data;
      } else {
        return rejectWithValue(response.data);
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Create the slice
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  // error: null,
  // otpSent: false,
  phoneNumber: "",
  login: false,
  isInstaAuthenticated: false,
  isInstagramFollowersSatisfied: false,
  isInstagramPermissionsSatisfied: false,
  isInstagramReverificationRequired: true,
  isModalOpen: true,
  username: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoginFlow: (state, action: PayloadAction<boolean>) => {
      state.login = action.payload;
    },
    setMobile: (state, action: PayloadAction<string>) => {
      state.phoneNumber = action.payload;
    },
    toggleModal: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login with credentials
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload.code == 200) {
          state.user = action.payload.data;
          state.isAuthenticated = true;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
      });

    // Request OTP
    builder
      .addCase(requestOtp.pending, (state) => {
        state.loading = true;
      })
      .addCase(requestOtp.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.phoneNumber = action.payload.phoneNumber;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.loading = false;
      });

    // Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyOtp.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload.code == 200) {
          state.user = action.payload.data;
          state.isAuthenticated = true;
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
      });

    builder
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signUpUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInstaAuthenticated = false;
      state.isInstagramFollowersSatisfied = false;
      state.isInstagramPermissionsSatisfied = false;
    });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload.code == 200) {
          state.user = action.payload.data;
          state.isAuthenticated = true;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    builder
      .addCase(checkInstaAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        checkInstaAuth.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.isInstaAuthenticated = true;
          state.isInstagramFollowersSatisfied = true;
          state.isInstagramPermissionsSatisfied = true;
          state.isInstagramReverificationRequired = false;
          state.isModalOpen = false;
        }
      )
      .addCase(checkInstaAuth.rejected, (state, action: PayloadAction<any>) => {
        if (action.payload?.response?.data?.code == 422) {
          state.isInstaAuthenticated = true;
          state.isInstagramReverificationRequired = true;
          state.isInstagramFollowersSatisfied = false;
          state.isInstagramPermissionsSatisfied = false;
        }
        if (action.payload?.response?.data?.code == 401) {
          state.isInstaAuthenticated = false;
          //           state.isInstagramFollowersSatisfied = false;
          // state.isInstagramPermissionsSatisfied = false;
        }
        if (action.payload?.response?.data?.code == 416) {
          state.isInstaAuthenticated = true;
          // state.isInstagramFollowersSatisfied = false;
          state.isInstagramReverificationRequired = true;
          state.isInstagramFollowersSatisfied = false;
          state.isInstagramPermissionsSatisfied = true;
        }
        if (action.payload?.response?.data?.code == 403) {
          state.isInstaAuthenticated = true;
          // state.isInstagramPermissionsSatisfied = false;
          state.isInstagramReverificationRequired = true;
           state.isInstagramFollowersSatisfied = true;
          state.isInstagramPermissionsSatisfied = false;
        }
        if(action.payload?.response?.data?.code == 430)
        {
          state.isInstaAuthenticated = true;
          state.isInstagramReverificationRequired = true;
           state.isInstagramPermissionsSatisfied = false;
          state.isInstagramFollowersSatisfied = true;
        }
        state.isModalOpen = true;
        state.loading = false;
      });
  },
});

// Export actions
export const { setLoginFlow, setMobile, toggleModal, setLoading } = authSlice.actions;

// Export selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
// export const selectLogin = (state: RootState) => state.auth.login;
// export const selectAuthError = (state: RootState) => state.auth.error;
// export const selectOtpSent = (state: RootState) => state.auth.otpSent;
export const selectLoginFlow = (state: RootState) => state.auth.login;
export const selectPhoneNumber = (state: RootState) => state.auth.phoneNumber;
export const selectInstaState = (state: RootState) => state.auth.phoneNumber;

export default authSlice.reducer;
