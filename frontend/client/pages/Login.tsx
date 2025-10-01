import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  return (
    <div className="bg-space min-h-screen flex items-center">
      <div className="container mx-auto grid place-items-center py-16">
        <div className="glass glow max-w-md w-full rounded-2xl p-8">
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
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button
              className="w-full h-11 rounded-[10px] bg-gradient-to-r from-primary via-accent to-secondary text-black font-semibold"
              onClick={() => navigate("/dashboard")}
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
