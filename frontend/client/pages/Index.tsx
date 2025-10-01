import {
  BrainCircuit,
  Share2,
  Telescope,
  Sparkles,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CountUp from "@/components/ui/count-up";
import { useToast } from "@/hooks/use-toast";
import AstronautModel from "@/components/model/astronaut"
import Stars from "@/components/ui/stars"

const ASTRONAUT_URL =
  "https://cdn.builder.io/api/v1/image/assets%2F2c7b56b85f304d7c977ff7daf41b0b6b%2Fbb727473002c4b279783860445cd9b6f?format=webp&width=800";

export default function Index() {
  const { toast } = useToast();

  return (
    <div className="">
      <Stars />
      {/* Hero */}
      <section id="home" className="relative min-h-[77vh] flex items-center">
        <div className="container  mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative z-50 text-center lg:text-left">
            <h1 className="text-[60px] leading-[60px]">
              <span
                className="text-gradient"
                style={{
                  fontFamily: '"Noto Serif Ottoman Siyaq", "Noto Serif", serif',
                }}
              >
                Cellexis: Unlocking Space Biology with AI
              </span>
            </h1>
            <p className="mt-6 text-lg text-foreground/80 max-w-xl mx-auto lg:mx-0">
              Explore 608 NASA bioscience publications through intelligent
              summaries and knowledge graphs.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary via-accent to-secondary text-black glow rounded-[10px] font-semibold text-sm leading-5 px-8"
                  style={{ fontFamily: '"Noto Sans Batak", sans-serif' }}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute z-10 w-full flex justify-center lg:justify-end">
            <AstronautModel />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto">
          <h2
            className="text-3xl sm:text-4xl text-center text-gradient"
            style={{ fontFamily: '"Noto Serif Thai", serif' }}
          >
            Features
          </h2>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<BrainCircuit />}
              title="AI-powered Summaries"
              desc="Digest complex research instantly with LLM-curated overviews."
            />
            <FeatureCard
              icon={<Share2 />}
              title="Interactive Knowledge Graphs"
              desc="Navigate entities, genes, missions and relationships visually."
            />
            <FeatureCard
              icon={<Telescope />}
              title="Explore NASA Bioscience"
              desc="Search across missions, organisms, conditions and outcomes."
            />
            <FeatureCard
              icon={<Sparkles />}
              title="Discover Insights & Impacts"
              desc="Surface patterns, trends and actionable findings."
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="statistics" className="py-20 font-sans">
        <div className="container mx-auto">
          <div className="grid gap-8 sm:grid-cols-3">
            <Stat
              icon={<FileText />}
              value={<CountUp end={608} suffix="+" />}
              label="Publications"
            />
            <Stat
              icon={<Sparkles />}
              value={<CountUp end={1000} suffix="+" />}
              label="Key Findings"
            />
            <Stat
              icon={<Telescope />}
              value={<CountUp end={50} suffix="+" />}
              label="Research Categories"
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3
              className="text-3xl text-gradient"
              style={{ fontFamily: '"Noto Serif Tamil", serif' }}
            >
              Contact
            </h3>
            <p className="mt-4 text-foreground/70 max-w-prose">
              Have questions or want to collaborate? Reach out.
            </p>
          </div>
          <form
            className="glass rounded-xl p-6 grid gap-4"
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
            <Textarea required rows={6} placeholder="Message" />
            <div>
              <Button className="bg-gradient-to-r from-primary via-accent to-secondary text-black">
                Send
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="glass rounded-xl p-6 border border-border/60">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-foreground/70">{desc}</p>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="glass rounded-xl p-6 text-center">
      <div className="flex justify-center text-accent mb-2">{icon}</div>
      <div className="text-4xl font-extrabold font-display">{value}</div>
      <div className="text-sm text-foreground/70 mt-1">{label}</div>
    </div>
  );
}
