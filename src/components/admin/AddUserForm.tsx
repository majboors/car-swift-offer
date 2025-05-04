
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";

const userFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  makeAdmin: z.boolean().default(false),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface AddUserFormProps {
  onSuccess?: () => void;
}

export const AddUserForm = ({ onSuccess }: AddUserFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
      makeAdmin: false,
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      setIsLoading(true);

      // Use the admin add_user edge function to create the user
      const { data: createdUser, error: createError } = await supabase.functions.invoke('admin_add_user', {
        method: 'POST',
        body: { 
          email: data.email,
          password: data.password,
          make_admin: data.makeAdmin
        }
      }) as unknown as {
        data: { id: string } | null,
        error: Error | null
      };

      if (createError) throw createError;
      
      if (!createdUser) {
        throw new Error("Failed to create user");
      }

      // Success notification
      toast({
        title: "Success",
        description: `User ${data.email} has been created${data.makeAdmin ? ' as admin' : ''}`,
      });

      // Reset form
      form.reset({
        email: "",
        password: "",
        makeAdmin: false,
      });

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="makeAdmin"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">Make this user an admin</FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Creating User...
            </>
          ) : (
            "Create User"
          )}
        </Button>
      </form>
    </Form>
  );
};
