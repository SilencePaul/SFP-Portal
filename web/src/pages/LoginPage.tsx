import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/authContext";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // using api call for login

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log("✅ Login successful, received data:", data);
        // Backend sets cookies, just update context state
        login({
          id: data.volunteer.id,
          name: data.volunteer.name,
          email: data.volunteer.email,
          role: Array.isArray(data.volunteer.role)
            ? data.volunteer.role
            : [data.volunteer.role],
        });
        toast.success(`Welcome back, ${data.volunteer.name}!`);

        // Get first role for routing
        const userRole = Array.isArray(data.volunteer.role)
          ? data.volunteer.role[0]
          : data.volunteer.role;

        // Redirect based on role...
        if (userRole === "admin") {
          navigate("/dashboard");
        } else if (userRole === "interviewer") {
          navigate("/applications/manage");
        } else if (userRole === "foster") {
          navigate("/animals/manage");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(data.message || "Invalid email or password");
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FFDF4] dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <img
            src="https://lf-code-agent.coze.cn/obj/x-ai-cn/298572746754/attachment/logo_20251115040913.png"
            alt="Save Fur Pets"
            className="mx-auto h-20 w-auto"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 space-y-6"
        >
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md -space-y-px">
              <div>
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-[#4C51A4] focus:border-[#4C51A4] focus:z-10 text-sm"
                  placeholder="Email address"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-[#4C51A4] focus:border-[#4C51A4] focus:z-10 text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#4C51A4] focus:ring-[#4C51A4] border-gray-300 dark:border-gray-700 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-[#4C51A4] hover:text-[#383C80]"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-white font-medium bg-[#4C51A4] hover:bg-[#383C80] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4C51A4] transition-all ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <i className="fa-solid fa-sign-in mr-2"></i>
                    Sign in
                  </div>
                )}
              </button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm"></div>
          </div>
        </motion.div>

        {/* Mock login credentials info */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mock Login Credentials:
          </h3>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <li>
              <strong>Volunteer (Foster):</strong> foster@example.com{" "}
            </li>
            <li>
              <strong>Volunteer (Interviewer):</strong> interviewer@example.com
            </li>
            <li>
              <strong>Admin:</strong> admin@example.com
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
