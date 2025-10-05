import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import LiquidEther from "@/components/ui/liquid-ether";

export default function Login() {
  const [username, setUsername] = useState("");
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("User signed in:", user);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  }

  return (
    <div className="relative h-screen w-full">
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={['#06b6d4', '#10b981', '#0891b2']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoSpeed={0.5}
          autoDemo={true}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      <div className="relative z-10 container mx-auto h-full flex items-center justify-center py-16 pointer-events-none">
        <div className="glass glow max-w-md w-full rounded-2xl p-8 pointer-events-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display text-gradient">
              Welcome to Cellexis
            </h1>
            <p className="mt-2 text-sm text-foreground/70">
              Sign in to continue
            </p>
          </div>
          <div className="grid gap-4">
            <Input
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button
              className="w-full h-11 rounded-[10px] bg-gradient-to-r from-primary via-accent to-secondary text-black font-semibold"
              onClick={signInWithGoogle}
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}