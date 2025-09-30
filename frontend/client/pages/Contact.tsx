import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  return (
    <section className="bg-space">
      <div className="container mx-auto py-24">
        <h1 className="text-4xl font-bold font-display text-gradient">
          Contact
        </h1>
        <p className="mt-4 text-foreground/70 max-w-2xl">
          Have questions or want to collaborate? Reach out.
        </p>
        <form
          className="mt-10 grid gap-4 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            toast({
              title: "Message sent",
              description: "We will get back to you soon.",
            });
          }}
        >
          <Input required placeholder="Name" />
          <Input required type="email" placeholder="Email" />
          <Textarea required rows={5} placeholder="Message" />
          <Button className="w-fit bg-gradient-to-r from-primary via-accent to-secondary text-black">
            Send
          </Button>
        </form>
      </div>
    </section>
  );
}
