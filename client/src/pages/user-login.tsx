import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Heart, Eye, EyeOff, User, UserPlus } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export default function UserLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Registration form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(loginData.email, loginData.password);
      
      if (!result.success) {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting...",
      });
      
      // Redirect will be handled by the App component based on user role
      setLocation('/dashboard');
      
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Registration Failed",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(registerData.name, registerData.email, registerData.password);
      
      if (!result.success) {
        toast({
          title: "Registration Failed",
          description: result.error || "An error occurred during registration. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registration Successful",
        description: "Welcome! You can now create your wedding website.",
      });
      
      // New users go directly to wedding creation
      setLocation('/create-wedding');
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F1F1] to-[#89916B]/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md wedding-card elegant-shadow">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="flex items-center justify-center">
            <Heart className="h-8 w-8 text-[#D4B08C] mr-2" />
            <h1 className="text-2xl font-playfair font-bold text-[#2C3338]">
              LoveStory
            </h1>
          </Link>
          <CardTitle className="text-xl font-playfair text-[#2C3338]">
            Welcome Back
          </CardTitle>
          <p className="text-[#2C3338]/70">
            Sign in to manage your wedding website or create a new account
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Register
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-[#2C3338] font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="wedding-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-[#2C3338] font-semibold">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="wedding-input pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-[#2C3338]/50" />
                      ) : (
                        <Eye className="h-4 w-4 text-[#2C3338]/50" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full wedding-button"
                  disabled={isLoading || !loginData.email || !loginData.password}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-[#2C3338] font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                    className="wedding-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-[#2C3338] font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    className="wedding-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-[#2C3338] font-semibold">
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    className="wedding-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-[#2C3338] font-semibold">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="wedding-input"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full wedding-button"
                  disabled={isLoading || !registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-[#2C3338]/70 hover:text-[#D4B08C] transition-colors">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}