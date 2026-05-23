import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTicket } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Please provide more detail"),
  category: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select a priority"),
});

type FormData = z.infer<typeof schema>;

export default function SubmitTicket() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createTicket = useCreateTicket();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", category: "", priority: "medium" },
  });

  function onSubmit(data: FormData) {
    createTicket.mutate(
      { data: { ...data, status: "open" } },
      {
        onSuccess: (ticket) => {
          toast({ title: "Ticket submitted", description: `Ticket #${ticket.id} has been created. We'll be in touch shortly.` });
          setLocation("/my-tickets");
        },
        onError: () => {
          toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/my-tickets">
          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Submit a Request</h1>
          <p className="text-muted-foreground text-sm">Tell us what you need and we'll get back to you</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Request details</CardTitle>
          <CardDescription>The more detail you provide, the faster we can help.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Cannot connect to VPN from home"
                        {...field}
                        data-testid="input-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Hardware">Hardware</SelectItem>
                          <SelectItem value="Software">Software</SelectItem>
                          <SelectItem value="Network">Network</SelectItem>
                          <SelectItem value="Access">Access & Permissions</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low — no immediate impact</SelectItem>
                          <SelectItem value="medium">Medium — some disruption</SelectItem>
                          <SelectItem value="high">High — blocking my work</SelectItem>
                          <SelectItem value="urgent">Urgent — complete outage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what's happening, when it started, and any steps you've already tried..."
                        rows={5}
                        {...field}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between pt-2">
                <Link href="/my-tickets">
                  <Button type="button" variant="outline" data-testid="button-cancel">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={createTicket.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-testid="button-submit"
                >
                  {createTicket.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Submit Request
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
