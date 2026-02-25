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
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher' | ''>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Success',
      description: 'Signed in successfully',
    });
    navigate('/');
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    if (!role) {
      toast({
        title: 'Error',
        description: 'Please select role',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: null,
          department: null,
          enrollment_number: null,
          employee_id: null,
        })
        .eq('user_id', data.user.id);

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role,
        });

      if (profileError || roleError) {
        toast({
          title: 'Error',
          description: 'Failed to complete registration',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
      navigate('/');
      return;
    }

    setLoading(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#eff1f5]">
      <div className="grid h-full lg:grid-cols-[2.2fr_1fr]">
        <section className="relative hidden lg:block">
          <img src="/cuk.png" alt="Central University of Kashmir" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/35" />
          <div className="absolute bottom-10 left-8 text-white">
            <h1 className="text-3xl font-semibold tracking-tight">CUK Academic Portal</h1>
            <p className="mt-2 text-[20px] font-light tracking-tight">A smarter way to manage campus academics.</p>
          </div>
        </section>

        <section className="flex h-full items-center justify-center px-4 py-2 lg:px-6 lg:py-2">
          <div className="w-full max-w-[520px] rounded-2xl bg-transparent">
            <div className="text-center">
              <img src="/favicon.ico" alt="CUK logo" className="mx-auto h-14 w-14 object-contain" />
              <h2 className="mt-2 text-[34px] font-semibold tracking-tight text-slate-900">Academic Management Portal</h2>
              <p className="mt-0.5 text-[15px] text-slate-600">Sign into your account</p>
            </div>

            <Tabs defaultValue="signin" className="mt-3 w-full">
              <TabsList className="grid h-10 w-full grid-cols-2 rounded-md bg-[#e8edf5] p-1">
                <TabsTrigger
                  value="signin"
                  className="h-full rounded-sm text-[16px] font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="h-full rounded-sm text-[16px] font-semibold text-slate-600 data-[state=active]:border data-[state=active]:border-[#1d4fb8] data-[state=active]:bg-white data-[state=active]:text-slate-900"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-3">
                <form onSubmit={handleSignIn} className="space-y-2.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email" className="text-[14px] uppercase text-slate-800">
                      Login
                    </Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="User Name / Email"
                      className="h-9 rounded-md border-slate-300 bg-white text-[14px] placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password" className="text-[14px] uppercase text-slate-800">
                      Password
                    </Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="Credentials"
                      className="h-9 rounded-md border-slate-300 bg-white text-[14px] placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[14px] text-slate-700">
                    <label htmlFor="keep-signed-in" className="flex items-center gap-2">
                      <input id="keep-signed-in" type="checkbox" className="h-4 w-4 rounded border-slate-400" />
                      <span>Keep me signed in</span>
                    </label>
                    <a href="#" className="text-[#1d4fb8] hover:underline">
                      Forgot Password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="h-9 w-full rounded-md bg-[#7162bd] text-[16px] font-semibold hover:bg-[#6255aa]"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-3">
                <form onSubmit={handleSignUp} className="space-y-2.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-fullName" className="text-[14px] text-slate-900">
                      Full Name
                    </Label>
                    <Input
                      id="signup-fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your name"
                      className="h-9 rounded-md border-slate-300 bg-white text-[14px] placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-[14px] text-slate-900">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="h-9 rounded-md border-slate-300 bg-white text-[14px] placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-[14px] text-slate-900">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      className="h-9 rounded-md border-slate-300 bg-white text-[14px] placeholder:text-slate-500"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-[14px] text-slate-900">
                      Role
                    </Label>
                    <Select value={role} onValueChange={(value) => setRole(value as 'student' | 'teacher')}>
                      <SelectTrigger id="role" className="h-9 rounded-md border-slate-300 bg-white text-[14px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="h-9 w-full rounded-md bg-[#184cae] text-[16px] font-semibold hover:bg-[#153f92]"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-3 flex items-center gap-2 text-[12px] text-slate-500">
              <img src="/favicon.ico" alt="CUK emblem" className="h-5 w-5 object-contain" />
              <p>© 2026 Central University of Kashmir. All rights reserved.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Auth;
