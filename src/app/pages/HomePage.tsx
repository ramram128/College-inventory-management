import { PageLayout } from "../components/PageLayout";
import { Link } from "react-router";
import { ArrowRight, FlaskConical, Cpu, Dna, Atom, Zap, Monitor, Settings2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const researchAreas = [
  { icon: FlaskConical, title: "Chemistry Laboratory", description: "Advanced analytical and synthetic chemistry facilities" },
  { icon: Dna, title: "Biomedical Laboratory", description: "Molecular biology and genetic research equipment" },
  { icon: Zap, title: "Electrical and Electronics Engineering Laboratory", description: "Power systems and renewable energy research" },
  { icon: Cpu, title: "Electronics and Communication Engineering Laboratory", description: "Semiconductor and embedded systems development" },
  { icon: Atom, title: "Physics Laboratory", description: "Nanomaterials and advanced materials characterization" },
  { icon: Monitor, title: "Computing Laboratory", description: "High-performance computing and data analysis facilities" },
  { icon: Settings2, title: "Mechanical Engineering Laboratory", description: "Fluid mechanics, robotics and thermodynamics research" },
];

function TypedContent({ text }: { text: string }) {
  const words = text.split(" ");
  let charIndex = 0;

  return (
    <span className="typed-content inline-block align-top" aria-label={text}>
      {words.map((word, wordIndex) => {
        const currentWordIndex = charIndex;
        charIndex += word.length + 1;

        return [
          <span key={`word-${wordIndex}`} className="inline-block whitespace-nowrap">
            {Array.from(word).map((character, i) => (
              <span
                key={`${character}-${currentWordIndex + i}`}
                aria-hidden="true"
                className="typed-char relative inline-block"
                style={{ animationDelay: `${(currentWordIndex + i) * 0.06}s` }}
              >
                {character}
              </span>
            ))}
          </span>,
          wordIndex < words.length - 1 ? (
            <span key={`space-${wordIndex}`} aria-hidden="true" className="inline-block w-[0.3em]" />
          ) : null,
        ];
      })}
    </span>
  );
}

export function HomePage() {
  return (
    <div className="h-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-cyan-50 py-20 px-4 sm:px-6 lg:px-9 min-h-full flex items-center">
        <div className="max-w-8xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                <TypedContent text="Mahendra College of Engineering" />
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                <span className="text-3xl font-medium text-gray-800">Research & Development Center</span>
                <br />
                Empowering Innovation, Driving Excellence in Research.<br /> Our state-of-the-art facilities provide researchers and students with the tools needed to push the boundaries of science and technology.

              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="group" asChild>
                  <Link to="/facilities">
                    Explore Facilities
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1707944746058-4da338d0f827?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwbGFib3JhdG9yeSUyMHJlc2VhcmNofGVufDF8fHx8MTc3MjQ0OTYxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Science laboratory research"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
