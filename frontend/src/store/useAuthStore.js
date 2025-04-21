import { create } from "zustand"
import { axiosInstance } from "../lib/axios.js"
import toast from "react-hot-toast"
import { io } from "socket.io-client"



const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/"


export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,


  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check")

      set({ authUser: res.data })

      get().connectSocket()
    } catch (error) {
      console.log("Error checkAuth: ", error)
      set({ authUser: null })
    } finally {
      set({ isCheckingAuth: false })
    }
  },




  signup: async (data) => {
    set({ isSigningUp: true })
    try {
      const res = await axiosInstance.post("/auth/signup", data)
      set({ authUser: res.data })
      toast.success("Signup was successful")

      get().connectSocket()
    } catch (error) {
      toast.error(error.response.data.message)
      console.log("Error in signup function useAuthStore: ", error)
    } finally {
      set({ isSigningUp: false })
    }
  },




  login: async (data) => {
    set({ isLoggingIn: true })
    try {
      const res = await axiosInstance.post("/auth/login", data)
      set({ authUser: res.data })
      toast.success("Logged in successfully")

      get().connectSocket()
    } catch (error) {
      console.log("Error in login function useAuthStore")
      toast.error(error.response.data.message)
    } finally {
      set({ isLoggingIn: false })
    }
  },




  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout")
      set({ authUser: null })
      toast.success("Logged out succseefully")
      get().disconnectSocket()
    } catch (error) {
      toast.error(error.response.data.message)
      console.log("Error in logout function useAuthStore: ", error)
    }
  },


  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in updateProfile function useAuthStore: ", error);
      
      // Safely access error message
      const errorMessage =
        error?.response?.data?.message || "Image to large, try uploading a PNG or JPEG image.";
        
      toast.error(errorMessage);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  



  connectSocket: () => {
    const { authUser } = get()
    if (!authUser || get().socket?.connected) return
    
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id
      }
    })
    socket.connect()
    set({ socket:socket })

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds })
    })
  },



  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect()
  },


}))

