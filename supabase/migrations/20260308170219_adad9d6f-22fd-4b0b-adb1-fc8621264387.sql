
-- Admin can SELECT on all tables
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all user_roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update user_roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert user_roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete user_roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage enrollments" ON public.enrollments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage marks" ON public.marks FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage attendance" ON public.attendance FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage assignments" ON public.assignments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage notices" ON public.notices FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage resources" ON public.resources FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage library_books" ON public.library_books FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage book_issues" ON public.book_issues FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage assignment_submissions" ON public.assignment_submissions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage leave_applications" ON public.leave_applications FOR ALL USING (public.has_role(auth.uid(), 'admin'));
