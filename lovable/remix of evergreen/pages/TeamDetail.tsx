import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getTeamMemberBySlug } from "@/data/team";
import { ChevronLeft, Mail, Heart, Sprout } from "lucide-react";

const TeamDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const member = slug ? getTeamMemberBySlug(slug) : undefined;

  if (!member) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Team Member Not Found</h1>
            <p className="text-muted-foreground mb-6">The person you're looking for doesn't exist.</p>
            <Link to="/about" className="text-primary hover:underline">← Back to About</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = member.name.split(" ").map((n) => n[0]).join("");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="bg-primary py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <Link to="/about" className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-6 text-sm">
              <ChevronLeft className="w-4 h-4" /> About
            </Link>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-primary-foreground">{initials}</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary-foreground">
                  {member.name}
                </h1>
                <p className="text-lg text-primary-foreground/80">{member.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          {/* Bio */}
          <section className="mb-12">
            {member.fullBio.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed text-muted-foreground mb-4">
                {paragraph}
              </p>
            ))}
          </section>

          {/* Background */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Background</h2>
            <ul className="space-y-2">
              {member.background.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Fun facts */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-muted rounded-sm p-6">
              <Heart className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Fun Fact</p>
              <p className="text-sm text-foreground leading-relaxed">{member.funFact}</p>
            </div>
            <div className="bg-muted rounded-sm p-6">
              <Sprout className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Favorite Thing to Grow</p>
              <p className="text-sm text-foreground leading-relaxed">{member.favoriteGrow}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="border border-border rounded-sm p-6 flex items-center gap-4">
            <Mail className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Get in touch with {member.name.split(" ")[0]}</p>
              <a href={`mailto:${member.email}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {member.email}
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeamDetail;
