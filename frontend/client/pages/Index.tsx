import {
  BrainCircuit,
  Share2,
  Telescope,
  Sparkles,
  FileText,
  AlertTriangle,
  Lightbulb,
  Target,
  Cog,
  TrendingUp,
  Database,
  Search,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CountUp from "@/components/ui/count-up";
import { useToast } from "@/hooks/use-toast";
import AstronautModel from "@/components/model/astronaut"
import PurplePlanet from "@/components/model/purple-planet"
import BlackPlanet from "@/components/model/black-planet"
import BluePlanet from "@/components/model/blue-planet"
import WhitePlanet from "@/components/model/white-planet"
import WhitePinkPlanet from "@/components/model/white-pink-plt"
import BluePinkPlanet from "@/components/model/blue-pink-planet"
import BrownPlanet from "@/components/model/brown-plt"
import BlueBrownPlanet from "@/components/model/blue-brown-plt"
import Stars from "@/components/ui/stars"
import InstallButton from "@/components/ui/InstallButton"

const ASTRONAUT_URL =
  "https://cdn.builder.io/api/v1/image/assets%2F2c7b56b85f304d7c977ff7daf41b0b6b%2Fbb727473002c4b279783860445cd9b6f?format=webp&width=800";

export default function Index() {
  const { toast } = useToast();

  return (
    <div className="">
      <Stars />
      {/* Hero */}
      <section id="home" className="relative min-h-[77vh] overflow-hidden w-[100%] flex items-center">
        <div className="container  mx-auto flex gap-10 items-center">
          <div className="relative z-20 text-center lg:text-left">
            <h1 className="text-5xl md:text-[60px] md:leading-[60px] md:w-[70%]">
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
                <InstallButton />
              </Link>
            </div>
          </div>
          <div className="absolute hidden md:block z-10 w-[100vw] flex justify-center lg:justify-end">
            <AstronautModel />
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section id="problem" className="py-24 bg-background/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-center text-center mb-16 w-full">
            <div className="w-1/3 hidden lg:block">
              <WhitePlanet />
            </div>
            <div className="w-full lg:w-1/3">
              <h2
                className="text-3xl sm:text-4xl text-gradient mb-6"
                style={{ fontFamily: '"Noto Serif Thai", serif' }}
              >
                The Challenge
              </h2>
              <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
                Space biology research is advancing rapidly, but critical knowledge remains locked away in scattered publications
              </p>
            </div>
            <div className="w-1/3 hidden lg:block">
              <BluePlanet />
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProblemCard
              icon={<AlertTriangle />}
              title="Information Overload"
              desc="608+ NASA bioscience publications are difficult to navigate and synthesize for researchers and mission planners."
            />
            <ProblemCard
              icon={<Search />}
              title="Time-Intensive Research"
              desc="Scientists spend countless hours manually searching through papers to find relevant findings for their specific research."
            />
            <ProblemCard
              icon={<Database />}
              title="Disconnected Knowledge"
              desc="Related findings across different missions and experiments remain isolated, preventing breakthrough insights."
            />
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="py-24">
        <div className="container mx-auto">

          <div className="flex items-center justify-center text-center mb-16 w-full">
            <div className="w-1/3 hidden lg:block"><PurplePlanet /></div>
            <div>
              <h2
                className="text-3xl sm:text-4xl text-gradient mb-6"
                style={{ fontFamily: '"Noto Serif Thai", serif' }}
              >
                Our Solution
              </h2>
              <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
                Cellexis leverages RAG (Retrieval-Augmented Generation) and LLMs to make space biology knowledge instantly accessible
              </p>
            </div>
            <div className="w-1/3 hidden lg:block"><BlackPlanet /></div>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <SolutionFeature
                icon={<BrainCircuit />}
                title="RAG-Powered Knowledge Base"
                desc="Advanced retrieval system that understands context and delivers precise answers from the entire corpus of NASA bioscience publications."
              />
              <SolutionFeature
                icon={<MessageSquare />}
                title="Conversational AI Interface"
                desc="Natural language queries get instant, accurate responses with source citations, making research as easy as asking a question."
              />
              <SolutionFeature
                icon={<Share2 />}
                title="Interactive Knowledge Graphs"
                desc="Visualize connections between missions, organisms, genes, and findings to discover hidden relationships and patterns."
              />
            </div>
            <div className="glass rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4">Technical Architecture</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Vector embeddings of 608 NASA publications</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Semantic search with similarity matching</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>LLM-generated contextual responses</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Neo4j knowledge graph visualization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="py-24 bg-background/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-center text-center mb-16 w-full">
            <div className="w-1/3 hidden lg:block">
              <WhitePinkPlanet />
            </div>
            <div >
              <div className="text-center mb-16">
                <h2
                  className="text-3xl sm:text-4xl text-gradient mb-6"
                  style={{ fontFamily: '"Noto Serif Thai", serif' }}
                >
                  Impact & Benefits
                </h2>
                <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
                  Accelerating space biology research and mission planning for NASA and the scientific community
                </p>
              </div>
            </div>
            <div className="w-1/3 hidden lg:block">
              <BluePinkPlanet />
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ImpactCard
              icon={<Target />}
              title="Research Acceleration"
              desc="Reduce literature review time from weeks to minutes"
              metric="90% faster"
            />
            <ImpactCard
              icon={<Lightbulb />}
              title="Discovery Enhancement"
              desc="Surface hidden connections across missions and experiments"
              metric="3x more insights"
            />
            <ImpactCard
              icon={<Telescope />}
              title="Mission Planning"
              desc="Inform future space biology experiments with comprehensive historical data"
              metric="Better decisions"
            />
            <ImpactCard
              icon={<Sparkles />}
              title="Knowledge Democratization"
              desc="Make complex space biology accessible to students and researchers"
              metric="Universal access"
            />
          </div>
        </div>
      </section>

      {/* Feasibility */}
      <section id="feasibility" className="py-24">
        <div className="container mx-auto">
          <div className="flex items-center justify-center text-center mb-16 w-full">
            <div className="w-1/3 hidden lg:block">
              <BrownPlanet />
            </div>
            <div>
              <div className="text-center mb-16">
                <h2
                  className="text-3xl sm:text-4xl text-gradient mb-6"
                  style={{ fontFamily: '"Noto Serif Thai", serif' }}
                >
                  Technical Feasibility
                </h2>
                <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
                  Built on proven technologies with a clear implementation roadmap
                </p>
              </div>
            </div>
            <div className="w-1/3 hidden lg:block">
                <BlueBrownPlanet />
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 mx-auto">
                <Cog size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Proven Technology Stack</h3>
              <ul className="space-y-2 text-sm text-foreground/80 text-left">
                <li>• OpenAI/Anthropic LLMs for natural language processing</li>
                <li>• Vector databases (Pinecone/Weaviate) for semantic search</li>
                <li>• Neo4j for knowledge graph visualization</li>
                <li>• React/FastAPI for scalable web interface</li>
              </ul>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4 mx-auto">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Data Pipeline</h3>
              <ul className="space-y-2 text-sm text-foreground/80 text-left">
                <li>• Automated PDF parsing and text extraction</li>
                <li>• Entity recognition for genes, organisms, missions</li>
                <li>• Embedding generation for semantic similarity</li>
                <li>• Real-time indexing and search capabilities</li>
              </ul>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-4 mx-auto">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-4">MVP to Production</h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>• Phase 1: Core RAG system (4 weeks)</li>
                <li>• Phase 2: Knowledge graph integration (6 weeks)</li>
                <li>• Phase 3: Advanced analytics (8 weeks)</li>
                <li>• Phase 4: NASA integration & scaling (12 weeks)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Scalability */}
      <section id="scalability" className="py-24 bg-background/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl text-gradient mb-6"
              style={{ fontFamily: '"Noto Serif Thai", serif' }}
            >
              Scalability & Future Vision
            </h2>
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
              Designed to grow with NASA's expanding research portfolio and broader scientific community needs
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-primary" size={20} />
                  </div>
                  Horizontal Scaling
                </h3>
                <div className="space-y-3">
                  <ScalabilityPoint title="Multi-Domain Expansion" desc="Extend beyond bioscience to physics, engineering, and planetary science publications" />
                  <ScalabilityPoint title="Real-time Integration" desc="Connect with active NASA missions for live data ingestion and analysis" />
                  <ScalabilityPoint title="Global Research Network" desc="Partner with international space agencies and universities worldwide" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Cog className="text-accent" size={20} />
                  </div>
                  Technical Scaling
                </h3>
                <div className="space-y-3">
                  <ScalabilityPoint title="Cloud Infrastructure" desc="Auto-scaling compute resources for peak research periods" />
                  <ScalabilityPoint title="Distributed Processing" desc="Parallel document processing and embedding generation" />
                  <ScalabilityPoint title="API Ecosystem" desc="Open APIs for third-party integrations and research tools" />
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-6">Growth Metrics & Targets</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Publications Coverage</span>
                    <span className="text-sm text-primary">608 → 10K+</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Research Domains</span>
                    <span className="text-sm text-accent">1 → 5+</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div className="bg-gradient-to-r from-accent to-secondary h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Global Users</span>
                    <span className="text-sm text-secondary">0 → 50K+</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </div>
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
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-center">{title}</h3>
      <p className="mt-2 text-sm text-foreground/70 text-center">{desc}</p>
    </div>
  );
}

function ProblemCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="glass rounded-xl p-6 border border-accent/20">
      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-center">{title}</h3>
      <p className="mt-2 text-sm text-foreground/70 text-center">{desc}</p>
    </div>
  );
}

function SolutionFeature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-foreground/70">{desc}</p>
      </div>
    </div>
  );
}

function ImpactCard({
  icon,
  title,
  desc,
  metric,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  metric: string;
}) {
  return (
    <div className="glass rounded-xl p-6 text-center">
      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-foreground/70 mb-3">{desc}</p>
      <div className="text-primary font-semibold text-sm">{metric}</div>
    </div>
  );
}

function ScalabilityPoint({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-foreground/70 mt-1">{desc}</p>
      </div>
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
      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-2 mx-auto">
        {icon}
      </div>
      <div className="text-4xl font-extrabold font-display">{value}</div>
      <div className="text-sm text-foreground/70 mt-1">{label}</div>
    </div>
  );
}
