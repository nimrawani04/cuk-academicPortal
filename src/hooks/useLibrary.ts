import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type LibraryBook = Tables<'library_books'>;
export type BookIssue = Tables<'book_issues'>;

export function useLibraryBooks() {
  return useQuery({
    queryKey: ['library-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('library_books')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data as LibraryBook[];
    },
  });
}

export function useStudentBookIssues() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-book-issues', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('book_issues')
        .select('*, library_books(*)')
        .eq('student_id', user.id)
        .order('issued_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useIssueBook() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, dueDate }: { bookId: string; dueDate: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Check available copies
      const { data: book, error: bookError } = await supabase
        .from('library_books')
        .select('available_copies')
        .eq('id', bookId)
        .single();
      
      if (bookError) throw bookError;
      if (!book || book.available_copies <= 0) {
        throw new Error('Book not available');
      }

      // Create issue record
      const { data, error } = await supabase
        .from('book_issues')
        .insert({
          book_id: bookId,
          student_id: user.id,
          due_date: dueDate,
        })
        .select()
        .single();
      
      if (error) throw error;

      // Update available copies
      await supabase
        .from('library_books')
        .update({ available_copies: book.available_copies - 1 })
        .eq('id', bookId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      queryClient.invalidateQueries({ queryKey: ['student-book-issues'] });
    },
  });
}

export function useReturnBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issueId: string) => {
      // Get the issue record
      const { data: issue, error: issueError } = await supabase
        .from('book_issues')
        .select('book_id')
        .eq('id', issueId)
        .single();
      
      if (issueError) throw issueError;

      // Update issue status
      const { data, error } = await supabase
        .from('book_issues')
        .update({
          status: 'returned',
          return_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', issueId)
        .select()
        .single();
      
      if (error) throw error;

      // Get current copies and increment
      const { data: book } = await supabase
        .from('library_books')
        .select('available_copies')
        .eq('id', issue.book_id)
        .single();

      if (book) {
        await supabase
          .from('library_books')
          .update({ available_copies: book.available_copies + 1 })
          .eq('id', issue.book_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      queryClient.invalidateQueries({ queryKey: ['student-book-issues'] });
    },
  });
}
