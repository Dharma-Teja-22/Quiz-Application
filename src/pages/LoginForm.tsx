import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {jwtDecode} from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRound, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";
import hubbleService from "@/services/hubble.service";
import { useGameStore } from '../store/gameStore';
import dsLogo from '../assets/Digital_Summit_24_Logo_Dark.svg'


const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data : any) => {
    setIsLoading(true);
    try {
      const response = await hubbleService.post.authHubbleLogin(data);
      console.log(response);

      if (
        response.status === 200 &&
        response.data.message === "Successfully logged in!"
      ) {
        const decodedToken : {firstName : string,profilePic : string} = jwtDecode(response.data.token);
        const firstName = decodedToken.firstName || data.username;
        const profilePic = decodedToken.profilePic;
        localStorage.setItem(
          "userData",
          JSON.stringify({ username: firstName,profilePic })
        );
        toast({
          title: "Login successful!",
          description: "You have been successfully logged in.",
          duration: 2000,
        });
        localStorage.setItem("userId", data.username);
        localStorage.setItem("userName", firstName);
        // setAuthenticated(true);
        useGameStore.getState().setIsAuthenticated(true)
        navigate("/create");
      } else {
        toast({
          title: "Login failed",
          description: "Please check your username and password.",
          variant: "destructive",
          duration: 2000,
        });
      }

    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center h-full">
            <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-md">
      {/* <div className="flex justify-center mb-4">
        <span className="text-5xl font-bold text-miracle-darkBlue">
          <span className="text-miracle-lightBlue">Quiz </span>Master
        </span>
      </div> */}
                <div className='flex justify-center'>
          <img src={dsLogo} width={100} alt="" />
          </div>
      {/* <hrjj className="border-b border-[#B7B2B3] mb-6 sm:mb-8" /> */}

      <h2 className="text-4xl font-bold text-miracle-darkBlue mb-2 text-center">
        SIGN IN
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6"
      >
        <div className="space-y-2 relative">
          <Label htmlFor="username" className="text-sm sm:text-base">
            Username
          </Label>
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              id="username"
              placeholder="Username"
              className="pl-10 text-sm sm:text-base"
              {...register("username")}
            />
          </div>
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="password" className="text-sm sm:text-base">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="pl-10 pr-10 text-sm sm:text-base"
              {...register("password")}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-[#2368A0] hover:bg-[#2368A0]/90 text-sm sm:text-base py-2 sm:py-3"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>

      </form>
      <div className="mt-6 sm:mt-8 text-center text-[10px] xs:text-xs sm:text-sm text-gray-600">
        © 2024 Miracle Software Systems, Inc.
      </div>
    </div>
    </div>
  );
}