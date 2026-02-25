import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | ''>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast({
        title: 'Role required',
        description: 'Please select a role.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role });

        if (roleError) throw roleError;

        toast({
          title: 'Account created!',
          description: 'Please check your email for verification.',
        });

        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efeff1] lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen lg:h-full lg:grid-cols-[2fr_1fr]">
        <section className="relative hidden lg:block lg:h-full">
          <img
            src="/cuk.png"
            alt="Central University of Kashmir campus"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
          <div className="absolute bottom-10 left-8 max-w-xl text-white">
            <h2 className="text-3xl font-medium leading-tight tracking-wide">CUK Academic Portal</h2>
            <p className="mt-2 text-xl text-white/90">A smarter way to manage campus academics.</p>
          </div>
        </section>

        <section className="flex h-full items-center justify-center px-6 py-4 sm:px-10 lg:px-12">
          <div className="flex w-full max-w-md flex-col justify-center">
            <div className="mb-5 text-center">
              <img src="/favicon.ico" alt="CUK logo" className="mx-auto h-12 w-12 rounded-md object-contain" />
              <h1 className="mt-3 text-2xl font-semibold text-slate-900">Academic Management Portal</h1>
              <p className="mt-1 text-base text-slate-600">Sign into your account</p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-2 bg-slate-100">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-0">
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="signin-email"
                      className="text-xs font-semibold uppercase tracking-wide text-slate-700"
                    >
                      Login
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="User Name / Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signin-password"
                      className="text-xs font-semibold uppercase tracking-wide text-slate-700"
                    >
                      Password
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Credentials"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 border-slate-300"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <label htmlFor="remember-me" className="flex items-center gap-2 text-slate-700">
                      <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                      Keep me signed in
                    </label>
                    <button type="button" className="text-primary hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                  <Button
                    type="submit"
                    className="h-11 w-full bg-[#6f5eb3] text-white hover:bg-[#5f4ea4]"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      type="text"
                      placeholder="Enter your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as 'student' | 'teacher')}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="mt-8 h-10 w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-5 flex items-center gap-3 text-xs text-slate-500">
              <img src="/favicon.ico" alt="" className="h-7 w-7 opacity-40" />
              <p>© 2026 Central University of Kashmir. All rights reserved.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Auth;
