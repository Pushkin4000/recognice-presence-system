
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, CheckCircle, Shield, Clock } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      title: "Facial Recognition",
      description: "Fast and accurate facial recognition for attendance tracking",
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
    },
    {
      title: "Secure Authentication",
      description: "Multi-layered security to protect sensitive attendance data",
      icon: <Shield className="h-6 w-6 text-primary" />,
    },
    {
      title: "Real-time Tracking",
      description: "Track attendance in real-time with detailed reporting",
      icon: <Clock className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl">FacePresence</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                Smart Attendance Management System
              </h1>
              <p className="text-xl text-muted-foreground mb-8 animate-slide-in" style={{ animationDelay: "0.2s" }}>
                Streamline your attendance tracking with advanced facial recognition technology
              </p>
              <div className="flex flex-wrap justify-center gap-4 animate-slide-in" style={{ animationDelay: "0.4s" }}>
                <Link to="/register">
                  <Button size="lg" className="gap-2">
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border bg-card shadow-lg animate-scale-in" style={{ animationDelay: "0.6s" }}>
              <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <div className="glass-morphism rounded-lg p-8 max-w-md text-center">
                  <h2 className="text-2xl font-bold mb-4">Face Recognition Demo</h2>
                  <p className="mb-6 text-muted-foreground">
                    Our system uses advanced facial recognition to accurately mark attendance in seconds.
                  </p>
                  <img 
                    src="/placeholder.svg" 
                    alt="Face Recognition Demo" 
                    className="rounded-md mx-auto"
                    width={300}
                    height={200}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary/50">
          <div className="container px-4 mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-all border animate-slide-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="mb-4 rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 border-t">
        <div className="container px-4 mx-auto text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} FacePresence. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
